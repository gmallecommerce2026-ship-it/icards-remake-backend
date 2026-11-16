import { ConflictException, Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { createHash, randomBytes, randomInt } from 'node:crypto';
import type { CookieOptions, Response } from 'express';
import { User } from '../users/schemas/user.schema.js';
import { toPublicUser } from '../users/users.service.js';
import { MailService } from '../mail/mail.service.js';
import { toSeconds } from '../common/utils/duration.js';
import type { ForgotPasswordDto, LoginDto, RegisterDto, ResetPasswordDto, VerifyResetOtpDto } from './dto/auth.dto.js';

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');
// Hash giả để so sánh khi không tìm thấy user -> thời gian phản hồi như nhau (chống dò tài khoản)
const DUMMY_HASH = bcrypt.hashSync('icards-dummy-password', 12);

/** Mã OTP đặt lại mật khẩu */
const OTP_TTL_MS = 10 * 60_000;
/** Sau khoảng này mới được gửi lại mã (chống spam email) */
const OTP_RESEND_MS = 60_000;
const OTP_MAX_ATTEMPTS = 5;
/** Token đặt lại mật khẩu sau khi xác nhận OTP đúng */
const RESET_TOKEN_TTL_MS = 15 * 60_000;

const INVALID_OTP = 'Mã xác nhận không đúng hoặc đã hết hạn';

@Injectable()
export class AuthService {
  private readonly cookieName: string;
  private readonly maxAgeSec: number;

  constructor(
    private readonly cfg: ConfigService,
    private readonly jwt: JwtService,
    private readonly mail: MailService,
    @InjectRepository(User) private readonly users: Repository<User>,
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
    if (await this.users.exists({ where: [{ email }, { username: dto.username }] })) {
      throw new ConflictException('Email hoặc tên đăng nhập đã được sử dụng');
    }
    const created = this.users.create({
      username: dto.username,
      email,
      password: await bcrypt.hash(dto.password, 12),
      role: 'user',
      isActive: true,
    });
    await this.users.save(created);
    const u = await this.users.findOneOrFail({ where: { _id: created._id } });
    this.issue(res, u._id, u.role);
    return { user: toPublicUser(u) };
  }

  async login(dto: LoginDto, res: Response) {
    const id = dto.login.trim();
    const u = await this.users
      .createQueryBuilder('u')
      .addSelect('u.password')
      .where('u.email = :email OR u.username = :username', { email: id.toLowerCase(), username: id })
      .getOne();
    const ok = await bcrypt.compare(dto.password, u?.password ?? DUMMY_HASH);
    if (!u || !u.password || !ok || !u.isActive) throw new UnauthorizedException('Sai tài khoản hoặc mật khẩu');
    this.issue(res, u._id, u.role);
    return { user: toPublicUser(u) };
  }

  logout(res: Response) {
    res.clearCookie(this.cookieName, this.cookieOptions());
    return { message: 'Đã đăng xuất' };
  }

  /**
   * Bước 1: gửi mã OTP 6 số qua email. Luôn trả cùng một thông báo để không lộ email có tồn tại hay không.
   */
  async forgotPassword(dto: ForgotPasswordDto) {
    const email = dto.email.toLowerCase();
    const u = await this.users
      .createQueryBuilder('u')
      .addSelect(['u.resetOtpExpires'])
      .where('u.email = :email', { email })
      .getOne();

    const now = Date.now();
    // Đang trong thời gian chờ gửi lại -> bỏ qua, không gửi thêm email
    const sentAt = u?.resetOtpExpires ? u.resetOtpExpires.getTime() - OTP_TTL_MS : 0;
    if (u && u.isActive && now - sentAt >= OTP_RESEND_MS) {
      const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
      await this.users.update(
        { _id: u._id },
        { resetOtpHash: sha256(code), resetOtpExpires: new Date(now + OTP_TTL_MS), resetOtpAttempts: 0 },
      );
      // gửi nền: không để lộ việc email có tồn tại hay không qua thời gian phản hồi / lỗi
      void this.mail
        .sendPasswordOtp(u.email, u.fullName ?? u.username, code, OTP_TTL_MS / 60_000)
        .catch(() => undefined);
    }

    return {
      message: 'Nếu email tồn tại, chúng tôi đã gửi mã xác nhận gồm 6 chữ số.',
      expiresInSeconds: OTP_TTL_MS / 1000,
      resendInSeconds: OTP_RESEND_MS / 1000,
    };
  }

  /**
   * Bước 2: kiểm tra mã OTP. Đúng -> trả về resetToken (dùng với PATCH reset-password/:token).
   * Sai quá OTP_MAX_ATTEMPTS lần -> vô hiệu mã, phải yêu cầu mã mới.
   */
  async verifyResetOtp(dto: VerifyResetOtpDto) {
    const email = dto.email.toLowerCase();
    const u = await this.users
      .createQueryBuilder('u')
      .addSelect(['u.resetOtpHash', 'u.resetOtpExpires', 'u.resetOtpAttempts'])
      .where('u.email = :email', { email })
      .getOne();

    if (!u || !u.resetOtpHash || !u.resetOtpExpires || u.resetOtpExpires.getTime() <= Date.now()) {
      throw new BadRequestException(INVALID_OTP);
    }
    if ((u.resetOtpAttempts ?? 0) >= OTP_MAX_ATTEMPTS) {
      await this.users.update({ _id: u._id }, { resetOtpHash: null, resetOtpExpires: null, resetOtpAttempts: 0 });
      throw new BadRequestException('Bạn đã nhập sai quá nhiều lần. Vui lòng yêu cầu mã mới.');
    }
    if (u.resetOtpHash !== sha256(dto.code)) {
      await this.users.update({ _id: u._id }, { resetOtpAttempts: () => 'resetOtpAttempts + 1' });
      const left = Math.max(0, OTP_MAX_ATTEMPTS - (u.resetOtpAttempts ?? 0) - 1);
      throw new BadRequestException(left > 0 ? `Mã xác nhận không đúng. Còn ${left} lần thử.` : 'Bạn đã nhập sai quá nhiều lần. Vui lòng yêu cầu mã mới.');
    }

    const resetToken = randomBytes(32).toString('hex');
    await this.users.update(
      { _id: u._id },
      {
        resetOtpHash: null,
        resetOtpExpires: null,
        resetOtpAttempts: 0,
        resetPasswordHash: sha256(resetToken),
        resetPasswordExpires: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    );
    return { resetToken, expiresInSeconds: RESET_TOKEN_TTL_MS / 1000 };
  }

  async resetPassword(token: string, dto: ResetPasswordDto) {
    const u = await this.users
      .createQueryBuilder('u')
      .addSelect(['u.resetPasswordHash', 'u.resetPasswordExpires'])
      .where('u.resetPasswordHash = :h AND u.resetPasswordExpires > :now', { h: sha256(token), now: new Date() })
      .getOne();
    if (!u) throw new BadRequestException('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');
    await this.users.update(
      { _id: u._id },
      {
        password: await bcrypt.hash(dto.password, 12),
        resetPasswordHash: null, resetPasswordExpires: null,
        resetOtpHash: null, resetOtpExpires: null, resetOtpAttempts: 0,
      },
    );
    return { message: 'Đã đặt lại mật khẩu' };
  }
}
