import Notification from '../models/Notification.js';
import User from '../models/User.js';

// ─── Expo Push API helper ────────────────────────────────────────────────────
// Sends push notifications via Expo's free push service (no account needed)
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

/**
 * Send push notifications to a list of Expo push tokens.
 * Expo accepts up to 100 tokens per request — we chunk automatically.
 * @param {Array<{to:string, title:string, body:string, data?:object}>} messages
 */
export async function sendExpoPushNotifications(messages) {
    if (!messages || messages.length === 0) return;

    const chunks = [];
    for (let i = 0; i < messages.length; i += 100) {
        chunks.push(messages.slice(i, i + 100));
    }

    for (const chunk of chunks) {
        try {
            const response = await fetch(EXPO_PUSH_URL, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Accept-encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(chunk),
            });
            const result = await response.json();
            // Whole-request rejection (e.g. tokens from two different Expo projects mixed in one batch)
            if (result.errors) console.error(`📲 Expo push rejected (HTTP ${response.status}):`, JSON.stringify(result.errors));

            // Per-device tickets — surface errors like InvalidCredentials (FCM key missing on EAS)
            // or DeviceNotRegistered (app uninstalled), grouped so 1000 failures are one log line
            const tickets = Array.isArray(result.data) ? result.data : [];
            const failures = {};
            for (const t of tickets.filter((t) => t.status === 'error')) {
                const key = t.details?.error || 'Error';
                failures[key] ??= { count: 0, example: t.message };
                failures[key].count++;
            }
            const failed = Object.values(failures).reduce((n, f) => n + f.count, 0);
            console.log(`📲 Expo push: ${tickets.length - failed}/${chunk.length} accepted`);
            for (const [error, { count, example }] of Object.entries(failures)) {
                console.error(`📲 Expo push failed for ${count} device(s) — ${error}: ${example}`);
            }
        } catch (err) {
            console.error('📲 Expo push delivery error:', err.message);
        }
    }
}

/**
 * Create an in-app notification for one user AND fire a real push to their
 * registered device, if any. Fire-and-forget on the push side — a slow or
 * failed push never blocks or fails the caller's request.
 *
 * @param {{user_id:string, type:string, title:string, message?:string, icon_name?:string, bg_color?:string, data?:object}} params
 */
export async function notifyUser({ user_id, type, title, message, icon_name, bg_color, data }) {
    const notification = await Notification.create({ user_id, type, title, message, icon_name, bg_color });

    const [recipient] = await User.getPushTokensByIds([user_id]);
    if (recipient?.expo_push_token) {
        sendExpoPushNotifications([{
            to: recipient.expo_push_token,
            title,
            body: message || '',
            sound: 'default',
            data: { type, ...data },
            channelId: 'default',
        }]).catch((err) => console.error('📲 Background push error:', err));
    }

    return notification;
}

/**
 * Create in-app notifications for several users AND fire real pushes to
 * whichever of them have a registered device. Fire-and-forget on the push
 * side, same as notifyUser.
 *
 * @param {string[]} userIds
 * @param {{type:string, title:string, message?:string, icon_name?:string, bg_color?:string, data?:object}} params
 */
export async function notifyUsers(userIds, { type, title, message, icon_name, bg_color, data }) {
    const notifications = await Promise.all(
        userIds.map((user_id) => Notification.create({ user_id, type, title, message, icon_name, bg_color }))
    );

    const recipients = await User.getPushTokensByIds(userIds);
    const pushMessages = recipients
        .filter((r) => r.expo_push_token)
        .map((r) => ({
            to: r.expo_push_token,
            title,
            body: message || '',
            sound: 'default',
            data: { type, ...data },
            channelId: 'default',
        }));

    sendExpoPushNotifications(pushMessages).catch((err) => console.error('📲 Background push error:', err));

    return notifications;
}
