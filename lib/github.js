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
 * Fetch profile data and public repositories
 */
export async function fetchUserProfileAndRepos(username = DEFAULT_USERNAME, token = '') {
  const headers = getGithubHeaders(token);

  const [userRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/users/${username}`, { headers, next: { revalidate: 900 } }),
    fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { headers, next: { revalidate: 900 } }),
  ]);

  if (!userRes.ok) {
    throw new Error(`GitHub user fetch failed: ${userRes.status} ${userRes.statusText}`);
  }

  const user = await userRes.json();
  const repos = reposRes.ok ? await reposRes.json() : [];

  let totalStars = 0;
  let totalForks = 0;
  const languageCounts = {};

  if (Array.isArray(repos)) {
    repos.forEach((repo) => {
      totalStars += repo.stargazers_count || 0;
      totalForks += repo.forks_count || 0;
      if (repo.language) {
        languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
      }
    });
  }

  // Calculate language distribution percentages
  const totalLangs = Object.values(languageCounts).reduce((acc, c) => acc + c, 0) || 1;
  const languages = Object.entries(languageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / totalLangs) * 100),
    }));

  return {
    profile: {
      login: user.login,
      name: user.name || user.login,
      avatarUrl: user.avatar_url,
      bio: user.bio || '',
      publicRepos: user.public_repos || 0,
      followers: user.followers || 0,
      following: user.following || 0,
      htmlUrl: user.html_url,
      totalStars,
      totalForks,
    },
    languages,
    latestRepos: Array.isArray(repos)
      ? repos.slice(0, 6).map((r) => ({
          name: r.name,
          fullName: r.full_name,
          description: r.description || '',
          htmlUrl: r.html_url,
          stars: r.stargazers_count,
          forks: r.forks_count,
          language: r.language || '',
          updatedAt: r.updated_at,
        }))
      : [],
  };
}

/**
 * Fetch public organizations the user is a member of
 */
export async function fetchUserOrgs(username = DEFAULT_USERNAME, token = '') {
  try {
    const headers = getGithubHeaders(token);
    const res = await fetch(`https://api.github.com/users/${username}/orgs`, {
      headers,
      next: { revalidate: 1800 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((org) => ({
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
        next: { revalidate: 1800 },
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
      next: { revalidate: 1800 },
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
      next: { revalidate: 3600 },
    });

    if (!res.ok) return [];

    const html = await res.text();
    const $ = cheerio.load(html);
    const achievements = [];

    // GitHub achievements cards / badges
    $('a[href*="/achievements/"], .achievement-badge-card, [data-hovercard-type="achievement"]').each((i, el) => {
      const $el = $(el);
      const img = $el.find('img').attr('src');
      let title = $el.find('h3, h4, .text-bold').first().text().trim();
      const tier = $el.find('.Counter, .tier, span:contains("x")').first().text().trim();
      const description = $el.find('p, .color-fg-muted').first().text().trim();

      if (!title) {
        title = $el.attr('aria-label') || $el.text().trim();
      }

      if (title && img && !achievements.some((a) => a.title === title)) {
        achievements.push({
          title: title.replace(/\s+/g, ' '),
          tier: tier || '',
          description: description || '',
          iconUrl: img.startsWith('http') ? img : `https://github.com${img}`,
        });
      }
    });

    return achievements;
  } catch (error) {
    console.error('Failed scraping achievements:', error);
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
export async function fetchAllGithubTelemetry(username = DEFAULT_USERNAME, token = '') {
  const [profileAndRepos, organizations, contributions, achievements, rateLimit] = await Promise.all([
    fetchUserProfileAndRepos(username, token),
    fetchUserOrgs(username, token),
    fetchContributionCalendar(username, token),
    fetchUserAchievements(username),
    checkRateLimit(token),
  ]);

  return {
    profile: profileAndRepos.profile,
    languages: profileAndRepos.languages,
    latestRepos: profileAndRepos.latestRepos,
    organizations,
    contributions,
    achievements,
    rateLimit,
    lastSyncedAt: new Date().toISOString(),
  };
}
