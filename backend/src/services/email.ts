import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

// Configure Nodemailer SMTP Transporter
const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_EMAIL || 'atithi804@gmail.com';
  const pass = process.env.SMTP_PASSWORD || 'pgmmlohizdgbfask';

  if (host) {
    return nodemailer.createTransport({
      host,
      port: parseInt(port || '587'),
      secure: port === '465',
      auth: { user, pass }
    });
  }

  // Fallback to Gmail service
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });
};

const transporter = getTransporter();

// Verify SMTP connection on startup
export const verifySMTP = async () => {
  try {
    await transporter.verify();
    console.log('SMTP connection verified successfully');
  } catch (error) {
    console.error('SMTP connection verification failed. Email features might fail:', error);
  }
};

// Locate ATITHI logo path dynamically
const getLogoPath = (): string => {
  const paths = [
    path.resolve(__dirname, '../../../frontend/public/logo.png'),
    path.resolve(__dirname, '../../frontend/public/logo.png'),
    'c:\\Users\\DELL\\Desktop\\ATITHI\\frontend\\public\\logo.png'
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  return '';
};

// Generates attachments array with inline CID logo for Nodemailer
const getAttachments = () => {
  const logoPath = getLogoPath();
  if (logoPath) {
    try {
      const fileContent = fs.readFileSync(logoPath);
      return [{
        filename: 'logo.png',
        content: fileContent,
        cid: 'logo'
      }];
    } catch (e) {
      console.error('Failed to read logo for email attachment:', e);
    }
  }
  return [];
};

// Helper function to send emails via SMTP
const sendSMTPEmail = async (options: {
  to: string | string[];
  replyTo?: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{ filename: string; content: Buffer | string; cid: string }>;
}) => {
  const fromEmail = process.env.SENDER_EMAIL || `ATITHI Travels <${process.env.SMTP_EMAIL || 'atithi804@gmail.com'}>`;
  const recipients = Array.isArray(options.to) ? options.to.join(', ') : options.to;

  try {
    const info = await transporter.sendMail({
      from: fromEmail,
      to: recipients,
      replyTo: options.replyTo,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments
    });
    console.log('Email sent successfully via SMTP:', info.messageId);
    return info;
  } catch (error: any) {
    console.error('Failed to send email via SMTP:', {
      recipients,
      errorMessage: error.message
    });
  }
};

// Helper to get configured admin emails from environment variables
const getAdminEmails = (): string[] => {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim())
    .filter(e => e.length > 0);
};

