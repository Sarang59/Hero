/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { setGlobalOptions } = require('firebase-functions/v2');
const { onRequest } = require('firebase-functions/v2/https');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');
const Mailgun = require('mailgun.js');
const formData = require('form-data');
const axios = require('axios');
const os = require('os');
const path = require('path');
const fs = require('fs');

setGlobalOptions({ 
    maxInstances: 10,
    region: 'us-central1'
});

admin.initializeApp();

// Mailgun setup
const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;

let mg;
if (MAILGUN_API_KEY && MAILGUN_DOMAIN) {
    const mailgun = new Mailgun(formData);
    mg = mailgun.client({
        username: 'api',
        key: MAILGUN_API_KEY,
    });
} else {
    console.warn('Mailgun credentials not found in environment variables');
}

// Firestore trigger - Add timestamp when user registers
exports.addregisteredontime = onDocumentCreated(
    {
        document: "Users/{userId}",
        region: 'us-central1'
    },
    async (event) => {
        try {
            const snapshot = event.data;
            if (!snapshot) {
                console.log("No data associated with the event");
                return;
            }

            const userId = event.params.userId;
            const RegisteredOn = admin.firestore.FieldValue.serverTimestamp();

            await admin
                .firestore()
                .collection("Users")
                .doc(userId)
                .update({ RegisteredOn });

            console.log(`Successfully added RegisteredOn timestamp for user: ${userId}`);
        } catch (error) {
            console.error('Error in addregisteredontime:', error);
        }
    }
);

// HTTP function - Send OTP email
exports.sendotp = onRequest(
    { 
        cors: true,
        region: 'us-central1'
    },
    async (req, res) => {
        // Only allow POST requests
        if (req.method !== 'POST') {
            return res.status(405).json({ success: false, message: 'Method Not Allowed' });
        }

        const { email, name, otp } = req.body;

        // Validate input
        if (!email || !otp) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and OTP are required.' 
            });
        }

        // Check if Mailgun is configured
        if (!mg || !MAILGUN_DOMAIN) {
            console.error('Mailgun not configured');
            return res.status(500).json({ 
                success: false, 
                message: 'Email service not configured' 
            });
        }

        try {
            const messageData = {
                from: `Eat Smart Hub <noreply@${MAILGUN_DOMAIN}>`,
                to: email,
                subject: 'Your OTP Code',
                text: `Hello ${name || ''},\n\nYour OTP for password reset is: ${otp}\n\nIf you did not request this, please ignore this email.\n\nThank you\n\nRegards,\n\n\nSarang Chandwadkar\nOn behalf of Eat Smart Hub Technical Team`,
            };

            const response = await mg.messages.create(MAILGUN_DOMAIN, messageData);
            console.log('OTP email sent successfully:', response.id);
            
            return res.status(200).json({ 
                success: true, 
                id: response.id, 
                message: 'Email sent successfully!' 
            });
        } catch (error) {
            console.error('Error sending OTP email:', error);
            return res.status(500).json({ 
                success: false, 
                message: error.message || 'Failed to send email'
            });
        }
    }
);

// HTTP function - Send inappropriate comment email with attachment
exports.sendinappropriatecommentemail = onRequest(
    { 
        cors: true,
        region: 'us-central1',
        timeoutSeconds: 60
    },
    async (req, res) => {
        // Only allow POST requests
        if (req.method !== 'POST') {
            return res.status(405).json({ success: false, message: 'Method Not Allowed' });
        }

        const { email, name, comment, filePath } = req.body;

        // Validate input
        if (!email || !filePath) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and file path are required.' 
            });
        }

        // Check if Mailgun is configured
        if (!mg || !MAILGUN_DOMAIN) {
            console.error('Mailgun not configured');
            return res.status(500).json({ 
                success: false, 
                message: 'Email service not configured' 
            });
        }

        try {
            let attachmentData;
            let tempFilePath;

            // Download file from URL if it's an HTTP(S) link
            if (filePath.startsWith('http')) {
                console.log('Downloading file from URL:', filePath);

                const response = await axios.get(filePath, {
                    responseType: 'arraybuffer',
                    timeout: 30000,
                    maxContentLength: 10 * 1024 * 1024 // 10MB limit
                });

                tempFilePath = path.join(os.tmpdir(), 'Feedback_form_guidelines.pdf');
                fs.writeFileSync(tempFilePath, response.data);

                attachmentData = {
                    filename: 'Feedback_form_guidelines.pdf',
                    data: fs.createReadStream(tempFilePath)
                };

                console.log('File downloaded successfully to:', tempFilePath);
            } else {
                // Local file path (fallback)
                attachmentData = {
                    filename: path.basename(filePath),
                    data: fs.createReadStream(filePath)
                };
            }

            const messageData = {
                from: `Eat Smart Hub <noreply@${MAILGUN_DOMAIN}>`,
                to: email,
                subject: 'Comment Report',
                text: `Hello ${name || ''},\n\nPlease find the attached document to get more information on filling the feedback form.\n\nFollowing is the comment which is marked as inappropriate by admin\n\n${comment || ''}\n\nThank you\n\nRegards,\n\n\nSarang Chandwadkar\nOn behalf of Eat Smart Hub Technical Team`,
                attachment: attachmentData
            };

            const response = await mg.messages.create(MAILGUN_DOMAIN, messageData);
            console.log('Inappropriate comment email sent successfully:', response.id);

            // Clean up temp file
            if (tempFilePath && fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
                console.log('Temp file cleaned up');
            }

            return res.status(200).json({
                success: true,
                id: response.id,
                message: 'Email with attachment sent successfully!'
            });

        } catch (error) {
            console.error('Error sending inappropriate comment email:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to send email'
            });
        }
    }
);


