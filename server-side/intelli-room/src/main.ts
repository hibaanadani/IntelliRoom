// Step 1: Import everything we need from NestJS
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

// This is the main function that starts our NestJS application
async function bootstrap() {
  // Step 2: Create our NestJS app using our main AppModule
  const app = await NestFactory.create(AppModule);

  // Step 3: Add validation to all our API endpoints
  // This checks that incoming data matches our DTO rules
  app.useGlobalPipes(new ValidationPipe());

  // Step 4: Set up Swagger (API documentation)
  // This creates a nice web page where you can test your APIs
  const swaggerConfig = new DocumentBuilder()
    .setTitle('IntelliRoom API')
    .setDescription('My first NestJS API for learning')
    .setVersion('1.0')
    .build();

  // Step 5: Create the Swagger documentation
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  // Step 6: Make Swagger available at the root URL
  // Visit http://localhost:3000 to see your API docs!
  SwaggerModule.setup('/', app, swaggerDocument);

  // Step 7: Start the server on port 3000 (or from environment)
  const port = process.env.PORT || 3000;
  await app.listen(port);
}

// Start the application
bootstrap();
