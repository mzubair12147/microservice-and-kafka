import { NestFactory } from '@nestjs/core';
import { EventsServiceModule } from './events-service.module';
import { SERVICES_PORTS } from '@app/common';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(EventsServiceModule);

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
        }),
    );

    await app.listen(process.env.port ?? SERVICES_PORTS.EVENTS_SERVICE);
}
bootstrap();
