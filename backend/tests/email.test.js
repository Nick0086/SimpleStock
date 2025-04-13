import { emailService } from '../services/nodemailer/nodemailer.service.js';

async function testEmailConfig() {
  try {
    const transporter = emailService.getTransporter();
    await transporter.verify();
    console.log('Email configuration is valid');
  } catch (error) {
    console.error('Email configuration error:', error);
  }
}

testEmailConfig(); 