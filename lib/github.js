import * as cheerio from 'cheerio';

const DEFAULT_USERNAME = 'Dashintha-Prabashwara';

/**
 * Returns standard headers for GitHub API requests.
 */
export function getGithubHeaders(token) {
  const authToken = token || process.env.GITHUB_TOKEN;
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Portfoliov2-DevOps-Engine',
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
}

/**
 * Check rate limit and token status
 */
export async function checkRateLimit(token) {
  try {
    const res = await fetch('https://api.github.com/rate_limit', {
      headers: getGithubHeaders(token),
      cache: 'no-store',
    });
    if (!res.ok) {
      return { limit: 60, remaining: 0, reset: null, error: `Status ${res.status}` };
    }
    const data = await res.json();
    return {
      limit: data.rate?.limit || 60,
      remaining: data.rate?.remaining || 0,
      reset: data.rate?.reset ? new Date(data.rate.reset * 1000).toISOString() : null,
    };
  } catch (error) {
    return { limit: 60, remaining: 0, reset: null, error: error.message };
  }
}

/**
 * Fetch profile data and repositories:
 * Strictly personal repositories (owned by user, public & private) +
 * repositories actively contributed to (via GraphQL commits & PRs, or custom additions in CMS).
 */
export async function fetchUserProfileAndRepos(username = DEFAULT_USERNAME, token = '', options = {}) {
  const headers = getGithubHeaders(token);
  const authToken = token || process.env.GITHUB_TOKEN;
  const { customContributedRepos = [], excludedContributedRepos = [] } = options;

  let personalRepos = [];

  // 1. Fetch personal repositories (public + private if token is present)
  if (authToken) {
    try {
      const authReposRes = await fetch(
        'https://api.github.com/user/repos?affiliation=owner&visibility=all&per_page=100&sort=updated',
        { headers, cache: 'no-store' }
      );
      if (authReposRes.ok) {
        const data = await authReposRes.json();
        if (Array.isArray(data) && data.length > 0) {
          personalRepos = data;
        }
      }
    } catch (err) {
      console.warn('Authenticated /user/repos fetch failed, falling back:', err.message);
    }
  }

  // Fallback to public repos if not loaded
  if (personalRepos.length === 0) {
    try {
      const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, {
        headers,
        cache: 'no-store',
      });
      if (reposRes.ok) {
        personalRepos = await reposRes.json();
      }
    } catch (e) {
      console.warn('Public repos fetch failed:', e.message);
    }
  }

  // 2. Fetch user profile
  const userRes = await fetch(`https://api.github.com/users/${username}`, {
    headers,
    cache: 'no-store',
  });

  if (!userRes.ok) {
    throw new Error(`GitHub user fetch failed: ${userRes.status} ${userRes.statusText}`);
  }

  const user = await userRes.json();

  // 3. Fetch repositories user actively contributed to (commits & PRs) via GraphQL
  let contributedRepos = [];
  if (authToken) {
    try {
      const query = `
        query {
          viewer {
            repositoriesContributedTo(first: 100, contributionTypes: [COMMIT, PULL_REQUEST, REPOSITORY]) {
              nodes {
                name
                nameWithOwner
                description
                url
                isPrivate
                stargazerCount
                forkCount
                primaryLanguage {
                  name
                }
                languages(first: 5, orderBy: {field: SIZE, direction: DESC}) {
                  edges {
                    size
                    node {
                      name
                    }
                  }
                }
              }
            }
          }
        }
      `;
      const gqlRes = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Portfoliov2-DevOps-Engine',
        },
        body: JSON.stringify({ query }),
        cache: 'no-store',
      });
      if (gqlRes.ok) {
        const json = await gqlRes.json();
        const nodes = json.data?.viewer?.repositoriesContributedTo?.nodes || [];
        contributedRepos = nodes.map((n) => ({
          name: n.name,
          fullName: n.nameWithOwner,
          description: n.description || '',
          url: n.url,
          isPrivate: n.isPrivate,
          stars: n.stargazerCount || 0,
          forks: n.forkCount || 0,
          primaryLanguage: n.primaryLanguage?.name || '',
          languages: n.languages?.edges?.map((e) => e.node.name) || [],
          source: 'graphql',
        }));
      }
    } catch (err) {
      console.warn('GraphQL contributed repos fetch failed:', err.message);
    }
  }

  // 4. Handle custom contributed repos from CMS (e.g. 'owner/repo' handles specified by user)
  if (Array.isArray(customContributedRepos) && customContributedRepos.length > 0) {
    for (const customHandle of customContributedRepos) {
      const clean = customHandle.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
      if (!clean) continue;
      const alreadyIncluded =
        personalRepos.some((r) => r.full_name?.toLowerCase() === clean.toLowerCase()) ||
        contributedRepos.some((r) => r.fullName?.toLowerCase() === clean.toLowerCase());
      if (alreadyIncluded) continue;

      try {
        const cRes = await fetch(`https://api.github.com/repos/${clean}`, { headers, cache: 'no-store' });
        if (cRes.ok) {
          const cData = await cRes.json();
          contributedRepos.push({
            name: cData.name,
            fullName: cData.full_name,
            description: cData.description || '',
            url: cData.html_url,
            isPrivate: cData.private,
            stars: cData.stargazers_count || 0,
            forks: cData.forks_count || 0,
            primaryLanguage: cData.language || '',
            languages: cData.language ? [cData.language] : [],
            source: 'custom',
          });
        }
      } catch (cErr) {
        console.warn(`Failed fetching custom repo ${clean}:`, cErr.message);
      }
    }
  }

  // 5. Filter out excluded repos
  const excludedSet = new Set((excludedContributedRepos || []).map((s) => s.toLowerCase().trim()));
  const activeContributedRepos = contributedRepos.filter(
    (cr) => !excludedSet.has(cr.fullName.toLowerCase())
  );

  // 6. Aggregate stats strictly for user: Personal + Contributed (commits/PRs)
  let totalStars = 0;
  let totalForks = 0;
  const languageCounts = {};

  // Personal repositories
  if (Array.isArray(personalRepos)) {
    personalRepos.forEach((repo) => {
      totalStars += repo.stargazers_count || 0;
      totalForks += repo.forks_count || 0;
      if (repo.language) {
        languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
      }
    });
  }

  // Contributed repositories (exclude if user already owns it)
  activeContributedRepos.forEach((repo) => {
    const isOwned = personalRepos.some(
      (pr) => pr.full_name?.toLowerCase() === repo.fullName.toLowerCase()
    );
    if (!isOwned) {
      totalStars += repo.stars || 0;
      totalForks += repo.forks || 0;
      if (repo.primaryLanguage) {
        languageCounts[repo.primaryLanguage] = (languageCounts[repo.primaryLanguage] || 0) + 1;
      }
    }
  });

  // Calculate language distribution percentages
  const totalLangs = Object.values(languageCounts).reduce((acc, c) => acc + c, 0) || 1;
  const languages = Object.entries(languageCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / totalLangs) * 100) || 1,
    }));

  // Public showcase repos from personal codebases
  const publicReposList = Array.isArray(personalRepos)
    ? personalRepos.filter((r) => !r.private).slice(0, 6).map((r) => ({
        name: r.name,
        fullName: r.full_name,
        description: r.description || '',
        htmlUrl: r.html_url,
        stars: r.stargazers_count,
        forks: r.forks_count,
        language: r.language || '',
        updatedAt: r.updated_at,
      }))
    : [];

  return {
    profile: {
      login: user.login,
      name: user.name || user.login,
      avatarUrl: user.avatar_url,
      bio: user.bio || '',
      publicRepos: user.public_repos || 0,
      totalReposTracked: personalRepos.length + activeContributedRepos.length,
      followers: user.followers || 0,
      following: user.following || 0,
      htmlUrl: user.html_url,
      totalStars,
      totalForks,
    },
    languages,
    latestRepos: publicReposList,
    contributedRepos, // return all discovered contributed repos for CMS controls
  };
}

