import { Request, Response } from 'express';
import { sendEmail } from '../services/email.service';

export const enviarMensajeContacto = async (req: Request, res: Response) => {
  const { nombre, email, mensaje } = req.body;

  try {
    // Te mandas el correo a ti mismo con los datos del interesado
    await sendEmail(
      "eduplay.contact@gmail.com", 
      `Nuevo mensaje de: ${nombre}`,
      `<p><strong>De:</strong> ${nombre} (${email})</p><p><strong>Mensaje:</strong> ${mensaje}</p>`
    );

    res.json({ message: '¡Mensaje enviado con éxito!' });
  } catch (error) {
    res.status(500).json({ message: 'Error al enviar el correo' });
  }
};