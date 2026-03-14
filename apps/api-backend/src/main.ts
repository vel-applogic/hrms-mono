import 'reflect-metadata';
import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module.js';
import { Seeder } from './module/seeder/seeder.js';
import { setup } from './setup.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger, { strict: false }));
  app.enableCors();

  setup(app);

  const port = process.env.PORT_API_ADMIN || 5002;
  await app.listen(port);

  await app.get(Seeder).seed();
}

bootstrap();
