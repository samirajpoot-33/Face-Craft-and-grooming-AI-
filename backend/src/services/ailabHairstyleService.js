/**
 * AILabTools Hairstyle Changer Pro API client
 * @see https://www.ailabtools.com/docs/ai-portrait/effects/hairstyle-editor-pro
 */

import {
  AILAB_BASE,
  getAilabApiKey,
  parseAilabError,
  isAilabFailure,
  pollAilabTask,
} from './ailabAsync.js';

const SUBMIT_URL = `${AILAB_BASE}/api/portrait/effects/hairstyle-editor-pro`;

/**
 * Submit async hairstyle swap task
 * @returns {Promise<string>} task_id
 */
export async function submitHairstyleTask({ imageBuffer, filename, mimetype, hairStyle }) {
  const apiKey = getAilabApiKey('Hairstyle AI');
  const formData = new FormData();
  const blob = new Blob([imageBuffer], { type: mimetype || 'image/jpeg' });
  formData.append('image', blob, filename || 'photo.jpg');
  formData.append('task_type', 'async');
  formData.append('auto', '1');
  formData.append('hair_style', hairStyle);
  formData.append('image_size', '1');

  const response = await fetch(SUBMIT_URL, {
    method: 'POST',
    headers: { 'ailabapi-api-key': apiKey },
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (isAilabFailure(data, response.ok)) {
    throw new Error(parseAilabError(data, `AILab submit failed (${response.status})`));
  }

  const taskId = data.task_id;
  if (!taskId) {
    throw new Error('AILab did not return a task_id');
  }
  return taskId;
}

/** @deprecated use pollAilabTask from ailabAsync.js */
export async function pollHairstyleTask(taskId) {
  return pollAilabTask(taskId, { featureLabel: 'Hairstyle processing' });
}

/**
 * Full swap: submit + poll
 */
export async function swapHairstyle(options) {
  const taskId = await submitHairstyleTask(options);
  const images = await pollHairstyleTask(taskId);
  return { taskId, resultImageUrl: images[0], allImages: images };
}
