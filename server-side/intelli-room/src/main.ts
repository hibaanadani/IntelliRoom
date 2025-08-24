import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // here we are using pipes as middleware
  app.useGlobalPipes(new ValidationPipe())

  const config= new DocumentBuilder().setTitle('Nest API').setDescription('Test APIs').build();

  const document= SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('/', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
