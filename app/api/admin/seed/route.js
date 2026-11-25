import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Experience from '@/models/Experience';
import Project from '@/models/Project';
import Education from '@/models/Education';
import Certification from '@/models/Certification';
import BlogPost from '@/models/BlogPost';
import Skill from '@/models/Skill';
import Leadership from '@/models/Leadership';
import Cv from '@/models/Cv';
import { checkAdminAuth } from '@/lib/adminAuth';
import seedData from '@/lib/seedData.json';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const isAuth = await checkAdminAuth(request);
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json().catch(() => ({}));
    const { overwrite = false } = body;

    if (overwrite) {
      await Promise.all([
        Experience.deleteMany({}),
        Project.deleteMany({}),
        Education.deleteMany({}),
        Certification.deleteMany({}),
        BlogPost.deleteMany({}),
        Skill.deleteMany({}),
        Leadership.deleteMany({}),
        Cv.deleteMany({}),
      ]);
    }

    const [expCount, projCount, eduCount, certCount, blogCount, skillCount, leadCount, cvCount] = await Promise.all([
      Experience.countDocuments(),
      Project.countDocuments(),
      Education.countDocuments(),
      Certification.countDocuments(),
      BlogPost.countDocuments(),
      Skill.countDocuments(),
      Leadership.countDocuments(),
      Cv.countDocuments(),
    ]);

    let seededCounts = {
      experiences: 0,
      projects: 0,
      education: 0,
      certifications: 0,
      blogs: 0,
      skills: 0,
      leadership: 0,
      cv: 0,
    };

    if ((overwrite || expCount === 0) && seedData.experiences?.length) {
      const expDocs = seedData.experiences.map((item, idx) => ({
        company: item.company,
        role: item.role,
        startDate: item.startDate,
        endDate: item.endDate || 'Present',
        description: item.description,
        tags: item.tags || [],
        color: item.color || 'primary',
        align: item.align || 'auto',
        order: idx + 1,
      }));
      const res = await Experience.insertMany(expDocs);
      seededCounts.experiences = res.length;
    }

    if ((overwrite || projCount === 0) && seedData.projects?.length) {
      const projDocs = seedData.projects.map((item, idx) => ({
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
      }));
      const res = await Project.insertMany(projDocs);
      seededCounts.projects = res.length;
    }

    if ((overwrite || eduCount === 0) && seedData.education?.length) {
      const eduDocs = seedData.education.map((item, idx) => ({
        title: item.title,
        institution: item.institution,
        description: item.description || '',
        tags: item.tags || [],
        startDate: item.startDate || '',
        endDate: item.endDate || 'PRESENT',
        order: idx + 1,
      }));
      const res = await Education.insertMany(eduDocs);
      seededCounts.education = res.length;
    }

    if ((overwrite || certCount === 0) && seedData.certifications?.length) {
      const certDocs = seedData.certifications.map((item, idx) => ({
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
      }));
      const res = await Certification.insertMany(certDocs);
      seededCounts.certifications = res.length;
    }

    if ((overwrite || blogCount === 0) && seedData.blogs?.length) {
      const blogDocs = seedData.blogs.map((item, idx) => ({
        title: item.title,
        slug: item.slug || item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        excerpt: item.excerpt,
        content: item.content || item.excerpt,
        category: item.category || 'DevOps & CI/CD',
        tags: item.tags || [],
        readTime: item.readTime || '5 min read',
        author: item.author || 'Dashintha Jayawardana',
        color: item.color || 'primary',
        order: idx + 1,
        isVisible: item.isVisible !== false,
        publishedAt: item.publishedAt ? new Date(item.publishedAt) : new Date(),
      }));
      const res = await BlogPost.insertMany(blogDocs);
      seededCounts.blogs = res.length;
    }

    if ((overwrite || skillCount === 0) && seedData.skills?.length) {
      const skillDocs = seedData.skills.map((item, idx) => ({
        title: item.title,
        icon: item.icon || 'terminal',
        description: item.description || '',
        skills: item.skills || [],
        color: item.color || ['primary', 'secondary', 'tertiary'][idx % 3],
        order: idx + 1,
        isVisible: item.isVisible !== false,
      }));
      const res = await Skill.insertMany(skillDocs);
      seededCounts.skills = res.length;
    }

    if ((overwrite || leadCount === 0) && seedData.leadership?.length) {
      const leadDocs = seedData.leadership.map((item, idx) => ({
        title: item.title,
        category: item.category || 'Initiative',
        period: item.period || '',
        description: item.description || '',
        icon: item.icon || 'admin_panel_settings',
        color: item.color || ['primary', 'secondary', 'tertiary'][idx % 3],
        order: idx + 1,
        isVisible: item.isVisible !== false,
      }));
      const res = await Leadership.insertMany(leadDocs);
      seededCounts.leadership = res.length;
    }

    let initialBuffer = null;
    let fileSize = 0;
    try {
      const { readFile } = await import('fs/promises');
      const path = (await import('path')).default;
      const cvPath = path.join(process.cwd(), 'public', 'cv.pdf');
      initialBuffer = await readFile(cvPath);
      fileSize = initialBuffer.length;
    } catch {
      // Local file not found
    }

    if (overwrite || cvCount === 0) {
      const cv = await Cv.create({
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
      if (cv) seededCounts.cv = 1;
    }

    return NextResponse.json({
      success: true,
      message: 'Initial portfolio data successfully seeded to MongoDB!',
      seededCounts,
    });
  } catch (error) {
    console.error('Error seeding data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
