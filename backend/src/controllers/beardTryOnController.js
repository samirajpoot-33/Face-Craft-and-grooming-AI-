/**
 * Beard Try-On — proxies to AILabTools AI Beard Styling
 */

import { swapBeard } from '../services/ailabBeardService.js';
import { saveBeardTryOnSession } from '../services/tryOnSessionStore.js';
import { fetchImageBufferFromUrl } from '../services/ailabAsync.js';
import { deductCredit } from '../services/creditService.js';
import {
  resolveBeardStyle,
  resolveBeardStyleLabel,
  getMaxBeardStyleId,
  BEARD_STYLES,
  BEARD_STYLE_COUNT,
} from '../config/beardStyles.js';

/**
 * POST /api/beard-tryon/swap
 * Body (multipart): image (optional if sourceImageUrl), styleId, sourceImageUrl (optional)
 */
export const swapBeardHandler = async (req, res) => {
  req.setTimeout(180000);
  res.setTimeout(180000);

  try {
    const styleId = Number(req.body.styleId);
    const maxStyleId = getMaxBeardStyleId();
    if (!styleId || styleId < 1 || styleId > maxStyleId) {
      return res.status(400).json({
        success: false,
        message: `Please select a beard style (styleId 1–${maxStyleId})`,
      });
    }

    let imageBuffer;
    let filename = 'photo.jpg';
    let mimetype = 'image/jpeg';

    if (req.file?.buffer) {
      imageBuffer = req.file.buffer;
      filename = req.file.originalname || filename;
      mimetype = req.file.mimetype || mimetype;
    } else if (req.body.sourceImageUrl?.trim()) {
      const fetched = await fetchImageBufferFromUrl(req.body.sourceImageUrl.trim());
      imageBuffer = fetched.buffer;
      filename = fetched.filename;
      mimetype = fetched.mimetype;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please upload a photo or provide a valid source image URL',
      });
    }

    const beard = resolveBeardStyle(styleId);
    const beardLabel = resolveBeardStyleLabel(styleId);

    console.log('🧔 Beard swap:', { styleId, beard, fromUrl: !!req.body.sourceImageUrl });

    const result = await swapBeard({
      imageBuffer,
      filename,
      mimetype,
      beard,
    });

    console.log('✅ Beard swap done:', result.taskId);

    const userId = req.user?.id ?? null;
    const sourceType = req.body.sourceImageUrl?.trim() ? 'hairstyle_result' : 'upload';
    const sessionId = await saveBeardTryOnSession({
      userId,
      styleId,
      beard,
      beardLabel,
      resultImageUrl: result.resultImageUrl,
      taskId: result.taskId,
      sourceType,
    });

    // Deduct 1 credit
    if (userId) {
      await deductCredit(userId, `Beard swap: ${beardLabel}`);
    }

    res.status(200).json({
      success: true,
      message: 'Beard style applied successfully',
      data: {
        resultImageUrl: result.resultImageUrl,
        beard,
        beardLabel,
        styleId,
        taskId: result.taskId,
        sessionId,
      },
    });
  } catch (error) {
    console.error('❌ Beard swap error:', error.message);
    const isConfig = error.message?.includes('AILAB_API_KEY');
    res.status(isConfig ? 503 : 502).json({
      success: false,
      message: error.message || 'Beard swap failed',
    });
  }
};

function stylesForClient(map) {
  return Object.fromEntries(
    Object.entries(map).map(([id, { api, label }]) => [id, { api, label }])
  );
}

export const getBeardStyles = (req, res) => {
  res.json({
    success: true,
    data: {
      styles: stylesForClient(BEARD_STYLES),
      count: BEARD_STYLE_COUNT,
    },
  });
};
