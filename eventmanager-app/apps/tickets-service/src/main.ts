import { NestFactory } from '@nestjs/core';
import { TicketsServiceModule } from './tickets-service.module';
import { SERVICES_PORTS } from '@app/common';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(TicketsServiceModule);

  app.useGlobalPipes(
          new ValidationPipe({
              whitelist: true,
              transform: true,
              forbidNonWhitelisted: true,
          }),
      );

  await app.listen(process.env.port ?? SERVICES_PORTS.TICKETS_SERVICE);
}
bootstrap();
