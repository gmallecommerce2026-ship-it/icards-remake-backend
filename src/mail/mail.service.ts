import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import { escapeHtml } from '../common/utils/escape-html.js';

export interface InvitationMailInput {
  to: string;
  guestName: string;
  title: string;
  hostName?: string;
  eventDate?: string;
  venue?: string;
  link: string;
  message?: string;
}

@Injectable()
export class MailService {
  private readonly log = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly from: string;
  private readonly dryRun: boolean;

  constructor(cfg: ConfigService) {
    const user = cfg.get<string>('EMAIL_USER');
    const pass = cfg.get<string>('EMAIL_PASS');
    this.from = `"iCards" <${user ?? 'no-reply@icards.local'}>`;
    // Chưa cấu hình SMTP: không gửi thật, chỉ log link (để dev vẫn chạy hết luồng).
    this.dryRun = !user || !pass;
    this.transporter = this.dryRun
      ? nodemailer.createTransport({ jsonTransport: true })
      : nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });
    if (this.dryRun) this.log.warn('EMAIL_USER/EMAIL_PASS trống -> chế độ DRY-RUN, email chỉ được log ra console.');
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    const info = await this.transporter.sendMail({ from: this.from, to, subject, html });
    if (this.dryRun) this.log.log(`[DRY-RUN] -> ${to} | ${subject}\n${String((info as { message?: string }).message ?? '').slice(0, 600)}`);
  }

  private layout(inner: string): string {
    return `<div style="background:#f6f3ec;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#2b2b2e">
<div style="max-width:560px;margin:auto;background:#fff;border-radius:16px;padding:32px;border-top:6px solid #a3152f">${inner}
<p style="margin-top:32px;font-size:12px;color:#8a8a8f">Email được gửi từ iCards.</p></div></div>`;
  }

  private button(href: string, label: string): string {
    return `<p style="text-align:center;margin:28px 0"><a href="${escapeHtml(href)}" style="background:#a3152f;color:#fff;text-decoration:none;padding:14px 28px;border-radius:999px;font-weight:bold;display:inline-block">${escapeHtml(label)}</a></p>`;
  }

  async sendInvitation(i: InvitationMailInput): Promise<void> {
    const rows = [i.eventDate && `🗓 ${escapeHtml(i.eventDate)}`, i.venue && `📍 ${escapeHtml(i.venue)}`].filter(Boolean).join('<br/>');
    const html = this.layout(`
<p>Thân gửi <b>${escapeHtml(i.guestName)}</b>,</p>
<h2 style="font-family:Georgia,serif;margin:8px 0">${escapeHtml(i.title)}</h2>
${i.message ? `<p>${escapeHtml(i.message).replace(/\n/g, '<br/>')}</p>` : `<p>${escapeHtml(i.hostName ?? 'Gia chủ')} trân trọng kính mời bạn đến dự.</p>`}
${rows ? `<p style="line-height:1.8">${rows}</p>` : ''}
${this.button(i.link, 'Xem thiệp mời & xác nhận tham dự')}
<p style="font-size:12px;color:#8a8a8f">Nếu nút không hoạt động, hãy mở liên kết: ${escapeHtml(i.link)}</p>`);
    await this.send(i.to, `Thiệp mời: ${i.title}`, html);
  }

  async sendResetPassword(to: string, name: string, link: string): Promise<void> {
    const html = this.layout(`<p>Xin chào <b>${escapeHtml(name)}</b>,</p>
<p>Bạn vừa yêu cầu đặt lại mật khẩu. Liên kết có hiệu lực trong 30 phút.</p>${this.button(link, 'Đặt lại mật khẩu')}
<p style="font-size:12px;color:#8a8a8f">Nếu không phải bạn, hãy bỏ qua email này.</p>`);
    await this.send(to, 'Đặt lại mật khẩu iCards', html);
  }
}
