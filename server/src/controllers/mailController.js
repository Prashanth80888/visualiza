import nodemailer from 'nodemailer';

export const sendAutomatedEmail = async (req, res) => {
  const { recipient, subject, body } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail
        pass: process.env.EMAIL_PASS, // Your App Password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipient,
      subject: subject,
      text: body,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "Email dispatched successfully via Neural Link." });
  } catch (error) {
    console.error("Mail Error:", error);
    res.status(500).json({ success: false, message: "Mail dispatch failed." });
  }
};