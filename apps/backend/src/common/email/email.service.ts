import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get('SMTP_HOST', 'mailhog'),
      port: parseInt(this.config.get('SMTP_PORT', '1025')),
      ignoreTLS: true,
    });
  }

  async send(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.config.get('SMTP_FROM', 'noreply@vertix.com'),
        to,
        subject: `[Vertix] ${subject}`,
        html,
      });
      console.log(`[Email] Sent to ${to}: ${subject}`);
    } catch (error: any) {
      console.error(`[Email] Failed to send to ${to}:`, error.message);
    }
  }

  async sendPasswordReset(email: string, token: string): Promise<void> {
    const resetUrl = `${this.config.get('NEXT_PUBLIC_APP_URL', 'http://localhost:8080')}/auth/reset-password?token=${token}`;
    await this.send(email, 'Recuperacao de Senha', `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366F1;">Vertix - Recuperacao de Senha</h2>
        <p>Voce solicitou a recuperacao de senha. Clique no botao abaixo:</p>
        <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366F1, #8B5CF6); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 16px 0;">
          Redefinir Senha
        </a>
        <p style="color: #666; font-size: 14px;">Este link expira em 1 hora.</p>
        <p style="color: #999; font-size: 12px;">Se voce nao solicitou isso, ignore este email.</p>
      </div>
    `);
  }

  async sendWelcome(email: string, name: string, tenantName: string): Promise<void> {
    await this.send(email, 'Bem-vindo ao Vertix', `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366F1;">Bem-vindo ao Vertix!</h2>
        <p>Ola ${name},</p>
        <p>Sua conta no tenant <strong>${tenantName}</strong> foi criada com sucesso.</p>
        <a href="${this.config.get('NEXT_PUBLIC_APP_URL', 'http://localhost:8080')}/auth/login" style="display: inline-block; background: linear-gradient(135deg, #6366F1, #8B5CF6); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 16px 0;">
          Acessar Plataforma
        </a>
      </div>
    `);
  }

  async sendAppointmentReminder(email: string, patientName: string, doctorName: string, date: string): Promise<void> {
    await this.send(email, 'Lembrete de Consulta', `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366F1;">Lembrete de Consulta</h2>
        <p>Ola ${patientName},</p>
        <p>Voce tem uma consulta agendada:</p>
        <div style="background: #F4F4F5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Profissional:</strong> ${doctorName}</p>
          <p><strong>Data:</strong> ${date}</p>
        </div>
        <p style="color: #666; font-size: 14px;">Nao se esqueca de comparecer no horario marcado.</p>
      </div>
    `);
  }
}
