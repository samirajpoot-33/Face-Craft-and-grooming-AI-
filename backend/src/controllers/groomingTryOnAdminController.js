/**
 * Admin: hairstyle & beard try-on session logs
 */

import { query } from '../config/database.js';

function safeLimitOffset(req) {
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 50));
  const offset = Math.max(0, parseInt(req.query.offset, 10) || 0);
  return { limit, offset };
}

function tableMissing(err) {
  const msg = err?.message || '';
  return msg.includes("doesn't exist") || msg.includes('Unknown table');
}

export const getAllHairstyleTryOns = async (req, res) => {
  try {
    const { limit, offset } = safeLimitOffset(req);
    const rows = await query(
      `SELECT ht.id, ht.user_id, ht.gender, ht.style_id, ht.hair_style, ht.hair_style_label,
              ht.result_image_url, ht.task_id, ht.created_at,
              u.username, u.email, u.full_name
       FROM hairstyle_tryon ht
       LEFT JOIN users u ON ht.user_id = u.id
       ORDER BY ht.created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      []
    );

    res.json({
      success: true,
      data: rows.map((r) => ({
        id: r.id,
        userId: r.user_id,
        username: r.username,
        email: r.email,
        fullName: r.full_name,
        gender: r.gender,
        styleId: r.style_id,
        hairStyle: r.hair_style,
        hairStyleLabel: r.hair_style_label,
        resultImageUrl: r.result_image_url,
        taskId: r.task_id,
        createdAt: r.created_at,
      })),
      count: rows.length,
    });
  } catch (error) {
    if (tableMissing(error)) {
      return res.json({
        success: true,
        data: [],
        count: 0,
        message: 'Run backend/database/migrate_grooming_tryon.sql',
      });
    }
    console.error('Get hairstyle try-ons error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllBeardTryOns = async (req, res) => {
  try {
    const { limit, offset } = safeLimitOffset(req);
    const rows = await query(
      `SELECT bt.id, bt.user_id, bt.style_id, bt.beard, bt.beard_label,
              bt.result_image_url, bt.task_id, bt.source_type, bt.created_at,
              u.username, u.email, u.full_name
       FROM beard_tryon bt
       LEFT JOIN users u ON bt.user_id = u.id
       ORDER BY bt.created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      []
    );

    res.json({
      success: true,
      data: rows.map((r) => ({
        id: r.id,
        userId: r.user_id,
        username: r.username,
        email: r.email,
        fullName: r.full_name,
        styleId: r.style_id,
        beard: r.beard,
        beardLabel: r.beard_label,
        resultImageUrl: r.result_image_url,
        taskId: r.task_id,
        sourceType: r.source_type,
        createdAt: r.created_at,
      })),
      count: rows.length,
    });
  } catch (error) {
    if (tableMissing(error)) {
      return res.json({
        success: true,
        data: [],
        count: 0,
        message: 'Run backend/database/migrate_grooming_tryon.sql',
      });
    }
    console.error('Get beard try-ons error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getGroomingTryOnStats = async (req, res) => {
  try {
    const [hairstyleTotal] = await query('SELECT COUNT(*) as count FROM hairstyle_tryon');
    const [beardTotal] = await query('SELECT COUNT(*) as count FROM beard_tryon');
    const [hairstyleRecent] = await query(
      `SELECT COUNT(*) as count FROM hairstyle_tryon WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
    );
    const [beardRecent] = await query(
      `SELECT COUNT(*) as count FROM beard_tryon WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
    );
    const [hairstyleUsers] = await query(
      'SELECT COUNT(DISTINCT user_id) as count FROM hairstyle_tryon WHERE user_id IS NOT NULL'
    );
    const [beardUsers] = await query(
      'SELECT COUNT(DISTINCT user_id) as count FROM beard_tryon WHERE user_id IS NOT NULL'
    );

    res.json({
      success: true,
      stats: {
        totalHairstyle: hairstyleTotal.count,
        totalBeard: beardTotal.count,
        recentHairstyle: hairstyleRecent.count,
        recentBeard: beardRecent.count,
        uniqueHairstyleUsers: hairstyleUsers.count,
        uniqueBeardUsers: beardUsers.count,
      },
    });
  } catch (error) {
    if (tableMissing(error)) {
      return res.json({
        success: true,
        stats: {
          totalHairstyle: 0,
          totalBeard: 0,
          recentHairstyle: 0,
          recentBeard: 0,
          uniqueHairstyleUsers: 0,
          uniqueBeardUsers: 0,
        },
        message: 'Run backend/database/migrate_grooming_tryon.sql',
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteHairstyleTryOn = async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await query('SELECT id FROM hairstyle_tryon WHERE id = ?', [id]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    await query('DELETE FROM hairstyle_tryon WHERE id = ?', [id]);
    res.json({ success: true, message: 'Hairstyle session deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBeardTryOn = async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await query('SELECT id FROM beard_tryon WHERE id = ?', [id]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    await query('DELETE FROM beard_tryon WHERE id = ?', [id]);
    res.json({ success: true, message: 'Beard session deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
