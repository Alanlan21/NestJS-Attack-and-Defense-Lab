import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserRole } from 'src/user/dto/user-role.enum';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  const email = 'user@example.com';
  const password = 'user123';

  const existing = await usersService.findOneByEmail(email);
  if (existing) {
    console.log('Usuário comum já existe.');
  } else {
    const userDto: CreateUserDto = {
      email,
      password,
      name: 'Usuário Comum',
      role: UserRole.USER, // SEM acesso ao SOC
    };

    await usersService.create(userDto);
    console.log('✅ Usuário comum criado com sucesso!');
    console.log(`   Email: ${email}`);
    console.log(`   Senha: ${password}`);
    console.log(`   Role: ${UserRole.USER}`);
    console.log('');
    console.log('⚠️  Este usuário NÃO tem acesso ao SOC Dashboard.');
    console.log('   Tentará fazer login → receberá 403 Forbidden');
  }

  await app.close();
}

bootstrap();
