import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  if (process.env.NODE_ENV !== 'production') {
    app.enableCors({ origin: '*', credentials: true });
  }

  const port = Number.parseInt(configService.get(`REST_API_PORT`));
  console.log(port);

  await app.listen(port);
}
bootstrap();
