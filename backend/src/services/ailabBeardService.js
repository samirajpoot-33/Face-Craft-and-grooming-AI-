/**
 * AILabTools AI Beard Styling API client
 * @see https://www.ailabtools.com/docs/ai-portrait/editing/ai-beard-styling/api
 */

import {
  AILAB_BASE,
  getAilabApiKey,
  parseAilabError,
  isAilabFailure,
  pollAilabTask,
} from './ailabAsync.js';

const SUBMIT_URL = `${AILAB_BASE}/api/portrait/editing/ai-beard-styling`;

/**
 * Submit async beard styling task
 * @returns {Promise<string>} task_id
 */
export async function submitBeardTask({ imageBuffer, filename, mimetype, beard }) {
  const apiKey = getAilabApiKey('Beard AI');
  const formData = new FormData();
  const blob = new Blob([imageBuffer], { type: mimetype || 'image/jpeg' });
  formData.append('image', blob, filename || 'photo.jpg');
  formData.append('beard', beard);

  const response = await fetch(SUBMIT_URL, {
    method: 'POST',
    headers: { 'ailabapi-api-key': apiKey },
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (isAilabFailure(data, response.ok)) {
    console.error('[AILab Beard] submit failed:', JSON.stringify(data)?.slice(0, 800));
    throw new Error(parseAilabError(data, `AILab beard submit failed (${response.status})`));
  }

  const taskId = data.task_id;
  if (!taskId) {
    console.error('[AILab Beard] no task_id:', JSON.stringify(data)?.slice(0, 800));
    throw new Error('AILab did not return a task_id');
  }

  console.log('[AILab Beard] task submitted:', taskId);
  return taskId;
}

/**
 * Full beard swap: submit + poll
 */
export async function swapBeard(options) {
  const taskId = await submitBeardTask(options);
  const images = await pollAilabTask(taskId, { featureLabel: 'Beard styling' });
  return { taskId, resultImageUrl: images[0], allImages: images };
}
