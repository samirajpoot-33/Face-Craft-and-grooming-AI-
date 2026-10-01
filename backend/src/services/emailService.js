import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create nodemailer transporter
// Support custom SMTP (like Brevo) or default service (like Gmail)
const transporter = nodemailer.createTransport(
    process.env.EMAIL_HOST 
        ? {
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT || '587'),
            secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for 587
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
          }
        : {
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
          }
);

/**
 * Send a verification OTP email
 * @param {string} toEmail 
 * @param {string} otpCode 
 */
export const sendVerificationOTP = async (toEmail, otpCode) => {
    try {
        // If credentials are not set, log and warn so server doesn't crash, but tell them to set them
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn('⚠️ Warning: EMAIL_USER or EMAIL_PASS environment variables are not set. Email not sent.');
            console.log(`[DEV OTP BYPASS] Verification code for ${toEmail} is: ${otpCode}`);
            return false;
        }

        const mailOptions = {
            from: `"FaceCraft AI" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: 'Verify your FaceCraft Account - OTP Verification Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #0284c7; margin: 0; font-size: 28px;">FaceCraft AI</h1>
                        <p style="color: #64748b; margin-top: 5px;">Your personal grooming and style AI companion</p>
                    </div>
                    
                    <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
                    
                    <div style="padding: 10px 0;">
                        <p style="font-size: 16px; color: #334155; line-height: 1.6;">Hello,</p>
                        <p style="font-size: 16px; color: #334155; line-height: 1.6;">Thank you for registering on FaceCraft! To complete your registration and activate your account, please use the following 6-digit One-Time Password (OTP):</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <span style="display: inline-block; font-size: 36px; font-weight: bold; letter-spacing: 6px; color: #0284c7; background-color: #f0f9ff; padding: 15px 30px; border-radius: 8px; border: 1px dashed #bae6fd;">
                                ${otpCode}
                            </span>
                        </div>
                        
                        <p style="font-size: 14px; color: #ef4444; font-weight: 500;">Please note: This code is valid for 15 minutes. Do not share this code with anyone.</p>
                    </div>
                    
                    <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
                    
                    <div style="font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.6;">
                        <p>If you did not request this email, please ignore it.</p>
                        <p>&copy; ${new Date().getFullYear()} FaceCraft AI. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`📧 Verification email sent to ${toEmail}. Message ID: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error('❌ Error sending verification email:', error);
        return false;
    }
};

/**
 * Send a password reset OTP email
 * @param {string} toEmail 
 * @param {string} otpCode 
 */
export const sendResetPasswordOTP = async (toEmail, otpCode) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn('⚠️ Warning: EMAIL_USER or EMAIL_PASS environment variables are not set. Email not sent.');
            console.log(`[DEV OTP BYPASS] Password Reset code for ${toEmail} is: ${otpCode}`);
            return false;
        }

        const mailOptions = {
            from: `"FaceCraft AI" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: 'Reset your FaceCraft Password - OTP Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #0284c7; margin: 0; font-size: 28px;">FaceCraft AI</h1>
                        <p style="color: #64748b; margin-top: 5px;">Your personal grooming and style AI companion</p>
                    </div>
                    
                    <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
                    
                    <div style="padding: 10px 0;">
                        <p style="font-size: 16px; color: #334155; line-height: 1.6;">Hello,</p>
                        <p style="font-size: 16px; color: #334155; line-height: 1.6;">We received a request to reset your password. Please use the following 6-digit One-Time Password (OTP) to proceed with the reset:</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <span style="display: inline-block; font-size: 36px; font-weight: bold; letter-spacing: 6px; color: #0284c7; background-color: #f0f9ff; padding: 15px 30px; border-radius: 8px; border: 1px dashed #bae6fd;">
                                ${otpCode}
                            </span>
                        </div>
                        
                        <p style="font-size: 14px; color: #ef4444; font-weight: 500;">Please note: This code is valid for 15 minutes. If you did not request this, you can safely ignore this email.</p>
                    </div>
                    
                    <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
                    
                    <div style="font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.6;">
                        <p>&copy; ${new Date().getFullYear()} FaceCraft AI. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`📧 Password reset email sent to ${toEmail}. Message ID: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error('❌ Error sending password reset email:', error);
        return false;
    }
};

