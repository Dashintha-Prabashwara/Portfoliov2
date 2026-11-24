import connectToDatabase from './mongodb';
import Experience from '@/models/Experience';
import Project from '@/models/Project';
import Education from '@/models/Education';
import Certification from '@/models/Certification';
import BlogPost from '@/models/BlogPost';
import Cv from '@/models/Cv';
import GithubConfig from '@/models/GithubConfig';
import seedData from './seedData.json';
import { getProjectCoverImage } from './projectImage';
import { fetchBlogPostsFromTiDB } from './tidb';

// Helper to seed initial data if collections are empty
export async function seedInitialDataIfEmpty() {
  try {
    await connectToDatabase();

    const [expCount, projCount, eduCount, certCount, cvCount, blogCount] = await Promise.all([
      Experience.countDocuments(),
      Project.countDocuments(),
      Education.countDocuments(),
      Certification.countDocuments(),
      Cv.countDocuments(),
      BlogPost.countDocuments(),
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

    if (blogCount === 0 && seedData.blogs?.length) {
      await BlogPost.insertMany(
        seedData.blogs.map((item, idx) => ({
          title: item.title,
          slug: item.slug || item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          category: item.category || 'DevOps & CI/CD',
          excerpt: item.excerpt || '',
          content: item.content || '',
          tags: item.tags || [],
          readTime: item.readTime || '5 min read',
          color: item.color || 'primary',
          publishedAt: item.publishedAt ? new Date(item.publishedAt) : new Date(),
          order: idx + 1,
          isVisible: true,
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

    return { success: true, message: 'Database seeded successfully' };
  } catch (err) {
    console.error('Error auto-seeding database:', err);
    return { success: false, error: err.message };
  }
}

// ========== EXPERIENCES ==========
export async function getExperiencesDb() {
  try {
    if (!process.env.MONGODB_URI) {
      return (seedData.experiences || [])
        .filter((item) => item.isVisible !== false)
        .map((item, index) => ({
          ...item,
          color: ['primary', 'secondary', 'tertiary'][index % 3],
          order: item.order || index + 1,
        }));
    }
    await connectToDatabase();
    let items = await Experience.find({}).sort({ order: 1, createdAt: -1 }).lean();

    if (items.length === 0) {
      await seedInitialDataIfEmpty();
      items = await Experience.find({}).sort({ order: 1, createdAt: -1 }).lean();
    }

    const visibleItems = items.filter((item) => item.isVisible !== false);

    return visibleItems.map((item, index) => ({
      id: item._id.toString(),
      company: item.company,
      role: item.role,
      startDate: item.startDate,
      endDate: item.endDate || 'Present',
      period: `${item.startDate} - ${item.endDate || 'Present'}`,
      description: item.description,
      tags: item.tags || [],
      color: ['primary', 'secondary', 'tertiary'][index % 3],
      align: item.align === 'auto' ? (index % 2 === 0 ? 'left' : 'right') : item.align,
      order: item.order || index + 1,
      isVisible: true,
    }));
  } catch (error) {
    console.error('Error in getExperiencesDb:', error);
    return (seedData.experiences || [])
      .filter((item) => item.isVisible !== false)
      .map((item, index) => ({
        ...item,
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

    if (!process.env.MONGODB_URI) {
      return (seedData.projects || [])
        .filter((item) => item.isVisible !== false)
        .map((item, index) => ({
          ...item,
          statusColor: defaultColors[index % 3],
          barColor: defaultBarColors[index % 3],
          order: item.order || index + 1,
          image: getProjectCoverImage(item),
        }));
    }
    await connectToDatabase();
    let items = await Project.find({}).sort({ order: 1, createdAt: -1 }).lean();

    if (items.length === 0) {
      await seedInitialDataIfEmpty();
      items = await Project.find({}).sort({ order: 1, createdAt: -1 }).lean();
    }

    const visibleItems = items.filter((item) => item.isVisible !== false);

    return visibleItems.map((item, index) => ({
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
      featured: !!item.featured,
      order: item.order || index + 1,
      isVisible: true,
      githubStars: item.githubStars || 0,
      githubForks: item.githubForks || 0,
      githubLanguage: item.githubLanguage || '',
      githubLastPushed: item.githubLastPushed || '',
      githubSyncedAt: item.githubSyncedAt || null,
    }));
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
export async function syncBlogsFromTiDB() {
  try {
    const tidbPosts = await fetchBlogPostsFromTiDB();
    if (!tidbPosts || tidbPosts.length === 0) {
      return { synced: 0, total: 0 };
    }

    await connectToDatabase();

    const colors = ['primary', 'secondary', 'tertiary'];
    let syncedCount = 0;

    for (let i = 0; i < tidbPosts.length; i++) {
      const post = tidbPosts[i];
      const existing = await BlogPost.findOne({
        $or: [
          { blogPostId: post.blogPostId },
          { externalUrl: post.externalUrl },
        ],
      });

      if (!existing) {
        const count = await BlogPost.countDocuments();
        await BlogPost.create({
          blogPostId: post.blogPostId,
          syncSource: 'tidb',
          title: post.title,
          slug: post.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, ''),
          category: post.category || 'DevOps & CI/CD',
          excerpt: post.excerpt,
          content: post.content,
          tags: post.tags,
          readTime: post.readTime,
          coverImage: post.coverImage,
          author: post.author,
          externalUrl: post.externalUrl,
          color: colors[i % 3],
          order: count + 1,
          isVisible: true,
          publishedAt: post.publishedAt,
        });
        syncedCount++;
      } else {
        // Update content/title from blog database if changed, while preserving user's CMS settings (isVisible, order, custom edits)
        const updateFields = {
          blogPostId: post.blogPostId,
          externalUrl: post.externalUrl,
          content: post.content,
          publishedAt: post.publishedAt,
        };
        if (post.title && post.title !== existing.title) {
          updateFields.title = post.title;
        }
        if (!existing.excerpt && post.excerpt) {
          updateFields.excerpt = post.excerpt;
        }
        if (post.coverImage && !existing.coverImage) {
          updateFields.coverImage = post.coverImage;
        }
        await BlogPost.findByIdAndUpdate(existing._id, { $set: updateFields });
      }
    }

    return { synced: syncedCount, total: tidbPosts.length };
  } catch (error) {
    console.error('Error syncing blogs from TiDB:', error.message);
    return { synced: 0, error: error.message };
  }
}

export async function getBlogsDb(includeHidden = false) {
  try {
    if (!process.env.MONGODB_URI) {
      try {
        const tidbPosts = await fetchBlogPostsFromTiDB();
        if (tidbPosts && tidbPosts.length > 0) {
          return tidbPosts.map((post, idx) => ({
            _id: `tidb_${post.blogPostId}`,
            id: `tidb_${post.blogPostId}`,
            ...post,
            order: idx + 1,
            isVisible: true,
            color: ['primary', 'secondary', 'tertiary'][idx % 3],
            publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString() : null,
          }));
        }
      } catch (e) {
        console.error('TiDB fallback fetch error in getBlogsDb:', e.message);
      }

      return (seedData.blogs || [])
        .filter((item) => includeHidden || item.isVisible !== false)
        .map((item, index) => ({
          ...item,
          order: item.order || index + 1,
        }));
    }

    await connectToDatabase();

    // Auto-sync posts from TiDB blog database
    try {
      await syncBlogsFromTiDB();
    } catch (syncErr) {
      console.warn('Non-fatal: TiDB sync skipped in getBlogsDb:', syncErr.message);
    }

    const filter = includeHidden ? {} : { isVisible: { $ne: false } };
    let items = await BlogPost.find(filter).sort({ order: 1, publishedAt: -1 }).lean();

    if (items.length === 0 && !includeHidden) {
      await seedInitialDataIfEmpty();
      items = await BlogPost.find(filter).sort({ order: 1, publishedAt: -1 }).lean();
    }

    return items.map((item) => ({
      ...item,
      _id: item._id?.toString() || item.id,
      publishedAt: item.publishedAt ? new Date(item.publishedAt).toISOString() : null,
      createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : null,
      updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : null,
    }));
  } catch (err) {
    console.error('Error fetching blogs from DB:', err);
    return (seedData.blogs || []).map((item, index) => ({
      ...item,
      order: item.order || index + 1,
    }));
  }
}
