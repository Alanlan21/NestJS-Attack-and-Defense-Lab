import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Pipe global garante contrato consistente entre controllers, serviços e clients.
  // Se futuramente adicionarmos micro serviços, manter este padrão evita divergência
  // de validação entre transportes.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,          // remove campos que não estão no DTO
      forbidNonWhitelisted: true, // dispara erro se vier campo desconhecido
      transform: true,           // transforma tipos (ex: string → number)
      transformOptions: {
        enableImplicitConversion: true, // permite inferência de tipo
      },
    }),
  );

  await app.listen(3000);
}
bootstrap();
