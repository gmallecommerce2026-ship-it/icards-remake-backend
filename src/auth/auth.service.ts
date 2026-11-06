import { ConflictException, Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'node:crypto';
import type { CookieOptions, Response } from 'express';
import { User } from '../users/schemas/user.schema.js';
import { toPublicUser } from '../users/users.service.js';
import { MailService } from '../mail/mail.service.js';
import { toSeconds } from '../common/utils/duration.js';
import type { ForgotPasswordDto, LoginDto, RegisterDto, ResetPasswordDto } from './dto/auth.dto.js';

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');
// Hash giả để so sánh khi không tìm thấy user -> thời gian phản hồi như nhau (chống dò tài khoản)
const DUMMY_HASH = bcrypt.hashSync('icards-dummy-password', 12);

@Injectable()
export class AuthService {
  private readonly cookieName: string;
  private readonly maxAgeSec: number;

  constructor(
    private readonly cfg: ConfigService,
    private readonly jwt: JwtService,
    private readonly mail: MailService,
    @InjectModel(User.name) private readonly users: Model<User>,
  ) {
    this.cookieName = cfg.get<string>('COOKIE_NAME') ?? 'icards_token';
    this.maxAgeSec = toSeconds(cfg.get<string>('JWT_EXPIRES_IN'));
  }

  get expiresInSeconds() { return this.maxAgeSec; }

  private cookieOptions(): CookieOptions {
    const prod = this.cfg.get<string>('NODE_ENV') === 'production';
    const sameSite = (this.cfg.get<string>('COOKIE_SAME_SITE') as CookieOptions['sameSite']) ?? (prod ? 'none' : 'lax');
    return { httpOnly: true, secure: prod || sameSite === 'none', sameSite, path: '/' };
  }

  private issue(res: Response, userId: string, role: string) {
    const token = this.jwt.sign({ sub: userId, role });
    res.cookie(this.cookieName, token, { ...this.cookieOptions(), maxAge: this.maxAgeSec * 1000 });
  }

  async register(dto: RegisterDto, res: Response) {
    const email = dto.email.toLowerCase();
    if (await this.users.exists({ $or: [{ email }, { username: dto.username }] })) {
      throw new ConflictException('Email hoặc tên đăng nhập đã được sử dụng');
    }
    const u = await this.users.create({ username: dto.username, email, password: await bcrypt.hash(dto.password, 12) });
    this.issue(res, String(u._id), u.role);
    return { user: toPublicUser(u) };
  }

  async login(dto: LoginDto, res: Response) {
    const id = dto.login.trim();
    const u = await this.users
      .findOne({ $or: [{ email: id.toLowerCase() }, { username: id }] })
      .select('+password');
    const ok = await bcrypt.compare(dto.password, u?.password ?? DUMMY_HASH);
    if (!u || !u.password || !ok || !u.isActive) throw new UnauthorizedException('Sai tài khoản hoặc mật khẩu');
    this.issue(res, String(u._id), u.role);
    return { user: toPublicUser(u) };
  }

  logout(res: Response) {
    res.clearCookie(this.cookieName, this.cookieOptions());
    return { message: 'Đã đăng xuất' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const u = await this.users.findOne({ email: dto.email.toLowerCase() });
    if (u) {
      const raw = randomBytes(32).toString('hex');
      u.resetPasswordHash = sha256(raw);
      u.resetPasswordExpires = new Date(Date.now() + 30 * 60_000);
      await u.save();
      const base = (this.cfg.get<string>('FRONTEND_URL') ?? '').split(',')[0].trim().replace(/\/+$/, '');
      // gửi nền: không để lộ việc email có tồn tại hay không qua thời gian phản hồi / lỗi
      void this.mail.sendResetPassword(u.email, u.fullName ?? u.username, `${base}/reset-password?token=${raw}`).catch(() => undefined);
    }
    return { message: 'Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.' };
  }

  async resetPassword(token: string, dto: ResetPasswordDto) {
    const u = await this.users
      .findOne({ resetPasswordHash: sha256(token), resetPasswordExpires: { $gt: new Date() } })
      .select('+resetPasswordHash +resetPasswordExpires');
    if (!u) throw new BadRequestException('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');
    u.password = await bcrypt.hash(dto.password, 12);
    u.resetPasswordHash = undefined;
    u.resetPasswordExpires = undefined;
    await u.save();
    return { message: 'Đã đặt lại mật khẩu' };
  }
}
