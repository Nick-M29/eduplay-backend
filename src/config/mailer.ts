import { google } from 'googleapis';

const OAuth2 = google.auth.OAuth2;

/**
 * Configuración de la API de Gmail con OAuth2.
 * Usamos las variables de entorno que configuraste en Google Cloud y OAuth Playground.
 */
const oauth2Client = new OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

/**
 * Función principal para enviar correos.
 * Reemplaza a Nodemailer y Resend usando la API oficial de Google.
 */
export const enviarCorreo = async (correoDestino: string, asunto: string, mensajeHTML: string) => {
  try {
    // Construcción del mensaje bajo el estándar MIME
    const str = [
      `From: EduPlay <${process.env.EMAIL_USER}>`,
      `To: ${correoDestino}`,
      // Codificamos el asunto en Base64 para que Gmail entienda los emojis
      `Subject: =?utf-8?B?${Buffer.from(asunto).toString('base64')}?=`,
      'Content-Type: text/html; charset=utf-8',
      '',
      mensajeHTML,
    ].join('\n');

    // La API de Gmail requiere que el cuerpo del correo esté en base64url
    const encodedMessage = Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    console.log(`¡Correo enviado con éxito a ${correoDestino}! ID:`, res.data.id);
    return true;
  } catch (error: any) {
    console.error('Error enviando correo por API de Gmail:', error.message);
    return false;
  }
};