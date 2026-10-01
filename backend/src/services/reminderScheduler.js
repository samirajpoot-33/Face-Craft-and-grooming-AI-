/**
 * Reminder Scheduler
 *
 * Runs scheduled jobs to send notifications:
 * - Profile photo reminder (2 weeks)
 * - Weekly progress check reminder
 * - Hairstyle maintenance reminder
 * - Beard style reminder (makeup/grooming)
 */

import cron from 'node-cron';
import { query } from '../config/database.js';
import { createNotification } from './notificationService.js';

/**
 * Profile Photo Reminder
 * Users who haven't updated profile photo in 2+ weeks (or have no photo)
 * Runs daily at 9:00 AM
 * Works even if profile_picture_updated_at column doesn't exist yet
 */
async function runProfilePhotoReminder() {
  try {
    let users = [];
    try {
      users = await query(
        `SELECT u.id, u.username
         FROM users u
         WHERE (u.role != 'admin' OR u.role IS NULL)
           AND (
             (u.profile_picture IS NULL OR u.profile_picture = '')
             OR (u.profile_picture_updated_at IS NOT NULL AND u.profile_picture_updated_at < DATE_SUB(NOW(), INTERVAL 14 DAY))
           )
           AND NOT EXISTS (
             SELECT 1 FROM notifications n
             WHERE n.user_id = u.id
               AND n.type = 'profile_photo_reminder'
               AND n.created_at > DATE_SUB(NOW(), INTERVAL 14 DAY)
           )
        `
      );
    } catch (qerr) {
      if (qerr.message && qerr.message.includes('profile_picture_updated_at')) {
        // Column doesn't exist - use fallback: only users with no profile picture
        users = await query(
          `SELECT u.id, u.username
           FROM users u
           WHERE (u.role != 'admin' OR u.role IS NULL)
             AND (u.profile_picture IS NULL OR u.profile_picture = '')
             AND NOT EXISTS (
               SELECT 1 FROM notifications n
               WHERE n.user_id = u.id
                 AND n.type = 'profile_photo_reminder'
                 AND n.created_at > DATE_SUB(NOW(), INTERVAL 14 DAY)
             )
          `
        );
      } else {
        throw qerr;
      }
    }

    const list = Array.isArray(users) ? users : [];
    for (const row of list) {
      const uid = row.id ?? row.ID;
      if (uid == null) continue;
      await createNotification(
        uid,
        'profile_photo_reminder',
        'Update your profile photo',
        "You haven't updated your profile photo in the last two weeks. Update it for better analysis and recommendations.",
        '/dashboard'
      );
    }

    if (list.length > 0) {
      console.log(`[Reminders] Profile photo: sent ${list.length} reminder(s)`);
    }
  } catch (err) {
    console.error('[Reminders] Profile photo error:', err.message);
  }
}

/**
 * Weekly Progress Check Reminder
 * Users who haven't done face analysis in 7+ days
 * Runs every Monday at 10:00 AM
 */
async function runWeeklyProgressReminder() {
  try {
    const users = await query(
      `SELECT u.id
       FROM users u
       WHERE (u.role != 'admin' OR u.role IS NULL)
         AND EXISTS (SELECT 1 FROM face_analysis fa WHERE fa.user_id = u.id)
         AND (SELECT MAX(fa.analysis_date) FROM face_analysis fa WHERE fa.user_id = u.id) < DATE_SUB(NOW(), INTERVAL 7 DAY)
         AND NOT EXISTS (
           SELECT 1 FROM notifications n
           WHERE n.user_id = u.id
             AND n.type = 'weekly_progress'
             AND n.created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
         )
      `
    );

    for (const user of users) {
      await createNotification(
        user.id,
        'weekly_progress',
        'Weekly progress check',
        "It's time for your weekly progress check. Upload a new selfie to track changes.",
        '/face-analyzer'
      );
    }

    if (users.length > 0) {
      console.log(`[Reminders] Weekly progress: sent ${users.length} reminder(s)`);
    }
  } catch (err) {
    console.error('[Reminders] Weekly progress error:', err.message);
  }
}

/**
 * Hairstyle Maintenance Reminder
 * Similar to weekly - suggests new hairstyle recommendations
 * Runs every Sunday at 6:00 PM
 */
