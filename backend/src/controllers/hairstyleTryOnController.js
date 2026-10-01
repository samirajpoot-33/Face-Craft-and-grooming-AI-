/**

 * Hairstyle Try-On — proxies to AILabTools Hairstyle Changer Pro

 */



import { swapHairstyle } from '../services/ailabHairstyleService.js';
import { saveHairstyleTryOnSession } from '../services/tryOnSessionStore.js';
import { deductCredit } from '../services/creditService.js';

import {

  resolveHairStyle,

  resolveHairStyleLabel,

  getMaxStyleId,

  MALE_HAIR_STYLES,

  FEMALE_HAIR_STYLES,

  HAIRSTYLE_COUNTS,

} from '../config/hairstyleStyles.js';



/**

 * POST /api/hairstyle-tryon/swap

 * Body (multipart): image, gender (male|female), styleId

 */

export const swapHairstyleHandler = async (req, res) => {

  try {

    if (!req.file) {

      return res.status(400).json({

        success: false,

        message: 'Please upload a photo',

      });

    }



    const gender = (req.body.gender || 'female').toLowerCase();

    if (gender !== 'male' && gender !== 'female') {

      return res.status(400).json({

        success: false,

        message: 'gender must be male or female',

      });

    }



    const styleId = Number(req.body.styleId);

    const maxStyleId = getMaxStyleId(gender);

    if (!styleId || styleId < 1 || styleId > maxStyleId) {

      return res.status(400).json({

        success: false,

        message: `Please select a hairstyle (styleId 1–${maxStyleId})`,

      });

    }



    const hairStyle = resolveHairStyle(gender, styleId);

    const hairStyleLabel = resolveHairStyleLabel(gender, styleId);



    console.log('💇 Hairstyle swap:', { gender, styleId, hairStyle });



    const result = await swapHairstyle({
      imageBuffer: req.file.buffer,
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      hairStyle,
    });

    const userId = req.user?.id ?? null;
    const sessionId = await saveHairstyleTryOnSession({
      userId,
      gender,
      styleId,
      hairStyle,
      hairStyleLabel,
      resultImageUrl: result.resultImageUrl,
      taskId: result.taskId,
    });

    // Deduct 1 credit
    if (userId) {
      await deductCredit(userId, `Hairstyle swap: ${hairStyleLabel}`);
    }

    res.status(200).json({
      success: true,
      message: 'Hairstyle applied successfully',
      data: {
        resultImageUrl: result.resultImageUrl,
        hairStyle,
        hairStyleLabel,
        gender,
        styleId,
        taskId: result.taskId,
        sessionId,
      },
    });

  } catch (error) {

    console.error('❌ Hairstyle swap error:', error.message);

    const isConfig = error.message?.includes('AILAB_API_KEY');

    res.status(isConfig ? 503 : 502).json({

      success: false,

      message: error.message || 'Hairstyle swap failed',

    });

  }

};



function stylesForClient(map) {

  return Object.fromEntries(

    Object.entries(map).map(([id, { api, label }]) => [

      id,

      { api, label },

    ])

  );

}



export const getHairstyleStyles = (req, res) => {

  res.json({

    success: true,

    data: {

      male: stylesForClient(MALE_HAIR_STYLES),

      female: stylesForClient(FEMALE_HAIR_STYLES),

      counts: HAIRSTYLE_COUNTS,

    },

  });

};

