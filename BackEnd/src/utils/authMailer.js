import nodemailer from "nodemailer";

const buildOtpEmailHtml = ({ firstName, otp }) => `
  <div style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Roboto,Arial,sans-serif">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 0">
      <tr>
        <td align="center">
          <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06)">
            
            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(135deg,#312e81 0%,#4f46e5 100%);padding:32px 40px;text-align:center">
                <h1 style="margin:0;font-size:26px;font-weight:800;color:#ffffff;letter-spacing:1px">CodeRax</h1>
                <p style="margin:6px 0 0;font-size:13px;color:#c7d2fe;letter-spacing:0.5px">Email Verification</p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:36px 40px 20px">
                <p style="margin:0 0 18px;font-size:16px;color:#1e293b;line-height:1.6">
                  Hi <strong>${firstName || "there"}</strong>,
                </p>
                <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6">
                  Thank you for signing up! Please use the verification code below to complete your registration:
                </p>
                
                <!-- OTP Box -->
                <div style="text-align:center;margin:0 0 28px">
                  <div style="display:inline-block;padding:16px 36px;background:#eef2ff;border:2px dashed #a5b4fc;border-radius:12px;font-size:32px;font-weight:800;letter-spacing:10px;color:#312e81;font-family:'Courier New',monospace">
                    ${otp}
                  </div>
                </div>

                <!-- Expiry Notice -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
                  <tr>
                    <td style="background:#fef9c3;border-left:4px solid #eab308;padding:12px 16px;border-radius:0 8px 8px 0">
                      <p style="margin:0;font-size:13px;color:#854d0e;line-height:1.5">
                        ⏱️ This code is valid for <strong>10 minutes</strong>. Please do not share it with anyone.
                      </p>
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 8px;font-size:14px;color:#64748b;line-height:1.6">
                  If you didn't create an account on CodeRax, you can safely ignore this email.
                </p>
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style="padding:0 40px">
                <hr style="border:none;border-top:1px solid #e2e8f0;margin:0" />
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:20px 40px 28px;text-align:center">
                <p style="margin:0 0 4px;font-size:12px;color:#94a3b8">
                  This is an automated message from CodeRax.
                </p>
                <p style="margin:0;font-size:12px;color:#94a3b8">
                  © ${new Date().getFullYear()} CodeRax · All rights reserved.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </div>
`;

let cachedTransporter = null;

const getMailConfig = () => ({
    from: process.env.AUTH_FROM_EMAIL || process.env.GOOGLE_SENDER_EMAIL,
    senderEmail: process.env.GOOGLE_SENDER_EMAIL,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
});

const createTransporter = ({ senderEmail, clientId, clientSecret, refreshToken }) =>
    nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: senderEmail,
            clientId,
            clientSecret,
            refreshToken,
        },
    });

const getTransporter = () => {
    if (cachedTransporter) return cachedTransporter;

    const { senderEmail, clientId, clientSecret, refreshToken } = getMailConfig();
    cachedTransporter = createTransporter({ senderEmail, clientId, clientSecret, refreshToken });
    return cachedTransporter;
};

export const sendOtpEmail = async ({ emailId, firstName, otp }) => {
    const { from, senderEmail, clientId, clientSecret, refreshToken } = getMailConfig();
    const isProduction = process.env.NODE_ENV === "production";

    if (!from || !senderEmail || !clientId || !clientSecret || !refreshToken) {
        if (isProduction) {
            throw new Error("Gmail OTP sender is not configured.");
        }

        console.log(`[OTP DEV MODE] ${emailId}: ${otp}`);
        return { delivered: false, mode: "dev-log" };
    }

    try {
        const transporter = getTransporter();
        const info = await transporter.sendMail({
            from,
            to: emailId,
            subject: "Your CodeRax verification code",
            html: buildOtpEmailHtml({ firstName, otp }),
        });

        return { delivered: true, mode: "gmail-oauth2", messageId: info.messageId };
    } catch (error) {
        cachedTransporter = null;
        console.error("Gmail OTP send failed:", error?.message || error);
        throw new Error("Failed to send OTP email. Please try again.");
    }
};