/**
 * Fetch public or authenticated organizations the user is a member of
 */
export async function fetchUserOrgs(username = DEFAULT_USERNAME, token = '') {
  try {
    const headers = getGithubHeaders(token);
    let orgs = [];

    // 1. Try authenticated /user/orgs (returns all orgs the token has read access to)
    const authToken = token || process.env.GITHUB_TOKEN;
    if (authToken) {
      try {
        const authRes = await fetch('https://api.github.com/user/orgs', {
          headers,
          cache: 'no-store',
        });
        if (authRes.ok) {
          const data = await authRes.json();
          if (Array.isArray(data) && data.length > 0) {
            orgs = data;
          }
        }
      } catch (err) {
        console.warn('Authenticated /user/orgs fetch failed:', err.message);
      }
    }

    // 2. Fallback to public /users/{username}/orgs
    if (orgs.length === 0) {
      const res = await fetch(`https://api.github.com/users/${username}/orgs`, {
        headers,
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          orgs = data;
        }
      }
    }

    return orgs.map((org) => ({
      login: org.login,
      name: org.login,
      avatarUrl: org.avatar_url,
      description: org.description || '',
      url: `https://github.com/${org.login}`,
    }));
  } catch (error) {
    console.error('Error fetching GitHub organizations:', error);
    return [];
  }
}

