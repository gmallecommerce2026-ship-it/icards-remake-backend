import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { type Transporter } from 'nodemailer';
import { escapeHtml } from '../common/utils/escape-html.js';

export interface InvitationMailInput {
  to: string;
  guestName: string;
  /** Lời xưng hô đầy đủ, ví dụ "Thân gửi An" (mặc định: "Thân gửi {guestName}") */
  salutation?: string;
  title: string;
  /** Chủ đề email tuỳ chỉnh; nếu trống dùng "Thiệp mời: {title}" */
  subject?: string;
  hostName?: string;
  eventDate?: string;
  venue?: string;
  link: string;
  message?: string;
}

const BRAND = '#A3152F';
const INK = '#2b2b2e';
const MUTED = '#6b6b70';

@Injectable()
export class MailService {
  private readonly log = new Logger(MailService.name);
  private readonly transporter: Transporter;
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

  /** Gửi cả bản HTML và bản văn bản thuần (multipart/alternative) — thiếu bản text là dấu hiệu spam rõ nhất. */
  private async send(to: string, subject: string, html: string, text: string): Promise<void> {
    const info = await this.transporter.sendMail({ from: this.from, to, subject, html, text });
    if (this.dryRun) this.log.log(`[DRY-RUN] -> ${to} | ${subject}\n${String((info as { message?: string }).message ?? '').slice(0, 600)}`);
  }

  /** Khung email dạng bảng (tương thích Gmail/Outlook), không ảnh, không font ngoài, không emoji. */
  private shell(preheader: string, inner: string): string {
    return `<!DOCTYPE html>
<html lang="vi">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f1ea;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f1ea;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;background:#ffffff;border:1px solid #e7e0d2;border-radius:12px;">
<tr><td style="height:4px;background:${BRAND};border-radius:12px 12px 0 0;font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td style="padding:40px 36px 32px;font-family:Georgia,'Times New Roman',serif;color:${INK};font-size:16px;line-height:1.7;">
${inner}
</td></tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:${MUTED};margin:20px 0 0;text-align:center;">
Bạn nhận được email này vì được mời tham dự một sự kiện trên iCards.
</p>
</td></tr>
</table>
</body>
</html>`;
  }

  private button(href: string, label: string): string {
    return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:28px auto;">
<tr><td align="center" style="border-radius:999px;background:${BRAND};">
<a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:999px;">${escapeHtml(label)}</a>
</td></tr></table>`;
  }

  async sendInvitation(i: InvitationMailInput): Promise<void> {
    const salutation = i.salutation?.trim() || `Thân gửi ${i.guestName}`;
    const subject = i.subject?.trim() || `Thiệp mời: ${i.title}`;
    const when = i.eventDate ? escapeHtml(i.eventDate) : '';
    const where = i.venue ? escapeHtml(i.venue) : '';
    const body = i.message?.trim()
      ? escapeHtml(i.message).replace(/\n/g, '<br/>')
      : `${escapeHtml(i.hostName ?? 'Gia chủ')} trân trọng kính mời bạn đến dự.`;

    const details = [when && `<strong>Thời gian:</strong> ${when}`, where && `<strong>Địa điểm:</strong> ${where}`]
      .filter(Boolean)
      .join('<br/>');

    const html = this.shell(
      `${i.title} — mời bạn xác nhận tham dự`,
      `<p style="margin:0 0 16px;">${escapeHtml(salutation)},</p>
<h1 style="font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.3;margin:0 0 16px;color:${INK};">${escapeHtml(i.title)}</h1>
<p style="margin:0 0 16px;">${body}</p>
${details ? `<p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:${INK};">${details}</p>` : ''}
${this.button(i.link, 'Xem thiệp mời & xác nhận tham dự')}
<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:${MUTED};">
Nếu nút không hoạt động, bạn có thể sao chép liên kết sau vào trình duyệt:<br/>
<a href="${escapeHtml(i.link)}" style="color:${BRAND};word-break:break-all;">${escapeHtml(i.link)}</a>
</p>`,
    );

    const text = [
      `${salutation},`,
      '',
      i.title,
      '',
      i.message?.trim() || `${i.hostName ?? 'Gia chủ'} trân trọng kính mời bạn đến dự.`,
      '',
      i.eventDate ? `Thời gian: ${i.eventDate}` : '',
      i.venue ? `Địa điểm: ${i.venue}` : '',
      '',
      `Xem thiệp mời và xác nhận tham dự: ${i.link}`,
      '',
      'Bạn nhận được email này vì được mời tham dự một sự kiện trên iCards.',
    ]
      .filter((l, idx, arr) => !(l === '' && arr[idx - 1] === ''))
      .join('\n');

    await this.send(i.to, subject, html, text);
  }

  async sendResetPassword(to: string, name: string, link: string): Promise<void> {
    const html = this.shell(
      'Đặt lại mật khẩu iCards',
      `<p style="margin:0 0 16px;">Xin chào <strong>${escapeHtml(name)}</strong>,</p>
<p style="margin:0 0 8px;">Bạn vừa yêu cầu đặt lại mật khẩu. Liên kết có hiệu lực trong 30 phút.</p>
${this.button(link, 'Đặt lại mật khẩu')}
<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:${MUTED};">Nếu không phải bạn yêu cầu, hãy bỏ qua email này.</p>`,
    );
    const text = [
      `Xin chào ${name},`,
      '',
      'Bạn vừa yêu cầu đặt lại mật khẩu. Liên kết có hiệu lực trong 30 phút:',
      link,
      '',
      'Nếu không phải bạn yêu cầu, hãy bỏ qua email này.',
    ].join('\n');
    await this.send(to, 'Đặt lại mật khẩu iCards', html, text);
  }
}
