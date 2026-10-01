/**
 * Shared AILab async task submit helpers (poll + image extraction)
 */

export const AILAB_BASE = 'https://www.ailabapi.com';
export const POLL_INTERVAL_MS = 3000;
export const MAX_POLL_ATTEMPTS = 50; // ~2.5 minutes

export function getAilabApiKey(featureLabel = 'AI') {
  const key = process.env.AILAB_API_KEY?.trim();
  if (!key) {
    throw new Error(
      `${featureLabel} is not configured. Add AILAB_API_KEY to backend/.env (https://www.ailabtools.com/docs/get-api-key).`
    );
  }
  return key;
}

export function parseAilabError(data, fallback) {
  const code = data?.error_detail?.code || data?.error_code_str || '';
  if (code === 'ERROR_NOT_ENOUGH_CREDITS' || data?.error_code === 429) {
    return (
      'AILab API credits are empty. Buy Universal Credits at https://www.ailabtools.com ' +
      '(Developer account → billing). Website “tool credits” are separate from API credits.'
    );
  }
  const detail = data?.error_detail;
  return (
    detail?.message ||
    detail?.code_message ||
    data?.error_msg ||
    data?.error_code_str ||
    fallback
  );
}

export function isAilabFailure(data, httpOk) {
  if (!httpOk) return true;
  if (data?.error_code == null) return false;
  return Number(data.error_code) !== 0;
}

export function extractResultImages(data) {
  const list = data?.data?.images;
  if (Array.isArray(list) && list.length) {
    return list.filter((u) => typeof u === 'string' && u.length > 0);
  }

  const imageUrls = data?.data?.image_urls;
  if (Array.isArray(imageUrls) && imageUrls.length) {
    return imageUrls.filter((u) => typeof u === 'string' && u.length > 0);
  }

  const d = data?.data;
  const directFields = [
    d?.image,
    d?.image_url,
    d?.result_image,
    d?.result_url,
    d?.output_url,
    d?.url,
    d?.output,
  ];
  for (const field of directFields) {
    if (typeof field === 'string' && field.startsWith('http')) return [field];
    if (typeof field === 'string' && field.length > 100) {
      return [`data:image/jpeg;base64,${field}`];
    }
  }

  const urls = [];
  const walk = (node) => {
    if (!node) return;
    if (typeof node === 'string') {
      if (node.startsWith('http://') || node.startsWith('https://')) urls.push(node);
      else if (node.length > 200) urls.push(`data:image/jpeg;base64,${node}`);
      return;
    }
    if (Array.isArray(node)) node.forEach(walk);
    else if (typeof node === 'object') Object.values(node).forEach(walk);
  };
  walk(d);
  if (urls.length) return [urls[0]];

  return [];
}

/**
 * Poll async task until complete
 * @returns {Promise<string[]>} image URLs
 */
export async function pollAilabTask(taskId, { featureLabel = 'Processing' } = {}) {
  const apiKey = getAilabApiKey(featureLabel);
  const queryUrl = `${AILAB_BASE}/api/common/query-async-task-result?task_id=${encodeURIComponent(taskId)}`;

  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    const response = await fetch(queryUrl, {
      method: 'GET',
      headers: { 'ailabapi-api-key': apiKey },
    });

    const data = await response.json().catch(() => ({}));

    if (isAilabFailure(data, response.ok)) {
      throw new Error(parseAilabError(data, `AILab poll failed (${response.status})`));
    }

    const status = data.task_status;
    if (status === 2) {
      const images = extractResultImages(data);
      if (!images.length) {
        console.error(
          `[AILab] ${featureLabel} poll completed with empty images. task_id=${taskId} data keys:`,
          data?.data ? Object.keys(data.data) : 'none',
          JSON.stringify(data?.data)?.slice(0, 500)
        );
        throw new Error('AILab completed but returned no images');
      }
      return images;
    }

    if (status !== 0 && status !== 1) {
      throw new Error(parseAilabError(data, `${featureLabel} failed`));
    }

    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }

  throw new Error(`${featureLabel} timed out. Please try again.`);
}

/**
 * Download remote image (e.g. hairstyle result URL) for beard/hair pipeline
 */
export async function fetchImageBufferFromUrl(url) {
  if (!url || typeof url !== 'string') {
    throw new Error('Invalid image URL');
  }
  if (!/^https?:\/\//i.test(url)) {
    throw new Error('Image URL must be http or https');
  }

  const response = await fetch(url, { redirect: 'follow' });
  if (!response.ok) {
    throw new Error(`Could not load image from URL (${response.status})`);
  }

  const contentType = response.headers.get('content-type') || 'image/jpeg';
  if (!contentType.startsWith('image/')) {
    throw new Error('URL did not return an image');
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length > 10 * 1024 * 1024) {
    throw new Error('Image is too large (max 10 MB)');
  }

  const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
  return { buffer, mimetype: contentType, filename: `source.${ext}` };
}
