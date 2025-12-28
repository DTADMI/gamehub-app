import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api');
    app.enableCors({
        origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
        credentials: true,
    });
    const port = process.env.PORT || 8080;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}/api`);
}

bootstrap();
