import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { Model } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { User } from '../../users/schemas/user.schema.js';
import type { JwtUser } from '../../common/decorators/current-user.decorator.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(cfg: ConfigService, @InjectModel(User.name) private readonly users: Model<User>) {
    const cookieName = cfg.get<string>('COOKIE_NAME') ?? 'icards_token';
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => (req?.cookies?.[cookieName] as string | undefined) ?? null,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: cfg.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string }): Promise<JwtUser> {
    const u = await this.users.findById(payload.sub).select('role isActive').lean();
    if (!u || !u.isActive) throw new UnauthorizedException();
    return { userId: String(u._id), role: u.role };
  }
}
