import connectToDatabase from './mongodb';
import Experience from '@/models/Experience';
import Project from '@/models/Project';
import Education from '@/models/Education';
import Certification from '@/models/Certification';
import Skill from '@/models/Skill';
import Leadership from '@/models/Leadership';
import Cv from '@/models/Cv';
import GithubConfig from '@/models/GithubConfig';
import seedData from './seedData.json';
import { getProjectCoverImage } from './projectImage';
import { fetchBlogPostsFromTiDB } from './tidb';

// Helper to seed initial data if collections are empty
export async function seedInitialDataIfEmpty() {
  try {
    await connectToDatabase();

    const [expCount, projCount, eduCount, certCount, cvCount, skillCount, leadCount] = await Promise.all([
      Experience.countDocuments(),
      Project.countDocuments(),
      Education.countDocuments(),
      Certification.countDocuments(),
      Cv.countDocuments(),
      Skill.countDocuments(),
      Leadership.countDocuments(),
    ]);

    if (expCount === 0 && seedData.experiences?.length) {
      await Experience.insertMany(
        seedData.experiences.map((item, idx) => ({
          company: item.company,
          role: item.role,
          startDate: item.startDate,
          endDate: item.endDate || 'Present',
          description: item.description,
          tags: item.tags || [],
          color: item.color || 'primary',
          align: item.align || 'auto',
          order: idx + 1,
        }))
      );
    }

    if (projCount === 0 && seedData.projects?.length) {
      await Project.insertMany(
        seedData.projects.map((item, idx) => ({
          title: item.title,
          status: item.status || 'Active',
          statusColor: item.statusColor || 'primary',
          barColor: item.barColor || 'from-primary to-primary',
          description: item.description,
          technologies: item.technologies || [],
          image: item.image,
          githubUrl: item.githubUrl || '',
          liveUrl: item.liveUrl || '',
          order: idx + 1,
        }))
      );
    }

    if (eduCount === 0 && seedData.education?.length) {
      await Education.insertMany(
        seedData.education.map((item, idx) => ({
          title: item.title,
          institution: item.institution,
          description: item.description || '',
          tags: item.tags || [],
          startDate: item.startDate || '',
          endDate: item.endDate || 'PRESENT',
          order: idx + 1,
        }))
      );
    }

    if (certCount === 0 && seedData.certifications?.length) {
      await Certification.insertMany(
        seedData.certifications.map((item, idx) => ({
          title: item.title,
          organization: item.organization,
          credentialId: item.credentialId || '',
          icon: item.icon || 'verified',
          status: item.status || 'Verified',
          statusColor: item.statusColor || 'tertiary',
          issueDate: item.issueDate || '',
          expiryDate: item.expiryDate || '',
          verificationUrl: item.verificationUrl || '',
          order: idx + 1,
        }))
      );
    }

    if (cvCount === 0) {
      let initialBuffer = null;
      let fileSize = 0;
      try {
        const { readFile } = await import('fs/promises');
        const path = (await import('path')).default;
        const cvPath = path.join(process.cwd(), 'public', 'cv.pdf');
        initialBuffer = await readFile(cvPath);
        fileSize = initialBuffer.length;
      } catch {
        // Local file not available
      }

      await Cv.create({
        title: 'Dashintha Jayawardana - CV',
        fileUrl: '/api/cv/download',
        description: 'Professional CV and Resume',
        downloadsCount: 0,
        isActive: true,
        fileData: initialBuffer,
        fileSize,
        fileName: 'cv.pdf',
        contentType: 'application/pdf',
      });
    }

    if (skillCount === 0 && seedData.skills?.length) {
      await Skill.insertMany(
        seedData.skills.map((item, idx) => ({
          title: item.title,
          icon: item.icon || 'terminal',
          description: item.description || '',
          skills: item.skills || [],
          color: item.color || ['primary', 'secondary', 'tertiary'][idx % 3],
          order: idx + 1,
          isVisible: item.isVisible !== false,
        }))
      );
    }

    if (leadCount === 0 && seedData.leadership?.length) {
      await Leadership.insertMany(
        seedData.leadership.map((item, idx) => ({
          title: item.title,
          category: item.category || 'Initiative',
          period: item.period || '',
          description: item.description || '',
          icon: item.icon || 'admin_panel_settings',
          color: item.color || ['primary', 'secondary', 'tertiary'][idx % 3],
          order: idx + 1,
          isVisible: item.isVisible !== false,
        }))
      );
    }

    return { success: true, message: 'Database seeded successfully' };
  } catch (err) {
    console.error('Error auto-seeding database:', err);
    return { success: false, error: err.message };
  }
}

