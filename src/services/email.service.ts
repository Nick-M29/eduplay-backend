// Importamos la nueva función que creamos en mailer.ts
import { enviarCorreo } from '../config/mailer'; 

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    // Llamamos a la API de Google a través de nuestra función
    const success = await enviarCorreo(to, subject, html);
    
    if (!success) {
      throw new Error("La API de Gmail devolvió un error");
    }
    
    console.log(`Email enviado correctamente a: ${to}`);
  } catch (error) {
    console.error("Error en el servicio de email:", error);
    throw new Error("No se pudo enviar el correo a través de la API oficial");
  }
};