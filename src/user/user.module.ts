import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersController } from './user.controller';
import { UsersService } from './user.service';
import { User } from './user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService, JwtAuthGuard, RolesGuard],
  // Exportamos apenas o serviço para que outros módulos consumam a lógica de usuário
  // sem acoplar a controllers/guards, mantendo a coesão do domínio.
  exports: [UsersService],
})
export class UsersModule {}
