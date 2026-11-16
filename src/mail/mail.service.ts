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

  /** Email mời khách: tiêu đề thương hiệu, lời nhắn, khối thời gian/địa điểm, nút xem thiệp và link dự phòng. */
  async sendInvitation(i: InvitationMailInput): Promise<void> {
    const salutation = i.salutation?.trim() || `Thân gửi ${i.guestName}`;
    const subject = i.subject?.trim() || `Thiệp mời: ${i.title}`;
    const hostLabel = i.hostName?.trim() || 'Gia chủ';
    const message = i.message?.trim() || `${hostLabel} trân trọng kính mời bạn đến dự.`;
    const rows: [string, string][] = [];
    if (i.eventDate) rows.push(['Thời gian', i.eventDate]);
    if (i.venue) rows.push(['Địa điểm', i.venue]);

    const preheader = message.length > 90 ? `${message.slice(0, 87)}...` : message;
    const rowsHtml = rows
      .map(
        ([label, value]) => `<tr>
<td valign="top" style="padding:8px 0;width:110px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${MUTED};">${label}</td>
<td valign="top" style="padding:8px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:${INK};">${escapeHtml(value)}</td>
</tr>`,
      )
      .join('');

    const html = `<!DOCTYPE html>
<html lang="vi">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting"></head>
<body style="margin:0;padding:0;background:#f4f1ea;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f1ea;">
<tr><td align="center" style="padding:32px 12px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;background:#ffffff;border:1px solid #e7e0d2;border-radius:12px;">

<tr><td align="center" style="background:${BRAND};border-radius:12px 12px 0 0;padding:44px 32px 40px;">
<p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.4;letter-spacing:3px;color:#f3d6dc;">THƯ MỜI</p>
<h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.3;font-weight:normal;color:#ffffff;">${escapeHtml(i.title)}</h1>
</td></tr>

<tr><td style="padding:36px 40px 8px;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.7;color:${INK};">
<p style="margin:0 0 16px;">${escapeHtml(salutation)},</p>
<p style="margin:0;color:#3d3d42;">${escapeHtml(message).replace(/\n/g, '<br/>')}</p>
</td></tr>

${
  rows.length
    ? `<tr><td style="padding:24px 40px 0;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e7e0d2;border-radius:10px;background:#faf8f4;">
<tr><td style="padding:6px 22px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">${rowsHtml}</table></td></tr>
</table></td></tr>`
    : ''
}

<tr><td align="center" style="padding:28px 40px 4px;">${this.button(i.link, 'Xem thiệp mời & xác nhận tham dự')}</td></tr>
<tr><td align="center" style="padding:0 40px 36px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:${MUTED};">
Nếu nút không hoạt động, bạn có thể sao chép liên kết này vào trình duyệt:<br/>
<a href="${escapeHtml(i.link)}" style="color:${BRAND};word-break:break-all;">${escapeHtml(i.link)}</a>
</td></tr>

<tr><td align="center" style="background:#f7f3ec;border-top:1px solid #e7e0d2;border-radius:0 0 12px 12px;padding:18px 40px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:${MUTED};">
Thư này được gửi bởi <strong>${escapeHtml(hostLabel)}</strong> qua iCards.<br/>Cần hỗ trợ? Chỉ cần trả lời email này.
</td></tr>

</table>
<p style="margin:20px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#8a8a90;text-align:center;">© iCards.com.vn</p>
</td></tr>
</table>
</body>
</html>`;

    const text = [
      `${salutation},`,
      '',
      message,
      '',
      i.title,
      ...rows.map(([label, value]) => `${label}: ${value}`),
      '',
      `Xem thiệp mời và xác nhận tham dự: ${i.link}`,
      '',
      `Thư này được gửi bởi ${hostLabel} qua iCards. Cần hỗ trợ? Chỉ cần trả lời email này.`,
    ].join('\n');

    await this.send(i.to, subject, html, text);
  }

  async sendEventReminder(i: {
    to: string; salutation: string; title: string; daysLeft: number;
    eventDate?: string; venue?: string; link: string;
  }): Promise<void> {
    const when = i.eventDate ? escapeHtml(i.eventDate) : '';
    const where = i.venue ? escapeHtml(i.venue) : '';
    const details = [when && `<strong>Thời gian:</strong> ${when}`, where && `<strong>Địa điểm:</strong> ${where}`]
      .filter(Boolean).join('<br/>');
    const html = this.shell(
      `Còn ${i.daysLeft} ngày nữa đến ${i.title}`,
      `<p style="margin:0 0 16px;">${escapeHtml(i.salutation)},</p>
<p style="margin:0 0 16px;">Còn <strong>${i.daysLeft} ngày</strong> nữa là đến <strong>${escapeHtml(i.title)}</strong>. Bạn vui lòng xác nhận tham dự giúp chúng tôi nhé.</p>
${details ? `<p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:${INK};">${details}</p>` : ''}
${this.button(i.link, 'Xác nhận tham dự')}
<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:${MUTED};">
Nếu nút không hoạt động, bạn có thể sao chép liên kết sau vào trình duyệt:<br/>
<a href="${escapeHtml(i.link)}" style="color:${BRAND};word-break:break-all;">${escapeHtml(i.link)}</a>
</p>`,
    );
    const text = [
      `${i.salutation},`,
      '',
      `Còn ${i.daysLeft} ngày nữa là đến ${i.title}. Bạn vui lòng xác nhận tham dự giúp chúng tôi nhé.`,
      '',
      i.eventDate ? `Thời gian: ${i.eventDate}` : '',
      i.venue ? `Địa điểm: ${i.venue}` : '',
      '',
      `Xác nhận tham dự: ${i.link}`,
      '',
      'Bạn nhận được email này vì được mời tham dự một sự kiện trên iCards.',
    ].filter((l, idx, arr) => !(l === '' && arr[idx - 1] === '')).join('\n');
    await this.send(i.to, `Nhắc xác nhận tham dự: ${i.title}`, html, text);
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


  /** Email mã OTP 6 số để đặt lại mật khẩu (mã hiển thị lớn, dễ đọc trên mọi thiết bị). */
  async sendPasswordOtp(to: string, name: string, code: string, ttlMinutes: number): Promise<void> {
    const digits = escapeHtml(code.split('').join(' '));
    const html = this.shell(
      `Mã xác nhận đặt lại mật khẩu iCards: ${code}`,
      `<p style="margin:0 0 16px;">Xin chào <strong>${escapeHtml(name)}</strong>,</p>
<p style="margin:0 0 20px;">Bạn vừa yêu cầu đặt lại mật khẩu iCards. Nhập mã xác nhận sau vào trang đặt lại mật khẩu:</p>
<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto 24px;">
<tr><td align="center" style="background:#f4f1ea;border:1px solid #e7e0d2;border-radius:10px;padding:18px 28px;font-family:Arial,Helvetica,sans-serif;font-size:32px;font-weight:bold;letter-spacing:6px;color:${INK};">${digits}</td></tr></table>
<p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:${INK};">Mã có hiệu lực trong ${ttlMinutes} phút. Tuyệt đối không chia sẻ mã này cho bất kỳ ai.</p>
<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:${MUTED};">Nếu không phải bạn yêu cầu, hãy bỏ qua email này. Mật khẩu của bạn vẫn an toàn.</p>`,
    );
    const text = [
      `Xin chào ${name},`,
      '',
      'Bạn vừa yêu cầu đặt lại mật khẩu iCards. Mã xác nhận của bạn là:',
      '',
      code,
      '',
      `Mã có hiệu lực trong ${ttlMinutes} phút. Tuyệt đối không chia sẻ mã này cho bất kỳ ai.`,
      'Nếu không phải bạn yêu cầu, hãy bỏ qua email này.',
    ].join('\n');
    await this.send(to, 'Mã xác nhận đặt lại mật khẩu iCards', html, text);
  }
}
