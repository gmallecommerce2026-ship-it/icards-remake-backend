import { Injectable, Logger, type OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { seedAll } from './catalog-seeder.js';

/** Tự nạp danh mục và giao diện khi khởi động nếu SEED_ON_BOOT=true. An toàn bật lâu dài: chỉ bổ sung phần còn thiếu. */
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly config: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    if (this.config.get<string>('SEED_ON_BOOT') !== 'true') return;
    try {
      const summary = await this.dataSource.transaction((m) => seedAll(m));
      this.logger.log(
        summary.skipped
          ? `Dữ liệu seed đã ở phiên bản ${summary.version}, bỏ qua.`
          : `Đã seed phiên bản ${summary.version}: ${JSON.stringify(summary.inserted)}`,
      );
    } catch (err) {
      // Không làm sập ứng dụng nếu seed lỗi; xem log và chạy lại npm run seed
      this.logger.error('Seed khi khởi động lỗi', err instanceof Error ? err.stack : String(err));
    }
  }
}
