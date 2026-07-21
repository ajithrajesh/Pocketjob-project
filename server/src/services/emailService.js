import nodemailer from "nodemailer";

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (emailUser && emailPass) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
  } else {
    // Development fallback using Ethereal test SMTP or mock logger
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log("ℹ️ Email Service initialized with Ethereal SMTP test account:", testAccount.user);
    } catch (err) {
      console.warn("⚠️ Nodemailer test account creation failed, emails will be logged to console:", err.message);
      transporter = {
        sendMail: async (mailOptions) => {
          console.log("================ PRESET EMAIL DISPATCH ================");
          console.log(`To: ${mailOptions.to}`);
          console.log(`Subject: ${mailOptions.subject}`);
          console.log(`Body:\n${mailOptions.text || mailOptions.html}`);
          console.log("=======================================================");
          return { messageId: "mock-email-id-" + Date.now() };
        },
      };
    }
  }

  return transporter;
};

/**
 * Send Preset Email Notification to Gmail inbox
 */
export const sendPresetEmail = async ({
  to,
  subject,
  recipientName = "User",
  activityTitle,
  activityMessage,
  presetTemplateText = "",
  actionUrl = "http://localhost:5173/dashboard",
}) => {
  if (!to) {
    console.warn("⚠️ Cannot send email: No destination email specified.");
    return;
  }

  try {
    const transport = await getTransporter();

    const senderEmail = process.env.EMAIL_USER || "no-reply@pocketjob.com";
    const senderName = "pocketJob Notifications";

    const customNote = presetTemplateText
      ? `<div style="background-color: #f0f4f9; border-left: 4px solid #0d6efd; padding: 12px 16px; margin: 16px 0; border-radius: 4px; color: #333;">
          <p style="margin: 0; font-size: 13px; font-weight: 600; color: #0d6efd;">Preset Profile Message:</p>
          <p style="margin: 4px 0 0 0; font-style: italic;">"${presetTemplateText}"</p>
        </div>`
      : "";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #0d6efd, #0b5ed7); padding: 24px; text-align: center; color: white; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; }
          .body-content { padding: 30px 24px; color: #212529; }
          .title { font-size: 18px; font-weight: 600; color: #0d6efd; margin-top: 0; }
          .message-box { background: #f8f9fa; border: 1px solid #e9ecef; padding: 16px; border-radius: 6px; margin: 16px 0; }
          .btn { display: inline-block; background-color: #0d6efd; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; margin-top: 20px; }
          .footer { background: #f1f3f5; padding: 16px; text-align: center; font-size: 12px; color: #6c757d; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>pocketJob</h1>
          </div>
          <div class="body-content">
            <p>Hello <strong>${recipientName}</strong>,</p>
            <h3 class="title">${activityTitle}</h3>
            
            <div class="message-box">
              <p style="margin: 0; line-height: 1.5;">${activityMessage}</p>
            </div>

            ${customNote}

            <p>You can view and manage this activity on your pocketJob dashboard:</p>
            <div style="text-align: center;">
              <a href="${actionUrl}" class="btn">Go to Dashboard</a>
            </div>
          </div>
          <div class="footer">
            <p>This is an automated notification sent to <strong>${to}</strong> based on your pocketJob profile preset email settings.</p>
            <p>&copy; ${new Date().getFullYear()} pocketJob. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"${senderName}" <${senderEmail}>`,
      to,
      subject: `[pocketJob] ${activityTitle}`,
      text: `${activityTitle}\n\n${activityMessage}\n\nPreset Profile Note: ${presetTemplateText}\n\nView details: ${actionUrl}`,
      html: htmlContent,
    };

    const info = await transport.sendMail(mailOptions);
    console.log(`✉️ Preset Email successfully sent to ${to} (MessageId: ${info.messageId || "ok"})`);
    return info;
  } catch (error) {
    console.error("❌ Error sending preset email:", error.message);
  }
};
