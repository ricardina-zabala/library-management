import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type { EmailService } from 'app-domain';

export class EtherealEmailService implements EmailService {
  private transporter: Transporter | null = null;
  private initialized = false;

  private async initializeTransporter(): Promise<void> {
    if (this.initialized) return;

    try {
      const emailHost = process.env.EMAIL_HOST || 'smtp.ethereal.email';
      const emailPort = parseInt(process.env.EMAIL_PORT || '587');
      const emailUser = process.env.EMAIL_USER;
      const emailPass = process.env.EMAIL_PASS;

      if (!emailUser || !emailPass) {
        throw new Error('EMAIL_USER and EMAIL_PASS environment variables are required');
      }
      
      this.transporter = nodemailer.createTransport({
        host: emailHost,
        port: emailPort,
        secure: false,
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });

      this.initialized = true;
      console.log('Ethereal email service initialized:');
      console.log('Host:', emailHost);
      console.log('Port:', emailPort);
      console.log('User:', emailUser);
      console.log('Preview URL: https://ethereal.email/messages');
    } catch (error) {
      console.error('Failed to initialize email service:', error);
      throw error;
    }
  }

  async sendLoanRequestEmail(
    userEmail: string, 
    userName: string, 
    bookTitle: string, 
    bookAuthor: string,
    confirmationToken: string
  ): Promise<boolean> {
    try {
      await this.initializeTransporter();
      
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const confirmationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/librarian/loan-request/${confirmationToken}`;

      const mailOptions = {
        from: '"Sistema de Biblioteca" <biblioteca@example.com>',
        to: 'bibliotecario@example.com',
        cc: userEmail,
        subject: `Nueva Solicitud de Préstamo: ${bookTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Nueva Solicitud de Préstamo</h2>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1e40af; margin-top: 0;">Información del Libro</h3>
              <p><strong>Título:</strong> ${bookTitle}</p>
              <p><strong>Autor:</strong> ${bookAuthor}</p>
            </div>
            
            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1e40af; margin-top: 0;">Información del Usuario</h3>
              <p><strong>Nombre:</strong> ${userName}</p>
              <p><strong>Email:</strong> ${userEmail}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmationUrl}" style="display: inline-block; background-color: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                🔍 Revisar Solicitud
              </a>
            </div>
            
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e;">
                <strong>Acción requerida:</strong> Haga clic en el botón "Revisar Solicitud" para acceder a la página de gestión donde podrá aprobar o rechazar esta solicitud.
              </p>
            </div>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Si no puede hacer clic en el botón, copie y pegue este enlace en su navegador:<br>
                <a href="${confirmationUrl}" style="color: #2563eb; word-break: break-all;">${confirmationUrl}</a>
              </p>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            
            <p style="color: #6b7280; font-size: 12px; text-align: center;">
              Este email fue enviado automáticamente por el Sistema de Gestión de Biblioteca.<br>
              Fecha: ${new Date().toLocaleString('es-ES')}
            </p>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log('Email sent successfully:');
      console.log('Message ID:', info.messageId);
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      
      return true;
    } catch (error) {
      console.error('Failed to send loan request email:', error);
      return false;
    }
  }

  async sendLoanApprovalEmail(
    userEmail: string, 
    userName: string, 
    bookTitle: string
  ): Promise<boolean> {
    try {
      await this.initializeTransporter();
      
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const mailOptions = {
        from: '"Sistema de Biblioteca" <biblioteca@example.com>',
        to: userEmail,
        subject: `Préstamo Aprobado: ${bookTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">¡Préstamo Aprobado!</h2>
            
            <p>Estimado/a ${userName},</p>
            
            <div style="background-color: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #065f46;">
                <strong>¡Buenas noticias!</strong> Su solicitud de préstamo para el libro "${bookTitle}" ha sido aprobada.
              </p>
            </div>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">Próximos pasos:</h3>
              <ul style="color: #4b5563;">
                <li>Puede recoger el libro en la biblioteca durante el horario de atención</li>
                <li>El período de préstamo es de 14 días</li>
                <li>Puede renovar el préstamo hasta 3 veces si no hay reservas</li>
              </ul>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            
            <p style="color: #6b7280; font-size: 12px; text-align: center;">
              Sistema de Gestión de Biblioteca<br>
              Fecha: ${new Date().toLocaleString('es-ES')}
            </p>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log('Approval email sent successfully:');
      console.log('Message ID:', info.messageId);
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      
      return true;
    } catch (error) {
      console.error('Failed to send loan approval email:', error);
      return false;
    }
  }

  async sendLoanRejectionEmail(
    userEmail: string, 
    userName: string, 
    bookTitle: string,
    reason?: string
  ): Promise<boolean> {
    try {
      await this.initializeTransporter();
      
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const mailOptions = {
        from: '"Sistema de Biblioteca" <biblioteca@example.com>',
        to: userEmail,
        subject: `Solicitud de Préstamo Rechazada: ${bookTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Solicitud de Préstamo Rechazada</h2>
            
            <p>Estimado/a ${userName},</p>
            
            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <p style="margin: 0; color: #b91c1c;">
                Lamentamos informarle que su solicitud de préstamo para el libro "${bookTitle}" ha sido rechazada.
              </p>
            </div>
            
            ${reason ? `
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">Motivo del rechazo:</h3>
              <p style="color: #4b5563; margin: 0;">${reason}</p>
            </div>
            ` : ''}
            
            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">¿Qué puede hacer ahora?</h3>
              <ul style="color: #4b5563;">
                <li>Puede intentar solicitar otros libros disponibles en nuestro catálogo</li>
                <li>Contacte con la biblioteca para más información</li>
                <li>Revise nuevamente en el futuro cuando el libro esté disponible</li>
              </ul>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            
            <p style="color: #6b7280; font-size: 12px; text-align: center;">
              Sistema de Gestión de Biblioteca<br>
              Fecha: ${new Date().toLocaleString('es-ES')}
            </p>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log('Rejection email sent successfully:');
      console.log('Message ID:', info.messageId);
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      
      return true;
    } catch (error) {
      console.error('Failed to send loan rejection email:', error);
      return false;
    }
  }
}