/**
 * Fetch GitHub contribution calendar
 */
export async function fetchContributionCalendar(username = DEFAULT_USERNAME, token = '') {
  const authToken = token || process.env.GITHUB_TOKEN;

  // 1. Try GraphQL if token is available
  if (authToken) {
    try {
      const query = `
        query($login: String!) {
          user(login: $login) {
            contributionsCollection {
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays {
                    contributionCount
                    date
                    weekday
                  }
                }
              }
            }
          }
        }
      `;
      const res = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Portfoliov2-DevOps-Engine',
        },
        body: JSON.stringify({ query, variables: { login: username } }),
        cache: 'no-store',
      });

      if (res.ok) {
        const json = await res.json();
        const calendar = json.data?.user?.contributionsCollection?.contributionCalendar;
        if (calendar) {
          return {
            totalContributions: calendar.totalContributions,
            weeks: calendar.weeks,
          };
        }
      }
    } catch (e) {
      console.warn('GraphQL contribution calendar fetch failed, falling back to public feed:', e.message);
    }
  }

  // 2. Fallback to public mirror API
  try {
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      const rawDays = data.contributions || [];

      // Group days into weeks of 7 days
      const weeks = [];
      let currentWeek = [];

      rawDays.forEach((day, index) => {
        const dateObj = new Date(day.date);
        currentWeek.push({
          contributionCount: day.count,
          date: day.date,
          weekday: dateObj.getDay(),
          level: day.level,
        });

        if (currentWeek.length === 7 || index === rawDays.length - 1) {
          weeks.push({ contributionDays: currentWeek });
          currentWeek = [];
        }
      });

      const totalContributions =
        typeof data.total === 'object'
          ? data.total.lastYear || Object.values(data.total)[0] || rawDays.reduce((a, b) => a + (b.count || 0), 0)
          : data.total || rawDays.reduce((a, b) => a + (b.count || 0), 0);

      return {
        totalContributions,
        weeks,
      };
    }
  } catch (error) {
    console.error('Failed fetching contribution calendar fallback:', error);
  }

  return {
    totalContributions: 0,
    weeks: [],
  };
}

/**
 * Fetch achievements and highlights from public GitHub profile
 */
export async function fetchUserAchievements(username = DEFAULT_USERNAME) {
  try {
    const res = await fetch(`https://github.com/${username}?tab=achievements`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
      cache: 'no-store',
    });

    if (!res.ok) return [];

    const html = await res.text();
    const $ = cheerio.load(html);
    const achievements = [];
    const seen = new Set();

    // 1. Primary: Extract from images with alt "Achievement: <Title>"
    $('img[alt*="Achievement:"]').each((i, el) => {
      const alt = $(el).attr('alt') || '';
      const title = alt.replace(/^Achievement:\s*/i, '').trim();
      const iconUrl = $(el).attr('src') || '';
      const key = title.toLowerCase();

      if (title && iconUrl && !seen.has(key)) {
        seen.add(key);
        const link = $(el).closest('a');
        const parent = $(el).closest('div, a');
        let tier =
          link.find('.tier, .Counter, span:contains("x")').text().trim() ||
          parent.text().match(/x\d+/)?.[0] ||
          '';

        if (!tier && link.text().includes('x')) {
          const match = link.text().match(/x\d+/);
          if (match) tier = match[0];
        }

        achievements.push({
          title,
          tier,
          iconUrl: iconUrl.startsWith('http') ? iconUrl : `https://github.com${iconUrl}`,
          description: `GitHub verified ${title} achievement`,
        });
      }
    });

    // 2. Secondary: Extract from links containing ?achievement=
    $('a[href*="achievement="]').each((i, el) => {
      const img = $(el).find('img').attr('src');
      const href = $(el).attr('href') || '';
      const match = href.match(/achievement=([^&]+)/);
      if (img && match) {
        const slug = match[1];
        const title = slug
          .split('-')
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(' ');
        const tier = $(el).text().match(/x\d+/)?.[0] || '';
        const key = title.toLowerCase();

        if (!seen.has(key)) {
          seen.add(key);
          achievements.push({
            title,
            tier,
            iconUrl: img.startsWith('http') ? img : `https://github.com${img}`,
            description: `GitHub verified ${title} achievement`,
          });
        }
      }
    });

    return achievements;
  } catch (error) {
    console.error('Failed scraping achievements:', error);
    return [];
  }
}

