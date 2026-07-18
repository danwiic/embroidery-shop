import { Resend } from "resend";

const resendKey = process.env.RESEND_API_KEY;
if (!resendKey) {
  console.warn("RESEND_API_KEY is not set — emails will not be sent");
}

const resend = resendKey ? new Resend(resendKey) : null;

export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  if (!resend) {
    console.warn("Cannot send email: RESEND_API_KEY not configured");
    return;
  }

  const { data, error } = await resend.emails.send({
    from: "Jendave Embroidery Shop <onboarding@danpirante.dev>",
    to,
    subject,
    html,
  });

  if (error) {
    console.error("Resend error:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data;
};
