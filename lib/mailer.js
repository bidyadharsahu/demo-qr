const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465', 10);
const SMTP_SECURE = String(process.env.SMTP_SECURE || 'true').toLowerCase() === 'true';
const SMTP_USER = process.env.SMTP_USER || process.env.GMAIL_USER || 'namasterides26@gmail.com';
const SMTP_PASS = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '';
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER || 'namasterides26@gmail.com';

function mailConfigured() {
  return Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);
}

function toText(payload) {
  const {
    restaurantName,
    ownerName,
    subscription,
    domain,
    address,
    contact,
    managerCreds,
    chefCreds,
    supportEmail,
    supportPhone,
  } = payload;

  return [
    `Welcome to Netrik Shop, ${ownerName || 'Restaurant Team'}!`,
    '',
    `Restaurant: ${restaurantName}`,
    `Subscription: ${subscription}`,
    `Domain: ${domain || '-'}`,
    `Address: ${address || '-'}`,
    `Contact Number: ${contact || '-'}`,
    '',
    'Manager Login',
    `User ID: ${managerCreds?.userId || '-'}`,
    `Password: ${managerCreds?.password || '-'}`,
    '',
    'Chef Login',
    `User ID: ${chefCreds?.userId || '-'}`,
    `Password: ${chefCreds?.password || '-'}`,
    '',
    'Support Contacts',
    `Email: ${supportEmail}`,
    `Phone/WhatsApp: ${supportPhone}`,
    '',
    'This email contains operational account details for your restaurant dashboard.',
  ].join('\n');
}

function toHtml(payload) {
  const {
    restaurantName,
    ownerName,
    subscription,
    domain,
    address,
    contact,
    managerCreds,
    chefCreds,
    supportEmail,
    supportPhone,
  } = payload;

  const row = (label, value) => `
    <tr>
      <td style="padding:10px 12px;color:#9ca3af;font-size:13px;border-bottom:1px solid #1f2937;">${label}</td>
      <td style="padding:10px 12px;color:#f9fafb;font-size:13px;border-bottom:1px solid #1f2937;">${value || '-'}</td>
    </tr>`;

  return `
    <div style="background:#07090f;padding:24px;font-family:Segoe UI, Arial, sans-serif;color:#f9fafb;">
      <div style="max-width:700px;margin:0 auto;background:#111827;border:1px solid #1f2937;border-radius:14px;overflow:hidden;">
        <div style="padding:18px 22px;background:linear-gradient(90deg,#fbbf24,#fb7185);color:#111827;font-weight:700;font-size:18px;">
          Netrik Shop - Restaurant Onboarding
        </div>
        <div style="padding:20px 22px;line-height:1.6;">
          <p style="margin:0 0 14px 0;">Hi ${ownerName || 'Team'},</p>
          <p style="margin:0 0 18px 0;color:#d1d5db;">Your restaurant workspace is now active. Here are your account and subscription details.</p>

          <table style="width:100%;border-collapse:collapse;background:#0b1220;border:1px solid #1f2937;border-radius:10px;overflow:hidden;">
            ${row('Restaurant', restaurantName)}
            ${row('Subscription', subscription)}
            ${row('Domain', domain || '-')}
            ${row('Address', address || '-')}
            ${row('Contact Number', contact || '-')}
          </table>

          <div style="margin-top:18px;padding:14px;border:1px solid #374151;border-radius:10px;background:#0b1220;">
            <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.09em;color:#fbbf24;margin-bottom:8px;">Manager Login</div>
            <div style="font-size:14px;">User ID: <b>${managerCreds?.userId || '-'}</b></div>
            <div style="font-size:14px;">Password: <b>${managerCreds?.password || '-'}</b></div>
          </div>

          <div style="margin-top:12px;padding:14px;border:1px solid #374151;border-radius:10px;background:#0b1220;">
            <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.09em;color:#fbbf24;margin-bottom:8px;">Chef Login</div>
            <div style="font-size:14px;">User ID: <b>${chefCreds?.userId || '-'}</b></div>
            <div style="font-size:14px;">Password: <b>${chefCreds?.password || '-'}</b></div>
          </div>

          <div style="margin-top:18px;padding:14px;border:1px dashed #4b5563;border-radius:10px;background:#0b1220;">
            <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.09em;color:#fbbf24;margin-bottom:8px;">Need Help?</div>
            <div style="font-size:14px;">Email: <a href="mailto:${supportEmail}" style="color:#93c5fd;text-decoration:none;">${supportEmail}</a></div>
            <div style="font-size:14px;">Phone/WhatsApp: <a href="https://wa.me/16562145190" style="color:#93c5fd;text-decoration:none;">${supportPhone}</a></div>
          </div>
        </div>
      </div>
    </div>`;
}

export async function sendRestaurantOnboardingEmail(payload) {
  if (!payload?.toEmail) return { sent: false, reason: 'missing-recipient' };
  if (!mailConfigured()) {
    console.warn('[mail] SMTP not configured, skipped send to:', payload.toEmail);
    return { sent: false, reason: 'smtp-not-configured' };
  }

  try {
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    await transporter.sendMail({
      from: SMTP_FROM,
      to: payload.toEmail,
      subject: `Netrik Shop Onboarding Details - ${payload.restaurantName}`,
      text: toText(payload),
      html: toHtml(payload),
    });

    return { sent: true };
  } catch (error) {
    console.error('[mail] Failed to send onboarding email:', error);
    return { sent: false, reason: 'smtp-error' };
  }
}