async function runHairstyleMaintenanceReminder() {
  try {
    const users = await query(
      `SELECT u.id
       FROM users u
       WHERE (u.role != 'admin' OR u.role IS NULL)
         AND EXISTS (SELECT 1 FROM face_analysis fa WHERE fa.user_id = u.id)
         AND (
           SELECT MAX(fa.analysis_date)
           FROM face_analysis fa
           WHERE fa.user_id = u.id
         ) < DATE_SUB(NOW(), INTERVAL 14 DAY)
         AND NOT EXISTS (
           SELECT 1 FROM notifications n
           WHERE n.user_id = u.id
             AND n.type = 'hairstyle_maintenance'
             AND n.created_at > DATE_SUB(NOW(), INTERVAL 14 DAY)
         )
      `
    );

    for (const user of users) {
      await createNotification(
        user.id,
        'hairstyle_maintenance',
        'New hairstyle ideas',
        "Thinking of a new look? Try updated hairstyle recommendations tailored for you.",
        '/face-analyzer'
      );
    }

    if (users.length > 0) {
      console.log(`[Reminders] Hairstyle maintenance: sent ${users.length} reminder(s)`);
    }
  } catch (err) {
    console.error('[Reminders] Hairstyle maintenance error:', err.message);
  }
}

/**
 * Beard Style Reminder
 * Users who have makeup try-on sessions but haven't tried in 14+ days
 * Runs every Saturday at 11:00 AM
 */
async function runBeardStyleReminder() {
  try {
    const users = await query(
      `SELECT u.id
       FROM users u
       WHERE (u.role != 'admin' OR u.role IS NULL)
         AND EXISTS (SELECT 1 FROM makeup_tryon mt WHERE mt.user_id = u.id)
         AND (SELECT MAX(mt.created_at) FROM makeup_tryon mt WHERE mt.user_id = u.id) < DATE_SUB(NOW(), INTERVAL 14 DAY)
         AND NOT EXISTS (
           SELECT 1 FROM notifications n
           WHERE n.user_id = u.id
             AND n.type = 'beard_reminder'
             AND n.created_at > DATE_SUB(NOW(), INTERVAL 14 DAY)
         )
      `
    );

    for (const user of users) {
      await createNotification(
        user.id,
        'beard_reminder',
        'Time to refresh your look',
        'Time to refresh your beard style. New makeup and grooming recommendations are available.',
        '/makeup-virtual-try'
      );
    }

    if (users.length > 0) {
      console.log(`[Reminders] Beard style: sent ${users.length} reminder(s)`);
    }
  } catch (err) {
    console.error('[Reminders] Beard style error:', err.message);
  }
}

/**
 * Send welcome notification to non-admin users who have never received any notification
 * (runs once on server start - so new users see something in the bell)
 */
async function runWelcomeNotifications() {
  try {
    const users = await query(
      `SELECT u.id FROM users u
       WHERE (u.role != 'admin' OR u.role IS NULL)
         AND NOT EXISTS (SELECT 1 FROM notifications n WHERE n.user_id = u.id)`
    );
    const list = Array.isArray(users) ? users : [];
    for (const row of list) {
      const uid = row.id ?? row.ID;
      if (uid == null) continue;
      await createNotification(
        uid,
        'new_feature',
        'Welcome to FaceCraft',
        'Check out Face Analyzer and Makeup Virtual Try-On. Click the bell icon for updates.',
        '/face-analyzer'
      );
    }
    if (list.length > 0) {
      console.log(`[Reminders] Welcome notification sent to ${list.length} user(s) who had none`);
    }
  } catch (err) {
    console.error('[Reminders] Welcome notification error:', err.message);
  }
}

/**
 * Run all reminder checks once (for testing / so reminders fire soon after startup)
 */
async function runAllRemindersOnce() {
  const delayMs = 15000; // 15 seconds after server start
  setTimeout(async () => {
    await runProfilePhotoReminder();
    await runWeeklyProgressReminder();
    await runHairstyleMaintenanceReminder();
    await runBeardStyleReminder();
  }, delayMs);
}

/**
 * Start all reminder cron jobs
 */
export function startReminderScheduler() {
  // Run welcome notification once so users see something in the bell
  runWelcomeNotifications();

  // Run all reminder checks once after 15s (so users get reminders soon after server start)
  runAllRemindersOnce();

  // Profile photo: daily at 9:00 AM
  cron.schedule('0 9 * * *', runProfilePhotoReminder);

  // Weekly progress: every Monday at 10:00 AM
  cron.schedule('0 10 * * 1', runWeeklyProgressReminder);

  // Hairstyle maintenance: every Sunday at 6:00 PM
  cron.schedule('0 18 * * 0', runHairstyleMaintenanceReminder);

  // Beard style: every Saturday at 11:00 AM
  cron.schedule('0 11 * * 6', runBeardStyleReminder);

  console.log('[Reminders] Scheduler started (welcome + profile photo, weekly progress, hairstyle maintenance, beard style)');
}
