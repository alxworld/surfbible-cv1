function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const BASE_STYLE = `
  font-family: Georgia, serif;
  background: #f9f7f4;
  margin: 0;
  padding: 0;
`;

const CARD_STYLE = `
  background: #ffffff;
  border-radius: 8px;
  max-width: 560px;
  margin: 40px auto;
  padding: 40px 48px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
`;

const FOOTER_STYLE = `
  text-align: center;
  font-size: 12px;
  color: #999;
  margin-top: 32px;
`;

function wrap(body: string, unsubLink: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="${BASE_STYLE}">
  <div style="${CARD_STYLE}">
    <div style="font-size:22px;font-weight:bold;color:#2d6a4f;margin-bottom:24px;">SurfBible</div>
    ${body}
    <div style="${FOOTER_STYLE}">
      <a href="${unsubLink}" style="color:#999;text-decoration:underline;">Unsubscribe from reminders</a>
    </div>
  </div>
</body>
</html>`;
}

export function reminderEmail(displayName: string | null, unsubLink: string): string {
  const name = esc(displayName ?? "friend");
  return wrap(`
    <p style="font-size:17px;color:#1a1a1a;margin:0 0 16px;">Hi ${name},</p>
    <p style="font-size:15px;color:#333;line-height:1.6;margin:0 0 24px;">
      It's time for your daily Bible reading. Open SurfBible and keep your streak going!
    </p>
    <a href="https://surfbible.in/dashboard"
       style="display:inline-block;background:#2d6a4f;color:#fff;text-decoration:none;
              padding:12px 28px;border-radius:6px;font-size:15px;">
      Read Today's Passage
    </a>
  `, unsubLink);
}

export function streakAlertEmail(
  displayName: string | null,
  streakCount: number,
  unsubLink: string,
): string {
  const name = esc(displayName ?? "friend");
  return wrap(`
    <p style="font-size:17px;color:#1a1a1a;margin:0 0 16px;">Hi ${name},</p>
    <p style="font-size:15px;color:#333;line-height:1.6;margin:0 0 8px;">
      Your <strong>${streakCount}-day streak</strong> is at risk!
    </p>
    <p style="font-size:15px;color:#333;line-height:1.6;margin:0 0 24px;">
      You haven't read today yet. Complete your reading before midnight to keep your streak alive.
    </p>
    <a href="https://surfbible.in/dashboard"
       style="display:inline-block;background:#b5451b;color:#fff;text-decoration:none;
              padding:12px 28px;border-radius:6px;font-size:15px;">
      Save My Streak
    </a>
  `, unsubLink);
}

export function weeklySummaryEmail(
  displayName: string | null,
  daysThisWeek: number,
  currentDay: number,
  totalDays: number,
  streakCount: number,
  unsubLink: string,
): string {
  const name = esc(displayName ?? "friend");
  const pct = Math.round((currentDay / totalDays) * 100);
  return wrap(`
    <p style="font-size:17px;color:#1a1a1a;margin:0 0 16px;">Hi ${name},</p>
    <p style="font-size:15px;color:#333;line-height:1.6;margin:0 0 4px;">
      Here's your reading recap for the week:
    </p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0 24px;">
      <tr>
        <td style="padding:8px 0;font-size:14px;color:#555;">Days read this week</td>
        <td style="padding:8px 0;font-size:15px;font-weight:bold;color:#2d6a4f;text-align:right;">${daysThisWeek} / 7</td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-size:14px;color:#555;">Current streak</td>
        <td style="padding:8px 0;font-size:15px;font-weight:bold;color:#2d6a4f;text-align:right;">${streakCount} days</td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-size:14px;color:#555;">Plan progress</td>
        <td style="padding:8px 0;font-size:15px;font-weight:bold;color:#2d6a4f;text-align:right;">Day ${currentDay} of ${totalDays} (${pct}%)</td>
      </tr>
    </table>
    <a href="https://surfbible.in/dashboard"
       style="display:inline-block;background:#2d6a4f;color:#fff;text-decoration:none;
              padding:12px 28px;border-radius:6px;font-size:15px;">
      Continue Reading
    </a>
  `, unsubLink);
}
