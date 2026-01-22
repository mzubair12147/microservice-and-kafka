import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SERVICES_PORTS } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true
  }))
  await app.listen(process.env.PORT ?? SERVICES_PORTS.API_GATEWAY);
}
bootstrap();
