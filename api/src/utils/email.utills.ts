import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';
interface CustomMailOptions extends SendMailOptions {
  to: string;
  subject: string;
  text: string;
}

export const sendEmail = async (to: string, subject: string, text: string): Promise<void> => {
  const transporter: Transporter = nodemailer.createTransport({
    // host: 'sandbox.smtp.mailtrap.io'
    // port: 2525,
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  console.log('Email:', process.env.EMAIL_USER);
  console.log('Pass:', process.env.EMAIL_PASS);

  await transporter.verify();
  console.log('Server is ready to take our messages');
  console.log('transporter from utill', transporter);
  const mailOptions: CustomMailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };
  console.log('mailOptions from utills:', mailOptions);
  await transporter.sendMail(mailOptions);
  console.log('Password reset email sent to:', to);
};
