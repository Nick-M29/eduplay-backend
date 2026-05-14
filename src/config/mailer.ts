import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

transporter.verify().then(() => {
  console.log('Nodemailer listo para enviar correos');
}).catch((error) => {
  console.error('Error configurando Nodemailer:', error);
});