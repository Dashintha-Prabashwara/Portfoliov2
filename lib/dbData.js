import connectToDatabase from './mongodb';
import Experience from '@/models/Experience';
import Project from '@/models/Project';
import Education from '@/models/Education';
import Certification from '@/models/Certification';
import Cv from '@/models/Cv';
import seedData from './seedData.json';

// Helper to seed initial data if collections are empty
export async function seedInitialDataIfEmpty() {
  try {
    await connectToDatabase();

    const [expCount, projCount, eduCount, certCount, cvCount] = await Promise.all([
      Experience.countDocuments(),
      Project.countDocuments(),
      Education.countDocuments(),
      Certification.countDocuments(),
      Cv.countDocuments(),
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
      return seedData.experiences || [];
    }
    await connectToDatabase();
    let items = await Experience.find({}).sort({ order: 1, createdAt: -1 }).lean();

    if (items.length === 0) {
      await seedInitialDataIfEmpty();
      items = await Experience.find({}).sort({ order: 1, createdAt: -1 }).lean();
    }

    return items.map((item, index) => ({
      id: item._id.toString(),
      company: item.company,
      role: item.role,
      startDate: item.startDate,
      endDate: item.endDate || 'Present',
      period: `${item.startDate} - ${item.endDate || 'Present'}`,
      description: item.description,
      tags: item.tags || [],
      color: item.color || ['primary', 'secondary', 'tertiary'][index % 3],
      align: item.align === 'auto' ? (index % 2 === 0 ? 'left' : 'right') : item.align,
      order: item.order || index + 1,
    }));
  } catch (error) {
    console.error('Error in getExperiencesDb:', error);
    return seedData.experiences || [];
  }
}

// ========== PROJECTS ==========
export async function getProjectsDb() {
  try {
    if (!process.env.MONGODB_URI) {
      return seedData.projects || [];
    }
    await connectToDatabase();
    let items = await Project.find({}).sort({ order: 1, createdAt: -1 }).lean();

    if (items.length === 0) {
      await seedInitialDataIfEmpty();
      items = await Project.find({}).sort({ order: 1, createdAt: -1 }).lean();
    }

    const defaultBarColors = [
      'from-primary to-primary',
      'from-secondary to-secondary',
      'from-tertiary to-tertiary',
    ];

    return items.map((item, index) => ({
      id: item._id.toString(),
      title: item.title,
      status: item.status,
      statusColor: item.statusColor || null,
      barColor: item.barColor || defaultBarColors[index % 3],
      description: item.description,
      technologies: item.technologies || [],
      image: item.image || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000&q=80',
      githubUrl: item.githubUrl || '',
      liveUrl: item.liveUrl || '',
      featured: !!item.featured,
      order: item.order || index + 1,
    }));
  } catch (error) {
    console.error('Error in getProjectsDb:', error);
    return seedData.projects || [];
  }
}

// ========== EDUCATION ==========
export async function getEducationDb() {
  try {
    if (!process.env.MONGODB_URI) {
      return seedData.education || [];
    }
    await connectToDatabase();
    let items = await Education.find({}).sort({ order: 1, createdAt: -1 }).lean();

    if (items.length === 0) {
      await seedInitialDataIfEmpty();
      items = await Education.find({}).sort({ order: 1, createdAt: -1 }).lean();
    }

    return items.map((item, index) => ({
      id: item._id.toString(),
      title: item.title,
      institution: item.institution,
      description: item.description || '',
      tags: item.tags || [],
      startDate: item.startDate || '',
      endDate: item.endDate || 'PRESENT',
      period: item.startDate ? `${item.startDate} - ${item.endDate || 'PRESENT'}` : (item.endDate || 'PRESENT'),
      order: item.order || index + 1,
    }));
  } catch (error) {
    console.error('Error in getEducationDb:', error);
    return seedData.education || [];
  }
}

// ========== CERTIFICATIONS ==========
export async function getCertificationsDb() {
  try {
    if (!process.env.MONGODB_URI) {
      return seedData.certifications || [];
    }
    await connectToDatabase();
    let items = await Certification.find({}).sort({ order: 1, createdAt: -1 }).lean();

    if (items.length === 0) {
      await seedInitialDataIfEmpty();
      items = await Certification.find({}).sort({ order: 1, createdAt: -1 }).lean();
    }

    return items.map((item, index) => ({
      id: item._id.toString(),
      title: item.title,
      organization: item.organization,
      credentialId: item.credentialId || '',
      icon: item.icon || 'verified',
      status: item.status || null,
      statusColor: item.statusColor || (item.status ? 'tertiary' : null),
      issueDate: item.issueDate || '',
      expiryDate: item.expiryDate || '',
      verificationUrl: item.verificationUrl || '',
      order: item.order || index + 1,
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