// Shared Premium Branded Wrapper HTML Template
const getBrandedHTML = (title: string, message: string, cta?: { text: string, url: string }, extraHtml?: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #f4f5f7;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        .wrapper {
          width: 100%;
          background-color: #f4f5f7;
          padding: 40px 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #0b0f19; /* Dark Navy */
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          border: 1px solid #1e293b;
        }
        .header {
          padding: 30px;
          text-align: center;
          background-color: #0f172a;
          border-bottom: 2px solid #c6a052; /* Gold Accent */
        }
        .logo {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          border: 2px solid #c6a052;
        }
        .brand-name {
          color: #ffffff;
          font-size: 24px;
          font-weight: 700;
          margin-top: 10px;
          letter-spacing: 2px;
        }
        .brand-tagline {
          color: #c6a052;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 3px;
          margin-top: 5px;
        }
        .content {
          padding: 40px 30px;
          background-color: #0b0f19;
          color: #e2e8f0;
        }
        .title {
          color: #c6a052;
          font-size: 22px;
          font-family: Georgia, serif;
          margin-bottom: 20px;
          font-weight: 400;
          text-align: center;
        }
        .message {
          font-size: 15px;
          line-height: 1.6;
          margin-bottom: 30px;
          color: #cbd5e1;
          text-align: center;
        }
        .cta-container {
          margin: 30px 0;
          text-align: center;
        }
        .btn {
          background: linear-gradient(135deg, #c6a052 0%, #b38f43 100%);
          color: #0f172a !important;
          text-decoration: none;
          padding: 14px 35px;
          font-size: 14px;
          font-weight: 700;
          border-radius: 30px;
          display: inline-block;
          letter-spacing: 1px;
          box-shadow: 0 4px 15px rgba(198, 160, 82, 0.3);
        }
        .footer {
          padding: 30px;
          background-color: #070a10;
          text-align: center;
          border-top: 1px solid #1e293b;
        }
        .footer-text {
          color: #64748b;
          font-size: 12px;
          line-height: 1.5;
        }
        .footer-link {
          color: #c6a052;
          text-decoration: none;
        }
        @media only screen and (max-width: 600px) {
          .wrapper {
            padding: 10px 0;
          }
          .container {
            border-radius: 0;
            border: none;
          }
          .content {
            padding: 30px 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <img src="cid:logo" alt="ATITHI logo" class="logo">
            <div class="brand-name">ATITHI</div>
            <div class="brand-tagline">Atithi Devo Bhava</div>
          </div>
          <div class="content">
            <div class="title">${title}</div>
            <div class="message">${message}</div>
            ${cta ? `
            <div class="cta-container">
              <a href="${cta.url}" class="btn" target="_blank">${cta.text}</a>
            </div>
            ` : ''}
            ${extraHtml || ''}
          </div>
          <div class="footer">
            <div class="footer-text">
              Comfortable Journeys, Memorable Destinations<br>
              <strong>ATITHI Travels</strong> - Premium Tourism & Cab Booking<br>
              Need help? Contact: <a href="mailto:atithi804@gmail.com" class="footer-link">atithi804@gmail.com</a>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// 1. Verification Email
export const sendVerificationEmail = async (email: string, link: string) => {
  try {
    const title = 'Welcome to ATITHI';
    const message = 'Thank you for joining ATITHI. Please verify your email address to activate your account and start exploring premium travel experiences across India.';
    
    const mailOptions = {
      to: email,
      replyTo: 'atithi804@gmail.com',
      subject: 'Verify Your Email - ATITHI Travels',
      text: `Welcome to ATITHI!\n\nThank you for joining ATITHI. Please verify your email address to activate your account and start exploring premium travel experiences across India.\n\nVerify Email Link: ${link}\n\nNeed help? Contact: atithi804@gmail.com`,
      html: getBrandedHTML(title, message, { text: 'Verify Email', url: link }),
      attachments: getAttachments()
    };

    await sendSMTPEmail(mailOptions);
  } catch (error) {
    console.error('Error in sendVerificationEmail:', error);
  }
};

// 2. Password Reset Email
export const sendPasswordResetEmail = async (email: string, link: string) => {
  try {
    const title = 'Reset Your Password';
    const message = "You requested a password reset for your ATITHI account. Please click the button below to set a new password. If you didn't make this request, you can safely ignore this email.";

    const mailOptions = {
      to: email,
      replyTo: 'atithi804@gmail.com',
      subject: 'Reset Your Password - ATITHI Travels',
      text: `ATITHI Travels Password Reset\n\nYou requested a password reset for your ATITHI account. Please use the link below to set a new password:\n\n${link}\n\nIf you did not request this, please ignore this message.\n\nContact: atithi804@gmail.com`,
      html: getBrandedHTML(title, message, { text: 'Reset Password', url: link }),
      attachments: getAttachments()
    };

    await sendSMTPEmail(mailOptions);
  } catch (error) {
    console.error('Error in sendPasswordResetEmail:', error);
  }
};

// 3. Welcome Email after successful verification
export const sendWelcomeEmail = async (email: string, name: string) => {
  try {
    const title = 'Welcome to ATITHI';
    const message = `Dear ${name || 'Valued Guest'},\n\nThank you for verifying your email. Your ATITHI account is now fully active! You can now explore destinations across India, create cab bookings, access all profile features, and write testimonials.`;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const mailOptions = {
      to: email,
      replyTo: 'atithi804@gmail.com',
      subject: 'Welcome to ATITHI - Account Activated',
      text: `Welcome to ATITHI!\n\nDear ${name || 'Valued Guest'},\n\nYour email has been verified. Your ATITHI account is active and you have unlocked full platform access.\n\nStart exploring now: ${frontendUrl}\n\nContact: atithi804@gmail.com`,
      html: getBrandedHTML(title, message, { text: 'Start Exploring', url: frontendUrl }),
      attachments: getAttachments()
    };

    await sendSMTPEmail(mailOptions);
  } catch (error) {
    console.error('Error in sendWelcomeEmail:', error);
  }
};

// 4. Contact Form Acknowledgement
export const sendContactAcknowledgementEmail = async (name: string, email: string, userMessage: string) => {
  try {
    const title = 'Message Received';
    const message = `Hello ${name},\n\nThank you for reaching out to ATITHI. We have received your inquiry and our support team will review it and get back to you shortly.`;
    
    const extraHtml = `
      <div style="background-color: #0f172a; border-radius: 8px; border: 1px solid #1e293b; padding: 20px; text-align: left; margin-top: 25px;">
        <h4 style="color: #c6a052; margin-top: 0; margin-bottom: 10px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #1e293b; padding-bottom: 6px;">Your Submitted Inquiry</h4>
        <p style="color: #cbd5e1; font-size: 13px; line-height: 1.6; margin: 0; white-space: pre-line;">${userMessage}</p>
      </div>
    `;

    const mailOptions = {
      to: email,
      replyTo: 'atithi804@gmail.com',
      subject: 'We Received Your Inquiry',
      text: `Hello ${name},\n\nThank you for reaching out to ATITHI. We have received your message and our team will get back to you shortly.\n\nSubmitted Message:\n"${userMessage}"\n\nContact: atithi804@gmail.com`,
      html: getBrandedHTML(title, message, undefined, extraHtml),
      attachments: getAttachments()
    };

    await sendSMTPEmail(mailOptions);
  } catch (error) {
    console.error('Error in sendContactAcknowledgementEmail:', error);
  }
};

// 5. Booking Confirmation Email & Admin Notification
export const sendBookingNotification = async (bookingData: any, destName: string) => {
  const travelDateFormatted = new Date(bookingData.travelDate).toLocaleDateString();

  // Branded Customer Confirmation Email
  try {
    const customerTitle = 'Welcome to ATITHI';
    const customerMessage = `Dear ${bookingData.fullName},\n\nThank you for choosing ATITHI. We have received your booking request. Our team will contact you shortly to finalize details.`;
    
    const customerExtraHtml = `
      <div style="background-color: #0f172a; border-radius: 8px; border: 1px solid #1e293b; padding: 20px; text-align: left; margin-top: 25px;">
        <h4 style="color: #c6a052; margin-top: 0; margin-bottom: 15px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">Booking Summary</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #cbd5e1;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 40%;">Booking Reference:</td>
            <td style="padding: 6px 0; font-weight: bold; color: #ffffff;">${bookingData.bookingReference}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Destination:</td>
            <td style="padding: 6px 0; font-weight: bold; color: #c6a052;">${destName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Travel Date:</td>
            <td style="padding: 6px 0; font-weight: bold; color: #ffffff;">${travelDateFormatted}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Vehicle Type:</td>
            <td style="padding: 6px 0; font-weight: bold; color: #ffffff;">${bookingData.vehicleType}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Passengers:</td>
            <td style="padding: 6px 0; font-weight: bold; color: #ffffff;">${bookingData.passengers}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Booking Status:</td>
            <td style="padding: 6px 0;"><span style="color: #ffffff; background-color: #b7791f; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase;">${bookingData.status}</span></td>
          </tr>
        </table>
      </div>
    `;

    const customerMailOptions = {
      to: bookingData.email,
      replyTo: 'atithi804@gmail.com',
      subject: 'Booking Request Received - ATITHI',
      text: `Dear ${bookingData.fullName},\n\nThank you for choosing ATITHI. We have received your booking request.\n\nBooking Summary:\nReference: ${bookingData.bookingReference}\nDestination: ${destName}\nDate: ${travelDateFormatted}\nVehicle: ${bookingData.vehicleType}\nPassengers: ${bookingData.passengers}\nStatus: ${bookingData.status}\n\nOur team will contact you shortly.\n\nContact: atithi804@gmail.com`,
      html: getBrandedHTML(customerTitle, customerMessage, undefined, customerExtraHtml),
      attachments: getAttachments()
    };

    await sendSMTPEmail(customerMailOptions);
  } catch (error) {
    console.error(`Failed to send booking confirmation email to ${bookingData.email}:`, error);
  }

  // Branded Admin Notification Email
  try {
    const adminEmails = getAdminEmails();
    if (adminEmails.length > 0) {
      const adminTitle = 'New Booking Received';
      const adminMessage = `A new cab service booking has been created on the ATITHI platform. Reference ID: ${bookingData.bookingReference}.`;
      const adminDashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/bookings`;

      const adminExtraHtml = `
        <div style="background-color: #0f172a; border-radius: 8px; border: 1px solid #1e293b; padding: 20px; text-align: left; margin-top: 25px;">
          <h4 style="color: #c6a052; margin-top: 0; margin-bottom: 15px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">Customer & Trip Details</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #cbd5e1;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; width: 40%;">Reference ID:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #ffffff;">${bookingData.bookingReference}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Customer Name:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #ffffff;">${bookingData.fullName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Email Address:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #ffffff;">${bookingData.email}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Phone Number:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #ffffff;">${bookingData.phone}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Destination:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #c6a052;">${destName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Travel Date:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #ffffff;">${travelDateFormatted}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Passengers:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #ffffff;">${bookingData.passengers}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Vehicle:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #ffffff;">${bookingData.vehicleType}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Special Request:</td>
              <td style="padding: 6px 0; color: #cbd5e1; font-style: italic;">${bookingData.specialRequest || 'None'}</td>
            </tr>
          </table>
        </div>
      `;

      const adminMailOptions = {
        to: adminEmails,
        subject: 'New Booking Request Received',
        text: `New Booking Alert\n\nReference: ${bookingData.bookingReference}\nCustomer: ${bookingData.fullName}\nDestination: ${destName}\nDate: ${travelDateFormatted}\nPassengers: ${bookingData.passengers}\nVehicle: ${bookingData.vehicleType}\nSpecial Request: ${bookingData.specialRequest || 'None'}`,
        html: getBrandedHTML(adminTitle, adminMessage, { text: 'Manage Booking', url: adminDashboardUrl }, adminExtraHtml),
        attachments: getAttachments()
      };

      await sendSMTPEmail(adminMailOptions);
    } else {
      console.warn('No administrator email addresses configured in ADMIN_EMAILS. Admin notification email skipped.');
    }
  } catch (error) {
    console.error('Failed to send booking notification email to Admin:', error);
  }
};

// 6. Booking Status Update Email
export const sendStatusUpdateNotification = async (bookingData: any, destName: string) => {
  try {
    const travelDateFormatted = new Date(bookingData.travelDate).toLocaleDateString();
    let statusColor = '#b7791f'; // Gold/Bronze
    let statusLabel = bookingData.status.toUpperCase();
    let messageText = '';
    let showReviewCTA = false;
    let subject = `Cab Booking Status Updated - ${bookingData.bookingReference}`;

    if (bookingData.status === 'Approved') {
      subject = 'Your Booking Has Been Approved';
      statusColor = '#10b981'; // Green
      messageText = 'Your booking has been approved.';
    } else if (bookingData.status === 'Rejected') {
      subject = 'Booking Request Rejected';
      statusColor = '#ef4444'; // Red
      messageText = 'Your booking has been rejected.';
    } else if (bookingData.status === 'Completed') {
      subject = 'Your Trip Has Been Marked Completed';
      statusColor = '#3b82f6'; // Blue
      messageText = 'Your trip has been marked as completed.';
      showReviewCTA = true;
    } else {
      messageText = `Your cab booking status has been updated to: ${bookingData.status}.`;
    }

    const title = `Trip Booking Status: ${bookingData.status}`;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const cta = showReviewCTA ? { text: 'Share Your Review', url: `${frontendUrl}/contact` } : undefined;

    const extraHtml = `
      <div style="background-color: #0f172a; border-radius: 8px; border: 1px solid #1e293b; padding: 20px; text-align: left; margin-top: 25px;">
        <h4 style="color: #c6a052; margin-top: 0; margin-bottom: 15px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">Trip Details</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #cbd5e1;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 40%;">Booking Reference:</td>
            <td style="padding: 6px 0; font-weight: bold; color: #ffffff;">${bookingData.bookingReference}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Destination:</td>
            <td style="padding: 6px 0; font-weight: bold; color: #c6a052;">${destName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Travel Date:</td>
            <td style="padding: 6px 0; font-weight: bold; color: #ffffff;">${travelDateFormatted}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Current Status:</td>
            <td style="padding: 6px 0;"><span style="color: #ffffff; background-color: ${statusColor}; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase;">${statusLabel}</span></td>
          </tr>
        </table>
      </div>
    `;

    const mailOptions = {
      to: bookingData.email,
      replyTo: 'atithi804@gmail.com',
      subject: subject,
      text: `Trip Status Update: ${bookingData.status}\n\nDear Traveler,\n\n${messageText}\n\nTrip Reference: ${bookingData.bookingReference}\nDestination: ${destName}\nDate: ${travelDateFormatted}\n\nContact: atithi804@gmail.com`,
      html: getBrandedHTML(title, messageText, cta, extraHtml),
      attachments: getAttachments()
    };

    await sendSMTPEmail(mailOptions);
  } catch (error) {
    console.error(`Failed to send status update email to ${bookingData.email}:`, error);
  }
};
