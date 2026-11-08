import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api');
    app.use(helmet());
    app.use(cookieParser());
    app.enableCors({
        origin: process.env.FRONTEND_URL?.split(','),
        credentials: true,
    });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    const doc = SwaggerModule.createDocument(app, new DocumentBuilder().setTitle('iCards API').addCookieAuth('icards_token').build());
    SwaggerModule.setup('docs', app, doc);
    await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
//# sourceMappingURL=main.js.map