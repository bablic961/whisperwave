// lib/notifications.ts - Push Notifications
import { NextResponse } from 'next/server';
import webpush from 'web-push';

// Configure web-push with VAPID keys
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL || 'admin@whisperwave.app'}`,
    vapidPublicKey,
    vapidPrivateKey
  );
}

export interface PushNotification {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, string>;
  tag?: string;
  action?: string;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export async function sendPushNotification(
  subscription: PushSubscription,
  payload: PushNotification
): Promise<boolean> {
  try {
    if (!vapidPublicKey || !vapidPrivateKey) {
      console.warn('VAPID keys not configured');
      return false;
    }

    const payloadString = JSON.stringify(payload);
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      },
      payloadString
    );
    return true;
  } catch (error) {
    console.error('Push notification error:', error);
    return false;
  }
}

export async function sendBatchNotifications(
  subscriptions: PushSubscription[],
  payload: PushNotification
): Promise<{ success: number; failed: number }> {
  const results = await Promise.all(
    subscriptions.map((subscription) =>
      sendPushNotification(subscription, payload)
        .then(() => ({ success: true }))
        .catch(() => ({ success: false }))
    )
  );

  return {
    success: results.filter((r) => r.success).length,
    failed: results.length - results.filter((r) => r.success).length,
  };
}

export async function sendEmailNotification(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  try {
    const { createTransport } = await import('nodemailer');

    const transporter = createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"${process.env.APP_NAME || 'WhisperWave'}" <${process.env.SMTP_FROM}>`,
      to,
      subject,
      html,
    });

    return true;
  } catch (error) {
    console.error('Email notification error:', error);
    return false;
  }
}

export async function sendSMSNotification(
  phoneNumber: string,
  message: string
): Promise<boolean> {
  // SMS implementation would use a service like Twilio
  console.log(`[SMS] To: ${phoneNumber}, Message: ${message}`);
  return true;
}

export function generateVapidKeys(): { publicKey: string; privateKey: string } {
  return webpush.generateVAPIDKeys();
}