// ========== EXPERIENCES ==========
export async function getExperiencesDb() {
  try {
    let blogs = [];
    try {
      blogs = await fetchBlogPostsFromTiDB({ includeHidden: false });
    } catch {}

    if (!process.env.MONGODB_URI) {
      return (seedData.experiences || [])
        .filter((item) => item.isVisible !== false)
        .map((item, index) => {
          const matchedBlog = blogs.find(
            (b) => String(b.linkedExperienceId) === String(item.id) || String(b.linkedExperienceId) === String(item._id)
          );
          return {
            ...item,
            blogUrl: item.blogUrl || (matchedBlog ? `/blog/${matchedBlog.id}` : ''),
            color: ['primary', 'secondary', 'tertiary'][index % 3],
            order: item.order || index + 1,
          };
        });
    }
    await connectToDatabase();
    let items = await Experience.find({}).sort({ order: 1, createdAt: -1 }).lean();

    if (items.length === 0) {
      await seedInitialDataIfEmpty();
      items = await Experience.find({}).sort({ order: 1, createdAt: -1 }).lean();
    }

    const visibleItems = items.filter((item) => item.isVisible !== false);

    return visibleItems.map((item, index) => {
      const matchedBlog = blogs.find(
        (b) => String(b.linkedExperienceId) === String(item._id) || String(b.linkedExperienceId) === String(item.id)
      );
      const rawBlogUrl = item.blogUrl || (matchedBlog ? `/blog/${matchedBlog.id}` : '');
      const blogUrl = rawBlogUrl ? rawBlogUrl.replace('/blog?id=', '/blog/') : '';

      return {
        id: item._id.toString(),
        company: item.company,
        role: item.role,
        startDate: item.startDate,
        endDate: item.endDate || 'Present',
        period: `${item.startDate} - ${item.endDate || 'Present'}`,
        description: item.description,
        tags: item.tags || [],
        blogUrl,
        color: ['primary', 'secondary', 'tertiary'][index % 3],
        align: item.align === 'auto' ? (index % 2 === 0 ? 'left' : 'right') : item.align,
        order: item.order || index + 1,
        isVisible: true,
      };
    });
  } catch (error) {
    console.error('Error in getExperiencesDb:', error);
    return (seedData.experiences || [])
      .filter((item) => item.isVisible !== false)
      .map((item, index) => ({
        ...item,
        blogUrl: item.blogUrl || '',
        color: ['primary', 'secondary', 'tertiary'][index % 3],
      }));
  }
}

// ========== PROJECTS ==========
export async function getProjectsDb() {
  try {
    const defaultBarColors = [
      'from-primary to-primary',
      'from-secondary to-secondary',
      'from-tertiary to-tertiary',
    ];
    const defaultColors = ['primary', 'secondary', 'tertiary'];

    let blogs = [];
    try {
      blogs = await fetchBlogPostsFromTiDB({ includeHidden: false });
    } catch {}

    if (!process.env.MONGODB_URI) {
      return (seedData.projects || [])
        .filter((item) => item.isVisible !== false)
        .map((item, index) => {
          const matchedBlog = blogs.find(
            (b) => String(b.linkedProjectId) === String(item.id) || String(b.linkedProjectId) === String(item._id)
          );
          return {
            ...item,
            blogUrl: item.blogUrl || (matchedBlog ? `/blog/${matchedBlog.id}` : ''),
            statusColor: defaultColors[index % 3],
            barColor: defaultBarColors[index % 3],
            order: item.order || index + 1,
            image: getProjectCoverImage(item),
          };
        });
    }
    await connectToDatabase();
    let items = await Project.find({}).sort({ order: 1, createdAt: -1 }).lean();

    if (items.length === 0) {
      await seedInitialDataIfEmpty();
      items = await Project.find({}).sort({ order: 1, createdAt: -1 }).lean();
    }

    const visibleItems = items.filter((item) => item.isVisible !== false);

    return visibleItems.map((item, index) => {
      const matchedBlog = blogs.find(
        (b) => String(b.linkedProjectId) === String(item._id) || String(b.linkedProjectId) === String(item.id)
      );
      const rawBlogUrl = item.blogUrl || (matchedBlog ? `/blog/${matchedBlog.id}` : '');
      const blogUrl = rawBlogUrl ? rawBlogUrl.replace('/blog?id=', '/blog/') : '';
      return {
        id: item._id.toString(),
        title: item.title,
        status: item.status,
        statusColor: defaultColors[index % 3],
        barColor: item.barColor || defaultBarColors[index % 3],
        description: item.description,
        technologies: item.technologies || [],
        image: getProjectCoverImage(item),
        githubUrl: item.githubUrl || '',
        liveUrl: item.liveUrl || '',
        blogUrl,
        featured: !!item.featured,
        order: item.order || index + 1,
        isVisible: true,
        githubStars: item.githubStars || 0,
        githubForks: item.githubForks || 0,
        githubLanguage: item.githubLanguage || '',
        githubLastPushed: item.githubLastPushed || '',
        githubSyncedAt: item.githubSyncedAt || null,
      };
    });
  } catch (error) {
    console.error('Error in getProjectsDb:', error);
    return seedData.projects || [];
  }
}

