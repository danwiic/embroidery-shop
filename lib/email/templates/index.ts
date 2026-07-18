const emailWrapper = (content: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Segoe UI', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
          <tr>
            <td style="background-color: #1e3a5f; padding: 28px 32px;">
              <p style="margin: 0; color: #c9a84c; font-size: 20px; font-weight: 700; letter-spacing: 1px;">JENDAVE</p>
              <p style="margin: 4px 0 0; color: #ffffff; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; opacity: 0.8;">Embroidery Shop</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px 32px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 32px; background-color: #fafafa; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Jendave Embroidery Shop. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const infoRow = (label: string, value: string) => `
  <tr>
    <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; width: 40%;">${label}</td>
    <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0; color: #171717; font-size: 14px; font-weight: 600; text-align: right;">${value}</td>
  </tr>`;

export const orderConfirmationEmail = ({
  name,
  orderNumber,
  estimatedCompletion,
}: {
  name: string;
  orderNumber: string;
  estimatedCompletion?: string;
}) =>
  emailWrapper(`
    <p style="margin: 0 0 4px; color: #c9a84c; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Order Confirmed</p>
    <h1 style="margin: 0 0 20px; color: #1e3a5f; font-size: 22px;">Thanks for your order, ${name}!</h1>
    <p style="margin: 0 0 24px; color: #374151; font-size: 14px; line-height: 1.6;">
      We've received your order and we're getting it ready. Here's a quick summary:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
      ${infoRow("Order Number", `#${orderNumber}`)}
      ${estimatedCompletion ? infoRow("Estimated Completion", estimatedCompletion) : ""}
    </table>
    <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
      We'll send you another email as soon as your order status changes.
    </p>
  `);

export const forgotPasswordEmail = ({
  name,
  resetLink,
}: {
  name: string;
  resetLink: string;
}) =>
  emailWrapper(`
    <p style="margin: 0 0 4px; color: #c9a84c; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Password Reset</p>
    <h1 style="margin: 0 0 20px; color: #1e3a5f; font-size: 22px;">Reset your password</h1>
    <p style="margin: 0 0 28px; color: #374151; font-size: 14px; line-height: 1.6;">
      Hi ${name}, we received a request to reset your password. Click the button below to choose a new one — this link expires in 1 hour.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${resetLink}" style="display: inline-block; background-color: #1e3a5f; color: #ffffff; font-size: 14px; font-weight: 600; padding: 14px 32px; border-radius: 8px; text-decoration: none;">
            Reset Password
          </a>
        </td>
      </tr>
    </table>
    <p style="margin: 28px 0 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
      If you didn't request this, you can safely ignore this email — your password won't change.
    </p>
  `);

export const statusUpdateEmail = ({
  name,
  orderNumber,
  status,
  note,
}: {
  name: string;
  orderNumber: string;
  status: string;
  note?: string;
}) =>
  emailWrapper(`
    <p style="margin: 0 0 4px; color: #c9a84c; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Status Update</p>
    <h1 style="margin: 0 0 20px; color: #1e3a5f; font-size: 22px;">Your order has been updated</h1>
    <p style="margin: 0 0 24px; color: #374151; font-size: 14px; line-height: 1.6;">
      Hi ${name}, here's the latest on order <strong>#${orderNumber}</strong>:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 8px;">
      ${infoRow("New Status", status.replace(/_/g, " "))}
    </table>
    ${
      note
        ? `<p style="margin: 20px 0 0; padding: 14px 16px; background-color: #fafafa; border-left: 3px solid #c9a84c; border-radius: 4px; color: #374151; font-size: 13px; line-height: 1.6;">
            <strong style="color: #1e3a5f;">Note:</strong> ${note}
          </p>`
        : ""
    }
  `);
