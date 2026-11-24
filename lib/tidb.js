import mysql from 'mysql2/promise';

let pool = null;

export function getTiDBPool() {
  const host =
    process.env.BLOG_DB_HOST ||
    process.env.DB_HOST ||
    'gateway01.ap-northeast-1.prod.aws.tidbcloud.com';
  const port = Number(
    process.env.BLOG_DB_PORT || process.env.DB_PORT || 4000
  );
  const user =
    process.env.BLOG_DB_USER ||
    process.env.BLOG_DB_USERNAME ||
    process.env.DB_USER ||
    process.env.DB_USERNAME ||
    '7C5VzgGExnXHMKt.root';
  const password =
    process.env.BLOG_DB_PASSWORD ||
    process.env.DB_PASS ||
    process.env.DB_PASSWORD ||
    '5q9DOoSF6VUiyXtr';
  const database =
    process.env.BLOG_DB_NAME ||
    process.env.BLOG_DB_DATABASE ||
    process.env.DB_NAME ||
    process.env.DB_DATABASE ||
    'code_canvas';

  if (!pool) {
    pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database: database === 'sys' ? 'code_canvas' : database,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      connectTimeout: 25000,
      enableKeepAlive: true,
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true,
      },
    });
  }

  return pool;
}

/**
 * Fetch all published blog posts from the blog database (TiDB Cloud MySQL)
 */
export async function fetchBlogPostsFromTiDB() {
  try {
    const p = getTiDBPool();
    const [rows] = await p.query(
      `SELECT 
        b.id,
        b.user_id,
        b.title,
        b.content,
        b.image_url,
        b.topics,
        b.created_at,
        b.updated_at,
        u.username,
        u.profile_image
      FROM blogpost b
      LEFT JOIN user u ON b.user_id = u.id
      ORDER BY b.created_at DESC`
    );

    const baseUrl =
      process.env.BLOG_BASE_URL ||
      process.env.NEXT_PUBLIC_BLOG_URL ||
      'https://blog.dashijay.dev';

    return (rows || []).map((row) => {
      // Clean HTML / markdown for excerpt if needed
      const rawContent = row.content || '';
      const plainText = rawContent
        .replace(/<[^>]*>?/gm, ' ')
        .replace(/[#*`~_\[\]]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const excerpt =
        plainText.length > 220 ? plainText.substring(0, 217) + '...' : plainText;

      // Calculate approximate read time (average 200 wpm)
      const wordsCount = plainText.split(/\s+/).filter(Boolean).length;
      const readMinutes = Math.max(1, Math.ceil(wordsCount / 200));

      // Parse topics into tags
      const topicsStr = row.topics || '';
      const tags = topicsStr
        ? topicsStr
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [];
      const primaryCategory = tags[0] || 'Article';

      // Resolve cover image full URL if relative
      let coverImage = row.image_url || '';
      if (coverImage && !coverImage.startsWith('http')) {
        const cleanPath = coverImage.startsWith('/') ? coverImage.slice(1) : coverImage;
        coverImage = `${baseUrl}/${cleanPath}`;
      }

      return {
        blogPostId: row.id,
        title: row.title,
        content: row.content,
        excerpt,
        category: primaryCategory,
        tags: tags.length > 0 ? tags : [primaryCategory],
        readTime: `${readMinutes} min read`,
        coverImage,
        author: row.username || 'Dashintha Jayawardana',
        externalUrl: `${baseUrl}/post.php?id=${row.id}`,
        publishedAt: row.created_at ? new Date(row.created_at) : new Date(),
        updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
      };
    });
  } catch (error) {
    console.error('Error fetching blog posts from TiDB Cloud:', error.message);
    throw error;
  }
}