// ========== GITHUB CONFIG & TELEMETRY ==========
export async function getGithubConfigDb() {
  try {
    if (!process.env.MONGODB_URI) {
      return {
        username: 'Dashintha-Prabashwara',
        isEnabled: true,
        showContributions: true,
        showAchievements: true,
        showOrganizations: true,
        showLanguageStats: true,
        showProjectBadges: true,
        cachedStats: null,
      };
    }
    await connectToDatabase();
    let config = await GithubConfig.findOne({}).lean();
    if (!config) {
      return {
        username: 'Dashintha-Prabashwara',
        isEnabled: true,
        showContributions: true,
        showAchievements: true,
        showOrganizations: true,
        showLanguageStats: true,
        showProjectBadges: true,
        cachedStats: null,
      };
    }
    return {
      id: config._id.toString(),
      username: config.username || 'Dashintha-Prabashwara',
      isEnabled: config.isEnabled !== false,
      showContributions: config.showContributions !== false,
      showAchievements: config.showAchievements !== false,
      showHighlights: config.showHighlights !== false,
      showOrganizations: config.showOrganizations !== false,
      showLanguageStats: config.showLanguageStats !== false,
      showProjectBadges: config.showProjectBadges !== false,
      hiddenAchievements: config.hiddenAchievements || [],
      hiddenOrganizations: config.hiddenOrganizations || [],
      hiddenHighlights: config.hiddenHighlights || [],
      hiddenLanguages: config.hiddenLanguages || [],
      cachedStats: config.cachedStats || null,
      lastSyncedAt: config.lastSyncedAt || null,
    };
  } catch (error) {
    console.error('Error in getGithubConfigDb:', error);
    return {
      username: 'Dashintha-Prabashwara',
      isEnabled: true,
      showContributions: true,
      showAchievements: true,
      showHighlights: true,
      showOrganizations: true,
      showLanguageStats: true,
      showProjectBadges: true,
      hiddenAchievements: [],
      hiddenOrganizations: [],
      hiddenHighlights: [],
      hiddenLanguages: [],
      cachedStats: null,
    };
  }
}

// ========== EDUCATION ==========
export async function getEducationDb() {
  try {
    if (!process.env.MONGODB_URI) {
      return (seedData.education || [])
        .filter((item) => item.isVisible !== false)
        .map((item, index) => ({
          ...item,
          color: ['primary', 'secondary', 'tertiary'][index % 3],
          order: item.order || index + 1,
        }));
    }
    await connectToDatabase();
    let items = await Education.find({}).sort({ order: 1, createdAt: -1 }).lean();

    if (items.length === 0) {
      await seedInitialDataIfEmpty();
      items = await Education.find({}).sort({ order: 1, createdAt: -1 }).lean();
    }

    const visibleItems = items.filter((item) => item.isVisible !== false);

    return visibleItems.map((item, index) => ({
      id: item._id.toString(),
      title: item.title,
      institution: item.institution,
      description: item.description || '',
      tags: item.tags || [],
      startDate: item.startDate || '',
      endDate: item.endDate || 'PRESENT',
      period: item.startDate ? `${item.startDate} - ${item.endDate || 'PRESENT'}` : (item.endDate || 'PRESENT'),
      order: item.order || index + 1,
      color: ['primary', 'secondary', 'tertiary'][index % 3],
      isVisible: true,
    }));
  } catch (error) {
    console.error('Error in getEducationDb:', error);
    return seedData.education || [];
  }
}

