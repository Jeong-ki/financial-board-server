import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  // if (process.env.NODE_ENV !== 'production') {
  //   app.enableCors({ origin: 'http://localhost:3000', credentials: true });
  // }
  // app.useGlobalPipes(new ValidationPipe());
  const port = Number.parseInt(configService.get(`REST_API_PORT`));
  console.log(port);

  await app.listen(port);
}
bootstrap();
