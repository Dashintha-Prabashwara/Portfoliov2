import mysql from 'mysql2/promise';

let pool = null;
let schemaEnsured = false;

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
 * Ensures table schema and required columns exist in TiDB Cloud MySQL
 */
export async function ensureTiDBSchema() {
  if (schemaEnsured) return;
  try {
    const p = getTiDBPool();
    await p.query('ALTER TABLE blogpost ADD COLUMN IF NOT EXISTS is_visible TINYINT(1) DEFAULT 1');
    await p.query('ALTER TABLE blogpost ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0');
    await p.query('ALTER TABLE blogpost ADD COLUMN IF NOT EXISTS excerpt TEXT NULL');
    await p.query('ALTER TABLE blogpost ADD COLUMN IF NOT EXISTS linked_experience_id VARCHAR(255) NULL');
    await p.query('ALTER TABLE blogpost ADD COLUMN IF NOT EXISTS linked_project_id VARCHAR(255) NULL');
    await p.query('ALTER TABLE blogpost MODIFY COLUMN image_url MEDIUMTEXT');
    
    // Category table
    await p.query(`
      CREATE TABLE IF NOT EXISTS blog_category (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        is_visible TINYINT(1) DEFAULT 1,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Ensure initial categories if table is empty
    const [existingCats] = await p.query('SELECT COUNT(*) as cnt FROM blog_category');
    if (existingCats[0]?.cnt === 0) {
      const defaultCats = [
        'DevOps & CI/CD',
        'Cloud & Database',
        'Architecture',
        'DevSecOps',
        'IoT & Embedded',
        'Design'
      ];
      for (let i = 0; i < defaultCats.length; i++) {
        await p.query(
          'INSERT IGNORE INTO blog_category (name, is_visible, display_order) VALUES (?, 1, ?)',
          [defaultCats[i], i + 1]
        );
      }
    }

    schemaEnsured = true;
  } catch (err) {
    console.warn('Warning ensuring TiDB schema:', err.message);
  }
}

/**
 * Get default user ID for authoring posts
 */
async function getDefaultUserId(p) {
  try {
    const [users] = await p.query('SELECT id FROM user ORDER BY id ASC LIMIT 1');
    if (users && users.length > 0) {
      return users[0].id;
    }
  } catch {
    // ignore
  }
  return 30001;
}

/**
 * Format raw TiDB row into portfolio blog post model
 */
function formatBlogRow(row) {
  const rawContent = row.content || '';
  const plainText = rawContent
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/[#*`~_\[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const generatedExcerpt =
    plainText.length > 220 ? plainText.substring(0, 217) + '...' : plainText;

  const excerpt = row.excerpt && row.excerpt.trim() ? row.excerpt.trim() : generatedExcerpt;

  const wordsCount = plainText.split(/\s+/).filter(Boolean).length;
  const readMinutes = Math.max(1, Math.ceil(wordsCount / 200));

  const topicsStr = row.topics || '';
  const tags = topicsStr
    ? topicsStr
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : [];
  const primaryCategory = tags[0] || 'DevOps & CI/CD';

  return {
    id: String(row.id),
    _id: String(row.id),
    blogPostId: row.id,
    title: row.title || 'Untitled Article',
    content: row.content || '',
    excerpt,
    category: primaryCategory,
    tags: tags.length > 0 ? tags : [primaryCategory],
    readTime: `${readMinutes} min read`,
    coverImage: row.image_url || '',
    author: row.username || 'Dashintha Jayawardana',
    isVisible: row.is_visible !== 0,
    order: row.display_order ?? 0,
    linkedExperienceId: row.linked_experience_id || null,
    linkedProjectId: row.linked_project_id || null,
    publishedAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
  };
}

/**
 * Fetch all blog posts directly from TiDB Cloud
 * @param {Object} options
 * @param {boolean} options.includeHidden - whether to include invisible/hidden posts (CMS uses true, public uses false)
 */
export async function fetchBlogPostsFromTiDB({ includeHidden = false } = {}) {
  try {
    await ensureTiDBSchema();
    const p = getTiDBPool();

    let query = `
      SELECT 
        b.id,
        b.user_id,
        b.title,
        b.content,
        b.image_url,
        b.topics,
        b.created_at,
        b.updated_at,
        b.is_visible,
        b.display_order,
        b.excerpt,
        b.linked_experience_id,
        b.linked_project_id,
        u.username,
        u.profile_image
      FROM blogpost b
      LEFT JOIN user u ON b.user_id = u.id
    `;

    if (!includeHidden) {
      query += ` WHERE (b.is_visible IS NULL OR b.is_visible != 0)`;
    }

    query += ` ORDER BY b.display_order ASC, b.created_at DESC`;

    const [rows] = await p.query(query);
    return (rows || []).map(formatBlogRow);
  } catch (error) {
    console.error('Error fetching blog posts from TiDB Cloud:', error.message);
    throw error;
  }
}

/**
 * Fetch a single blog post by ID from TiDB Cloud
 */
export async function getBlogByIdFromTiDB(id) {
  try {
    await ensureTiDBSchema();
    const p = getTiDBPool();
    const numericId = Number(id);
    if (isNaN(numericId)) return null;

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
        b.is_visible,
        b.display_order,
        b.excerpt,
        b.linked_experience_id,
        b.linked_project_id,
        u.username,
        u.profile_image
      FROM blogpost b
      LEFT JOIN user u ON b.user_id = u.id
      WHERE b.id = ?
      LIMIT 1`,
      [numericId]
    );

    if (!rows || rows.length === 0) return null;
    return formatBlogRow(rows[0]);
  } catch (error) {
    console.error('Error fetching blog post by ID from TiDB Cloud:', error.message);
    throw error;
  }
}

/**
 * Create a new blog post directly in TiDB Cloud
 */
export async function createBlogInTiDB(data) {
  try {
    await ensureTiDBSchema();
    const p = getTiDBPool();
    const userId = await getDefaultUserId(p);

    const title = data.title?.trim() || 'Untitled Article';
    const content = data.content || '';
    const imageUrl = data.coverImage || data.image_url || '';
    
    // Topics / Tags & Category handling
    let topicsList = [];
    if (Array.isArray(data.tags)) {
      topicsList = data.tags.filter(Boolean);
    } else if (typeof data.tags === 'string' && data.tags.trim()) {
      topicsList = data.tags.split(',').map((t) => t.trim()).filter(Boolean);
    }
    if (data.category && data.category.trim() && !topicsList.includes(data.category.trim())) {
      topicsList.unshift(data.category.trim());
    }
    const topics = topicsList.join(', ');

    const excerpt = data.excerpt?.trim() || null;
    const isVisible = data.isVisible !== false ? 1 : 0;
    
    // Determine display order
    let displayOrder = Number(data.order);
    if (isNaN(displayOrder) || displayOrder <= 0) {
      const [maxRes] = await p.query('SELECT MAX(display_order) as maxOrder FROM blogpost');
      displayOrder = (maxRes[0]?.maxOrder || 0) + 1;
    }

    const linkedExperienceId = data.linkedExperienceId && data.linkedExperienceId !== 'none' ? String(data.linkedExperienceId) : null;
    const linkedProjectId = data.linkedProjectId && data.linkedProjectId !== 'none' ? String(data.linkedProjectId) : null;

    const [result] = await p.query(
      `INSERT INTO blogpost 
        (user_id, title, content, image_url, topics, excerpt, is_visible, display_order, linked_experience_id, linked_project_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        userId,
        title,
        content,
        imageUrl,
        topics,
        excerpt,
        isVisible,
        displayOrder,
        linkedExperienceId,
        linkedProjectId,
      ]
    );

    const insertedId = result.insertId;
    return await getBlogByIdFromTiDB(insertedId);
  } catch (error) {
    console.error('Error creating blog post in TiDB Cloud:', error.message);
    throw error;
  }
}

/**
 * Update an existing blog post directly in TiDB Cloud
 */
export async function updateBlogInTiDB(id, data) {
  try {
    await ensureTiDBSchema();
    const p = getTiDBPool();
    const numericId = Number(id);
    if (isNaN(numericId)) throw new Error('Invalid blog post ID');

    const fields = [];
    const values = [];

    if (data.title !== undefined) {
      fields.push('title = ?');
      values.push(data.title.trim());
    }

    if (data.content !== undefined) {
      fields.push('content = ?');
      values.push(data.content);
    }

    if (data.coverImage !== undefined || data.image_url !== undefined) {
      fields.push('image_url = ?');
      values.push(data.coverImage || data.image_url || '');
    }

    if (data.tags !== undefined || data.category !== undefined) {
      let topicsList = [];
      if (Array.isArray(data.tags)) {
        topicsList = data.tags.filter(Boolean);
      } else if (typeof data.tags === 'string' && data.tags.trim()) {
        topicsList = data.tags.split(',').map((t) => t.trim()).filter(Boolean);
      }
      if (data.category && data.category.trim() && !topicsList.includes(data.category.trim())) {
        topicsList.unshift(data.category.trim());
      }
      fields.push('topics = ?');
      values.push(topicsList.join(', '));
    }

    if (data.excerpt !== undefined) {
      fields.push('excerpt = ?');
      values.push(data.excerpt?.trim() || null);
    }

    if (data.isVisible !== undefined) {
      fields.push('is_visible = ?');
      values.push(data.isVisible ? 1 : 0);
    }

    if (data.order !== undefined) {
      fields.push('display_order = ?');
      values.push(Number(data.order) || 0);
    }

    if (data.linkedExperienceId !== undefined) {
      fields.push('linked_experience_id = ?');
      values.push(data.linkedExperienceId && data.linkedExperienceId !== 'none' ? String(data.linkedExperienceId) : null);
    }

    if (data.linkedProjectId !== undefined) {
      fields.push('linked_project_id = ?');
      values.push(data.linkedProjectId && data.linkedProjectId !== 'none' ? String(data.linkedProjectId) : null);
    }

    if (fields.length === 0) {
      return await getBlogByIdFromTiDB(numericId);
    }

    fields.push('updated_at = NOW()');
    values.push(numericId);

    await p.query(
      `UPDATE blogpost SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return await getBlogByIdFromTiDB(numericId);
  } catch (error) {
    console.error('Error updating blog post in TiDB Cloud:', error.message);
    throw error;
  }
}

/**
 * Delete a blog post directly from TiDB Cloud
 */
export async function deleteBlogInTiDB(id) {
  try {
    await ensureTiDBSchema();
    const p = getTiDBPool();
    const numericId = Number(id);
    if (isNaN(numericId)) throw new Error('Invalid blog post ID');

    // Also fetch blog first to know if any experience or project was linked
    const existing = await getBlogByIdFromTiDB(numericId);

    const [result] = await p.query('DELETE FROM blogpost WHERE id = ?', [numericId]);
    return { success: result.affectedRows > 0, deletedBlog: existing };
  } catch (error) {
    console.error('Error deleting blog post from TiDB Cloud:', error.message);
    throw error;
  }
}

/**
 * Bulk reorder blog posts in TiDB Cloud
 */
export async function reorderBlogsInTiDB(items) {
  try {
    await ensureTiDBSchema();
    const p = getTiDBPool();

    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      const numericId = Number(item.id || item._id || item.blogPostId);
      if (!isNaN(numericId)) {
        const isVisible = item.isVisible !== false ? 1 : 0;
        await p.query(
          'UPDATE blogpost SET display_order = ?, is_visible = ? WHERE id = ?',
          [index + 1, isVisible, numericId]
        );
      }
    }

    return await fetchBlogPostsFromTiDB({ includeHidden: true });
  } catch (error) {
    console.error('Error reordering blogs in TiDB Cloud:', error.message);
    throw error;
  }
}

/**
 * Fetch categories from TiDB Cloud
 */
export async function fetchCategoriesFromTiDB({ includeHidden = false } = {}) {
  try {
    await ensureTiDBSchema();
    const p = getTiDBPool();
    let query = 'SELECT id, name, is_visible, display_order, created_at, updated_at FROM blog_category';
    if (!includeHidden) {
      query += ' WHERE is_visible = 1';
    }
    query += ' ORDER BY display_order ASC, name ASC';
    const [rows] = await p.query(query);
    return (rows || []).map((r) => ({
      id: String(r.id),
      _id: String(r.id),
      name: r.name,
      isVisible: r.is_visible !== 0,
      order: r.display_order ?? 0,
    }));
  } catch (error) {
    console.error('Error fetching categories from TiDB:', error.message);
    return [];
  }
}

/**
 * Create a new category in TiDB Cloud
 */
export async function createCategoryInTiDB({ name, isVisible = true }) {
  try {
    await ensureTiDBSchema();
    const p = getTiDBPool();
    const cleanName = name.trim();
    if (!cleanName) throw new Error('Category name is required');

    const [maxRes] = await p.query('SELECT MAX(display_order) as maxOrder FROM blog_category');
    const nextOrder = (maxRes[0]?.maxOrder || 0) + 1;

    const [result] = await p.query(
      'INSERT INTO blog_category (name, is_visible, display_order) VALUES (?, ?, ?)',
      [cleanName, isVisible ? 1 : 0, nextOrder]
    );

    return {
      id: String(result.insertId),
      _id: String(result.insertId),
      name: cleanName,
      isVisible: !!isVisible,
      order: nextOrder,
    };
  } catch (error) {
    console.error('Error creating category in TiDB:', error.message);
    throw error;
  }
}

/**
 * Update a category in TiDB Cloud
 */
export async function updateCategoryInTiDB(id, { name, isVisible, order }) {
  try {
    await ensureTiDBSchema();
    const p = getTiDBPool();
    const numericId = Number(id);
    if (isNaN(numericId)) throw new Error('Invalid category ID');

    const fields = [];
    const values = [];

    if (name !== undefined) {
      fields.push('name = ?');
      values.push(name.trim());
    }
    if (isVisible !== undefined) {
      fields.push('is_visible = ?');
      values.push(isVisible ? 1 : 0);
    }
    if (order !== undefined) {
      fields.push('display_order = ?');
      values.push(Number(order) || 0);
    }

    if (fields.length > 0) {
      values.push(numericId);
      await p.query(
        `UPDATE blog_category SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
    }

    const [rows] = await p.query('SELECT * FROM blog_category WHERE id = ?', [numericId]);
    if (!rows || rows.length === 0) return null;
    return {
      id: String(rows[0].id),
      _id: String(rows[0].id),
      name: rows[0].name,
      isVisible: rows[0].is_visible !== 0,
      order: rows[0].display_order ?? 0,
    };
  } catch (error) {
    console.error('Error updating category in TiDB:', error.message);
    throw error;
  }
}

/**
 * Delete a category from TiDB Cloud
 */
export async function deleteCategoryInTiDB(id) {
  try {
    await ensureTiDBSchema();
    const p = getTiDBPool();
    const numericId = Number(id);
    if (isNaN(numericId)) throw new Error('Invalid category ID');

    const [result] = await p.query('DELETE FROM blog_category WHERE id = ?', [numericId]);
    return { success: result.affectedRows > 0 };
  } catch (error) {
    console.error('Error deleting category in TiDB:', error.message);
    throw error;
  }
}