// ========== CERTIFICATIONS ==========
export async function getCertificationsDb() {
  try {
    const defaultColors = ['primary', 'secondary', 'tertiary'];

    if (!process.env.MONGODB_URI) {
      return (seedData.certifications || [])
        .filter((item) => item.isVisible !== false)
        .map((item, index) => ({
          ...item,
          statusColor: defaultColors[index % 3],
          order: item.order || index + 1,
        }));
    }
    await connectToDatabase();
    let items = await Certification.find({}).sort({ order: 1, createdAt: -1 }).lean();

    if (items.length === 0) {
      await seedInitialDataIfEmpty();
      items = await Certification.find({}).sort({ order: 1, createdAt: -1 }).lean();
    }

    const visibleItems = items.filter((item) => item.isVisible !== false);

    return visibleItems.map((item, index) => ({
      id: item._id.toString(),
      title: item.title,
      organization: item.organization,
      credentialId: item.credentialId || '',
      icon: item.icon || 'verified',
      status: item.status || null,
      statusColor: defaultColors[index % 3],
      issueDate: item.issueDate || '',
      expiryDate: item.expiryDate || '',
      verificationUrl: item.verificationUrl || '',
      order: item.order || index + 1,
      isVisible: true,
    }));
  } catch (error) {
    console.error('Error in getCertificationsDb:', error);
    return seedData.certifications || [];
  }
}