/**
 * Fetch profile highlights (such as GitHub Pro, Developer Program Member, Sponsor, etc.)
 */
export async function fetchUserHighlights(username = DEFAULT_USERNAME) {
  try {
    const res = await fetch(`https://github.com/${username}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
      cache: 'no-store',
    });

    if (!res.ok) return [];

    const html = await res.text();
    const $ = cheerio.load(html);
    const highlights = [];
    const seen = new Set();

    $('h2:contains("Highlights")')
      .parent()
      .find('ul li')
      .each((i, el) => {
        const rawText = $(el).text().replace(/\s+/g, ' ').trim();
        const label = $(el).find('span.Label, [data-view-component="true"]').text().trim() || rawText;
        let title = label;
        let description = 'Verified GitHub Highlight';

        if (label.toLowerCase() === 'pro') {
          title = 'GitHub Pro';
          description = 'Verified GitHub Pro Subscriber';
        } else if (label.toLowerCase().includes('developer program')) {
          title = 'Developer Program Member';
          description = 'Official GitHub Developer Program Member';
        } else if (label.toLowerCase().includes('sponsor')) {
          title = 'GitHub Sponsor';
          description = 'Active Open Source Contributor & Sponsor';
        } else if (label.toLowerCase().includes('arctic')) {
          title = 'Arctic Code Vault Contributor';
          description = 'Contributed code to 2020 GitHub Archive';
        }

        const key = title.toLowerCase();
        if (title && !seen.has(key)) {
          seen.add(key);
          highlights.push({
            title,
            badge: label.toUpperCase(),
            description,
            icon: 'verified',
          });
        }
      });

    return highlights;
  } catch (error) {
    console.error('Failed scraping highlights:', error);
    return [];
  }
}

/**
 * Fetch details for a specific repository (for autofill in CMS and sync)
 */
export async function fetchRepoDetails(repoUrlOrPath, token = '') {
  if (!repoUrlOrPath) {
    throw new Error('Repository URL or path is required');
  }

  let owner = '';
  let repo = '';

  const clean = repoUrlOrPath.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '').replace(/\/$/, '');
  const parts = clean.split('/');

  if (parts.length >= 2) {
    owner = parts[0];
    repo = parts[1];
  } else {
    throw new Error('Invalid repository identifier. Expected format: owner/repo or https://github.com/owner/repo');
  }

  const headers = getGithubHeaders(token);
  const [repoRes, langRes] = await Promise.all([
    fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers, cache: 'no-store' }),
    fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, { headers, cache: 'no-store' }),
  ]);

  if (!repoRes.ok) {
    throw new Error(`GitHub repository not found: ${owner}/${repo} (Status ${repoRes.status})`);
  }

  const data = await repoRes.json();
  const languages = langRes.ok ? Object.keys(await langRes.json()) : [];

  const technologies = [
    ...(data.language ? [data.language] : []),
    ...(Array.isArray(data.topics) ? data.topics : []),
    ...languages.slice(0, 4),
  ];

  // Remove duplicates and normalize
  const uniqueTech = Array.from(new Set(technologies)).slice(0, 8);

  return {
    title: data.name
      .split(/[-_]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' '),
    description: data.description || '',
    stars: data.stargazers_count || 0,
    forks: data.forks_count || 0,
    openIssues: data.open_issues_count || 0,
    language: data.language || '',
    technologies: uniqueTech,
    githubUrl: data.html_url,
    liveUrl: data.homepage || '',
    lastPushed: data.pushed_at || data.updated_at,
  };
}

/**
 * Fetch complete aggregated GitHub telemetry data
 */
export async function fetchAllGithubTelemetry(username = DEFAULT_USERNAME, token = '', options = {}) {
  const [profileAndRepos, organizations, contributions, achievements, highlights, rateLimit] = await Promise.all([
    fetchUserProfileAndRepos(username, token, options),
    fetchUserOrgs(username, token),
    fetchContributionCalendar(username, token),
    fetchUserAchievements(username),
    fetchUserHighlights(username),
    checkRateLimit(token),
  ]);

  return {
    profile: profileAndRepos.profile,
    languages: profileAndRepos.languages,
    latestRepos: profileAndRepos.latestRepos,
    contributedRepos: profileAndRepos.contributedRepos || [],
    organizations,
    contributions,
    achievements,
    highlights,
    rateLimit,
    lastSyncedAt: new Date().toISOString(),
  };
}
