import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserRole } from 'src/user/dto/user-role.enum';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  // Script pensado para rodar em pipelines/containers: depende apenas das variáveis
  // e encerra o contexto Nest assim que cria (ou detecta) o admin inicial.
  const email = process.env.INITIAL_ADMIN_EMAIL;
  const password = process.env.INITIAL_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('Defina INITIAL_ADMIN_EMAIL e INITIAL_ADMIN_PASSWORD');
    process.exit(1);
  }

  const existing = await usersService.findOneByEmail(email);
  if (existing) {
    console.log('Admin já existe, não será recriado.');
  } else {
    const adminDto: CreateUserDto = {
      email,
      password, // senha em texto claro
      role: UserRole.ADMIN,
    };

    await usersService.create(adminDto);
    console.log('Admin criado com sucesso.'); // ou use seu DTO direto
    console.log('Admin criado com sucesso.');
  }

  await app.close();
}

bootstrap();