// ========== CV ==========
export async function getCvDb() {
  try {
    if (!process.env.MONGODB_URI) {
      return {
        title: 'Dashintha Jayawardana - CV',
        fileUrl: '/api/cv/download',
        description: 'Professional CV and Resume',
        downloadsCount: 0,
        isActive: true,
      };
    }
    await connectToDatabase();
    let cv = await Cv.findOne({ isActive: true }).sort({ updatedAt: -1 }).lean();

    if (!cv) {
      cv = await Cv.create({
        title: 'Dashintha Jayawardana - CV',
        fileUrl: '/api/cv/download',
        description: 'Professional CV and Resume',
        downloadsCount: 0,
        isActive: true,
      });
    }

    return {
      id: cv._id.toString(),
      title: cv.title || 'Dashintha Jayawardana - CV',
      fileUrl: cv.fileUrl || '/api/cv/download',
      description: cv.description || 'Professional CV and Resume',
      downloadsCount: cv.downloadsCount || 0,
      isActive: cv.isActive !== false,
      fileSize: cv.fileSize || 0,
      fileName: cv.fileName || 'cv.pdf',
      updatedAt: cv.updatedAt ? new Date(cv.updatedAt).toISOString() : new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error in getCvDb:', error);
    return {
      title: 'Dashintha Jayawardana - CV',
      fileUrl: '/cv.pdf',
      description: 'Professional CV and Resume',
      downloadsCount: 0,
      isActive: true,
    };
  }
}

// ========== BLOG POSTS ==========
export async function getBlogsDb(includeHidden = false) {
  try {
    const tidbPosts = await fetchBlogPostsFromTiDB({ includeHidden });

    // Load experiences and projects to resolve linked names
    let experiences = [];
    let projects = [];
    try {
      if (process.env.MONGODB_URI) {
        await connectToDatabase();
        [experiences, projects] = await Promise.all([
          Experience.find({}).lean(),
          Project.find({}).lean(),
        ]);
      }
    } catch {}

    if (!experiences.length) {
      experiences = seedData.experiences || [];
    }
    if (!projects.length) {
      projects = seedData.projects || [];
    }

    if (tidbPosts && tidbPosts.length > 0) {
      return tidbPosts.map((post, idx) => {
        let linkedExperienceTitle = null;
        let linkedProjectTitle = null;

        if (post.linkedExperienceId) {
          const exp = experiences.find(
            (e) => String(e._id) === String(post.linkedExperienceId) || String(e.id) === String(post.linkedExperienceId)
          );
          if (exp) {
            // Position - Company format as requested
            linkedExperienceTitle = `${exp.role} - ${exp.company}`;
          }
        }

        if (post.linkedProjectId) {
          const proj = projects.find(
            (p) => String(p._id) === String(post.linkedProjectId) || String(p.id) === String(post.linkedProjectId)
          );
          if (proj) {
            linkedProjectTitle = proj.title;
          }
        }

        return {
          ...post,
          linkedExperienceTitle,
          linkedProjectTitle,
          color: ['primary', 'secondary', 'tertiary'][idx % 3],
        };
      });
    }
    return (seedData.blogs || [])
      .filter((item) => includeHidden || item.isVisible !== false)
      .map((item, index) => ({
        ...item,
        color: ['primary', 'secondary', 'tertiary'][index % 3],
        order: item.order || index + 1,
      }));
  } catch (err) {
    console.error('Error fetching blogs from TiDB in getBlogsDb:', err.message);
    return (seedData.blogs || [])
      .filter((item) => includeHidden || item.isVisible !== false)
      .map((item, index) => ({
        ...item,
        color: ['primary', 'secondary', 'tertiary'][index % 3],
        order: item.order || index + 1,
      }));
  }
}

// ========== SKILLS ==========
export async function getSkillsDb(includeHidden = false) {
  try {
    if (!process.env.MONGODB_URI) {
      return (seedData.skills || [])
        .filter((item) => includeHidden || item.isVisible !== false)
        .map((item, index) => ({
          ...item,
          color: ['primary', 'secondary', 'tertiary'][index % 3],
          order: item.order || index + 1,
        }));
    }

    await connectToDatabase();
    const filter = includeHidden ? {} : { isVisible: { $ne: false } };
    let items = await Skill.find(filter).sort({ order: 1, createdAt: 1 }).lean();

    if (items.length === 0 && !includeHidden) {
      await seedInitialDataIfEmpty();
      items = await Skill.find(filter).sort({ order: 1, createdAt: 1 }).lean();
    }

    const defaultColors = ['primary', 'secondary', 'tertiary'];
    return items.map((item, index) => ({
      id: item._id.toString(),
      _id: item._id.toString(),
      title: item.title,
      icon: item.icon || 'terminal',
      description: item.description || '',
      skills: item.skills || [],
      color: item.color || defaultColors[index % 3],
      order: item.order !== undefined ? item.order : index + 1,
      isVisible: item.isVisible !== false,
      createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : null,
      updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : null,
    }));
  } catch (error) {
    console.error('Error in getSkillsDb:', error);
    return (seedData.skills || [])
      .filter((item) => includeHidden || item.isVisible !== false)
      .map((item, index) => ({
        ...item,
        color: ['primary', 'secondary', 'tertiary'][index % 3],
        order: item.order || index + 1,
      }));
  }
}

// ========== LEADERSHIP ==========
export async function getLeadershipDb(includeHidden = false) {
  try {
    if (!process.env.MONGODB_URI) {
      return (seedData.leadership || [])
        .filter((item) => includeHidden || item.isVisible !== false)
        .map((item, index) => ({
          ...item,
          color: ['primary', 'secondary', 'tertiary'][index % 3],
          order: item.order || index + 1,
        }));
    }

    await connectToDatabase();
    const filter = includeHidden ? {} : { isVisible: { $ne: false } };
    let items = await Leadership.find(filter).sort({ order: 1, createdAt: 1 }).lean();

    if (items.length === 0 && !includeHidden) {
      await seedInitialDataIfEmpty();
      items = await Leadership.find(filter).sort({ order: 1, createdAt: 1 }).lean();
    }

    const defaultColors = ['primary', 'secondary', 'tertiary'];
    return items.map((item, index) => ({
      id: item._id.toString(),
      _id: item._id.toString(),
      title: item.title,
      category: item.category || 'Initiative',
      period: item.period || '',
      description: item.description || '',
      icon: item.icon || 'admin_panel_settings',
      color: item.color || defaultColors[index % 3],
      order: item.order !== undefined ? item.order : index + 1,
      isVisible: item.isVisible !== false,
      createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : null,
      updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : null,
    }));
  } catch (error) {
    console.error('Error in getLeadershipDb:', error);
    return (seedData.leadership || [])
      .filter((item) => includeHidden || item.isVisible !== false)
      .map((item, index) => ({
        ...item,
        color: ['primary', 'secondary', 'tertiary'][index % 3],
        order: item.order || index + 1,
      }));
  }
}
