/**
 * Persist hairstyle / beard try-on sessions for admin reporting
 */

import { query } from '../config/database.js';

export async function saveHairstyleTryOnSession({
  userId,
  gender,
  styleId,
  hairStyle,
  hairStyleLabel,
  resultImageUrl,
  taskId,
}) {
  try {
    const result = await query(
      `INSERT INTO hairstyle_tryon
        (user_id, gender, style_id, hair_style, hair_style_label, result_image_url, task_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId ?? null,
        gender,
        styleId,
        hairStyle,
        hairStyleLabel,
        resultImageUrl,
        taskId ?? null,
      ]
    );
    console.log('💾 Saved hairstyle try-on session:', result.insertId);
    return result.insertId;
  } catch (err) {
    console.error('⚠️ Could not save hairstyle try-on session:', err.message);
    return null;
  }
}

export async function saveBeardTryOnSession({
  userId,
  styleId,
  beard,
  beardLabel,
  resultImageUrl,
  taskId,
  sourceType,
}) {
  try {
    const result = await query(
      `INSERT INTO beard_tryon
        (user_id, style_id, beard, beard_label, result_image_url, task_id, source_type)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId ?? null,
        styleId,
        beard,
        beardLabel,
        resultImageUrl,
        taskId ?? null,
        sourceType || 'upload',
      ]
    );
    console.log('💾 Saved beard try-on session:', result.insertId);
    return result.insertId;
  } catch (err) {
    console.error('⚠️ Could not save beard try-on session:', err.message);
    return null;
  }
}
