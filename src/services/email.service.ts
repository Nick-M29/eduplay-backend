import { transporter } from '../config/mailer';

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    await transporter.sendMail({
      from: '"EduPlay Team" <eduplay.contact@gmail.com>',
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Error enviando email:", error);
    throw new Error("No se pudo enviar el correo");
  }
};