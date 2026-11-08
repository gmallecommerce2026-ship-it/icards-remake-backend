import { Injectable, InternalServerErrorException, ServiceUnavailableException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomBytes } from 'node:crypto';

const EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
export const IMAGE_MIMES = Object.keys(EXT);

/** Cloudflare R2 (S3-compatible). */
@Injectable()
export class StorageService {
  private readonly s3?: S3Client;
  private readonly bucket?: string;
  private readonly publicUrl?: string;

  constructor(cfg: ConfigService) {
    const accountId = cfg.get<string>('ACCOUNT_ID');
    const accessKeyId = cfg.get<string>('ACCESS_KEY_ID');
    const secretAccessKey = cfg.get<string>('SECRET_ACCESS_KEY');
    this.bucket = cfg.get<string>('BUCKET_NAME');
    this.publicUrl = cfg.get<string>('R2_PUBLIC_URL')?.replace(/\/+$/, '');
    if (accountId && accessKeyId && secretAccessKey && this.bucket && this.publicUrl) {
      this.s3 = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: { accessKeyId, secretAccessKey },
      });
    }
  }

  get enabled(): boolean { return !!this.s3; }

  async upload(buf: Buffer, mimetype: string, folder: string): Promise<string> {
    if (!this.s3) throw new ServiceUnavailableException('Chưa cấu hình lưu trữ ảnh (R2).');
    const ext = EXT[mimetype];
    if (!ext) throw new BadRequestException('Chỉ chấp nhận ảnh JPG, PNG, WEBP, GIF.');
    const key = `${folder}/${Date.now()}-${randomBytes(6).toString('hex')}.${ext}`;
    try {
      await this.s3.send(new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: buf, ContentType: mimetype, CacheControl: 'public, max-age=31536000, immutable' }));
    } catch {
      throw new InternalServerErrorException('Tải ảnh lên thất bại.');
    }
    return `${this.publicUrl}/${key}`;
  }

  /** Nhận data URL (data:image/png;base64,...) -> tải lên -> trả URL. */
  async uploadDataUrl(dataUrl: string, folder: string): Promise<string> {
    const m = /^data:(image\/(?:jpeg|png|webp|gif));base64,(.+)$/s.exec(dataUrl);
    if (!m) throw new BadRequestException('Ảnh data URL không hợp lệ.');
    if (m[2].length > 7_000_000) throw new BadRequestException('Ảnh quá lớn (tối đa ~5MB).');
    return this.upload(Buffer.from(m[2], 'base64'), m[1], folder);
  }

  /** Chỉ xoá file thuộc bucket của mình. Lỗi xoá bị bỏ qua (không chặn nghiệp vụ). */
  async removeByUrl(url: string): Promise<void> {
    if (!this.s3 || !this.publicUrl || !url.startsWith(`${this.publicUrl}/`)) return;
    try {
      await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: url.slice(this.publicUrl.length + 1) }));
    } catch { /* ignore */ }
  }

  isOwnUrl(url: string): boolean { return !!this.publicUrl && url.startsWith(`${this.publicUrl}/`); }
}
