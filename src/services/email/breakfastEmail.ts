/**
 * Valura Breakfast Email Service
 * Handles email delivery via Zapier MCP Gmail integration
 */

import { generateValuraBreakfastEmail } from '../../components/email/ValuraBreakfastEmailTemplate';
import type { BreakfastEmailData } from '../../components/email/ValuraBreakfastEmailTemplate';

export type { BreakfastEmailData };

/**
 * Send Valura Breakfast digest via email
 * New version using enhanced template
 */
export async function sendBreakfastEmail(
  emailData: BreakfastEmailData,
  options: {
    to?: string;
    subject?: string;
  } = {}
): Promise<void> {
  const date = new Date(emailData.timestamp).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const vibeEmoji = emailData.marketVibe === 'Bullish' ? '📈' : emailData.marketVibe === 'Bearish' ? '📉' : '➡️';

  const defaultSubject = `☕ Valura Breakfast - ${date} ${vibeEmoji} Market ${emailData.marketVibe}`;
  const subject = options.subject || defaultSubject;

  // Get recipient email
  const to = options.to || 'investor@example.com';

  // Generate HTML body
  const body = generateValuraBreakfastEmail({
    ...emailData,
    recipientEmail: to,
  });

  try {
    // Note: In production, this would integrate with Zapier MCP Gmail via backend
    // For now, we'll simulate the email send and log the details
    
    // In a real implementation with Zapier MCP backend, you would call:
    // const response = await mcp_Zapier_MCP_gmail_send_email({
    //   instructions: `Send professional HTML email with Valura Breakfast market digest`,
    //   to,
    //   subject,
    //   body,
    // });

    console.log('📧 Valura Breakfast Email Ready to Send');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Body length:', body.length, 'chars');
    
    // For demonstration, we'll open the email in a new tab as HTML preview
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(body);
      previewWindow.document.close();
    }

    // Simulate async email send
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log('✓ Valura Breakfast email preview opened successfully');
  } catch (error) {
    console.error('Failed to send Valura Breakfast email:', error);
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Failed to send email. Please check your connection and try again.'
    );
  }
}

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Get email preview (for testing/debugging)
 */
export function getEmailPreview(emailData: BreakfastEmailData, recipientEmail?: string): string {
  return generateValuraBreakfastEmail({
    ...emailData,
    recipientEmail,
  });
}

