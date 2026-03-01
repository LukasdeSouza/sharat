import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const emailService = {
  /**
   * Send a workflow notification email
   * @param {Object} options 
   * @param {string} options.to 
   * @param {string} options.subject 
   * @param {string} options.html 
   */
  async sendEmail({ to, subject, html }) {
    try {
      const from = process.env.EMAIL_FROM || 'onboarding@resend.dev';

      const { data, error } = await resend.emails.send({
        from,
        to,
        subject,
        html,
      });

      if (error) {
        console.error('Resend error:', error);
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  },

  /**
 * Replace placeholders in template with actual data
 * @param {string} template 
 * @param {Object} data 
 */
  replacePlaceholders(template, data) {
    if (!template) return '';
    return template.replace(/\{\{(.+?)\}\}/g, (match, key) => {
      const k = key.trim();
      // Handle special data keys
      if (k === 'form_name') return data.formName || '';
      if (k === 'step_name') return data.stepName || '';
      if (k === 'submission_id') return data.submissionId || '';

      // Handle submission field data
      return data.submissionData?.[k] || match;
    });
  },

  /**
   * Send notification for a new workflow step
   */
  async sendWorkflowStepNotification(userEmail, stepName, formName, submissionId, submissionData = {}, customTemplate = null) {
    const subject = `Workflow Alert: ${stepName} - ${formName}`;

    let html = '';

    if (customTemplate) {
      // Use custom template if provided
      const content = this.replacePlaceholders(customTemplate, {
        formName,
        stepName,
        submissionId,
        submissionData
      });

      html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 12px; background-color: #ffffff;">
          <div style="background-color: #000000; color: #ffffff; padding: 15px; border-radius: 8px 8px 0 0; text-align: center;">
            <h2 style="margin: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 1px;">Form Builder</h2>
          </div>
          <div style="padding: 24px; color: #1a1a1a; line-height: 1.6;">
            ${content}
          </div>
          <div style="padding: 20px; border-top: 1px solid #e4e4e7; text-align: center; color: #71717a; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Form builder. All rights reserved.</p>
          </div>
        </div>
      `;
    } else {
      // Default template
      html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #1a1a1a; border-radius: 12px; background-color: #ffffff;">
          <div style="background-color: #000000; color: #ffffff; padding: 15px; border-radius: 8px 8px 0 0; text-align: center;">
            <h2 style="margin: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 1px;">Form Builder</h2>
          </div>
          <div style="padding: 24px; color: #1a1a1a;">
            <h3 style="margin-top: 0; color: #000000;">Notification for Action</h3>
            <p>Hello,</p>
            <p>A new submission for <strong>${formName}</strong> requires your attention in the step: <strong>${stepName}</strong>.</p>
            
            <div style="margin: 24px 0; padding: 16px; background-color: #f4f4f5; border-radius: 8px; border: 1px solid #e4e4e7;">
              <p style="margin: 0; font-size: 14px; color: #71717a;">Submission ID</p>
              <p style="margin: 4px 0 0 0; font-family: monospace; font-size: 14px; color: #1a1a1a;">${submissionId}</p>
            </div>

            <p>Please log in to the dashboard to review and take action.</p>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/submissions" 
               style="display: inline-block; background-color: #000000; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 20px;">
              Open Dashboard
            </a>
          </div>
          <div style="padding: 20px; border-top: 1px solid #e4e4e7; text-align: center; color: #71717a; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Form Builder Builder. All rights reserved.</p>
          </div>
        </div>
      `;
    }

    return this.sendEmail({ to: userEmail, subject, html });
  }
};
