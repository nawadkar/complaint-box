// server.js - Simple Node.js backend for the grievance form

const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Email functionality
app.post('/submit-grievance', async (req, res) => {
  try {
    const { name, category, complaint, severity, resolution } = req.body;
    
    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail', // You can use other services like SendGrid, Mailgun, etc.
      auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS  // Your password or app-specific password
      }
    });
    
    // Define email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.RECIPIENT_EMAIL, // Where you want to receive the complaints
      subject: `New Grievance Submission from ${name}: ${category}`,
      html: `
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { padding: 20px; max-width: 600px; margin: 0 auto; }
          h1 { color: #ff69b4; }
          .category { font-weight: bold; color: #ff69b4; }
          .severity { margin: 15px 0; }
          .details { background: #ffecf5; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .resolution { background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 15px 0; }
        </style>
        <div class="container">
          <h1>New Grievance Submission</h1>
          <p><strong>From:</strong> ${name}</p>
          <p><strong>Category:</strong> <span class="category">${category}</span></p>
          <p class="severity"><strong>Severity Level:</strong> ${severity}/5</p>
          <div class="details">
            <h3>Complaint Details:</h3>
            <p>${complaint}</p>
          </div>
          <div class="resolution">
            <h3>Suggested Resolution:</h3>
            <p>${resolution || 'No resolution suggested'}</p>
          </div>
        </div>
      `
    };
    
    // Send email
    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ success: true, message: 'Grievance submitted successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, message: 'Failed to submit grievance, please try again.' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});