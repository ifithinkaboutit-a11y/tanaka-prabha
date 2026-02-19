import nodemailer from 'nodemailer';

/**
 * Email Service using Nodemailer
 * Configured for Ethereal Mail in development
 * 
 * Ethereal Mail is a fake SMTP service for testing - emails are captured
 * and can be viewed at https://ethereal.email
 */

// Timeouts (ms) — make these configurable via environment variables
const EMAIL_CONN_TIMEOUT = parseInt(process.env.EMAIL_CONN_TIMEOUT || '5000');
const EMAIL_SEND_TIMEOUT = parseInt(process.env.EMAIL_SEND_TIMEOUT || '5000');

let transporter = null;
let etherealAccount = null;

/**
 * Initialize the email transporter
 * Uses Ethereal Mail for development/testing
 */
const initializeTransporter = async () => {
    if (transporter) return transporter;

    // Check if we have email credentials in environment
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const emailHost = process.env.EMAIL_HOST;
    const emailPort = process.env.EMAIL_PORT;

    if (emailUser && emailPass && emailHost) {
        // Use configured SMTP settings
        transporter = nodemailer.createTransport({
            host: emailHost,
            port: parseInt(emailPort || '587'),
            secure: emailPort === '465', // true for 465, false for other ports
            auth: {
                user: emailUser,
                pass: emailPass,
            },
            // Short connection timeouts so SMTP issues don't block requests
            connectionTimeout: EMAIL_CONN_TIMEOUT,
            greetingTimeout: EMAIL_CONN_TIMEOUT,
            socketTimeout: EMAIL_CONN_TIMEOUT,
        });
        console.log(`📧 Email service initialized with configured SMTP (${emailHost}, user: ${emailUser})`);
    } else {
        // Create Ethereal test account for development
        try {
            etherealAccount = await nodemailer.createTestAccount();
            
            transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: etherealAccount.user,
                    pass: etherealAccount.pass,
                },
                // Short timeouts for development SMTP as well
                connectionTimeout: EMAIL_CONN_TIMEOUT,
                greetingTimeout: EMAIL_CONN_TIMEOUT,
                socketTimeout: EMAIL_CONN_TIMEOUT,
            });

            console.log('📧 Ethereal Mail test account created:');
            console.log(`   User: ${etherealAccount.user}`);
            console.log(`   Pass: ${etherealAccount.pass}`);
            console.log('   View emails at: https://ethereal.email');
        } catch (error) {
            console.error('Failed to create Ethereal account:', error);
            throw error;
        }
    }

    return transporter;
};

/**
 * Send OTP via Email
 * @param {string} email - Recipient email address (or phone for demo)
 * @param {string} otp - The OTP to send
 * @returns {Promise<Object>} - Send result with preview URL for Ethereal
 */
const sendOTPEmail = async (mobileNumber, otp) => {
    try {
        const transport = await initializeTransporter();
        
        // For demo purposes, we'll use a mock email based on mobile number
        // In production, you'd get the user's actual email
        const recipientEmail = process.env.OTP_TEST_EMAIL || `${mobileNumber}@demo.tanakprabha.in`;
        const senderEmail = process.env.EMAIL_FROM || 'noreply@tanakprabha.in';

        const mailOptions = {
            from: `"Tanak Prabha" <${senderEmail}>`,
            to: recipientEmail,
            subject: 'Your OTP for Tanak Prabha Login',
            text: `Your OTP is: ${otp}\n\nThis OTP is valid for 10 minutes.\n\nIf you did not request this OTP, please ignore this email.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #386641; margin: 0;">🌾 Tanak Prabha</h1>
                        <p style="color: #666; margin-top: 5px;">Government Farmer Management System</p>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #386641 0%, #6A8F74 100%); color: white; padding: 30px; border-radius: 12px; text-align: center;">
                        <p style="margin: 0 0 10px 0; font-size: 16px;">Your One-Time Password</p>
                        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; background: rgba(255,255,255,0.2); padding: 15px 20px; border-radius: 8px; display: inline-block;">
                            ${otp}
                        </div>
                    </div>
                    
                    <div style="margin-top: 25px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                        <p style="margin: 0; color: #666; font-size: 14px;">
                            <strong>📱 Mobile:</strong> ${mobileNumber}<br>
                            <strong>⏱️ Valid for:</strong> 10 minutes<br>
                            <strong>🔒 Security tip:</strong> Never share this OTP with anyone
                        </p>
                    </div>
                    
                    <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
                        If you did not request this OTP, please ignore this email.<br>
                        © ${new Date().getFullYear()} Tanak Prabha - Ministry of Agriculture
                    </p>
                </div>
            `,
        };

        // Send with a short per-send timeout so a single send cannot hang the request
        const sendPromise = transport.sendMail(mailOptions);
        const info = await Promise.race([
            sendPromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Email send timeout')), EMAIL_SEND_TIMEOUT))
        ]);

        // Get Ethereal preview URL if using test account
        const previewUrl = nodemailer.getTestMessageUrl(info);
        
        console.log(`📧 OTP Email sent to ${recipientEmail}`);
        console.log(`   Message ID: ${info.messageId}`);
        if (previewUrl) {
            console.log(`   🔗 Preview URL: ${previewUrl}`);
        }

        return {
            success: true,
            messageId: info.messageId,
            previewUrl: previewUrl || null,
            recipient: recipientEmail,
        };
    } catch (error) {
        console.error('📧 Email send error:', error);
        throw error;
    }
};

/**
 * Get Ethereal account credentials (for display in console)
 */
const getEtherealCredentials = () => {
    if (etherealAccount) {
        return {
            user: etherealAccount.user,
            pass: etherealAccount.pass,
            webUrl: 'https://ethereal.email',
        };
    }
    return null;
};

/**
 * Verify transporter connection
 */
const verifyConnection = async () => {
    try {
        const transport = await initializeTransporter();
        await transport.verify();
        console.log('📧 Email server connection verified');
        return true;
    } catch (error) {
        console.error('📧 Email server connection failed:', error);
        return false;
    }
};

export {
    initializeTransporter,
    sendOTPEmail,
    getEtherealCredentials,
    verifyConnection,
};
