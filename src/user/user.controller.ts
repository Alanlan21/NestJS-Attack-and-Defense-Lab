import { Body, Controller, Post, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { UsersService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './dto/user-role.enum';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Cria um novo usuário.
   * Apenas administradores podem criar novos usuários e escolher o papel apropriado.
   * A senha será hashada e a resposta não incluirá o campo `password`.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  // Ordem importa: primeiro autenticamos via JWT, depois avaliamos as roles
  // para devolver respostas coerentes (401 x 403) e manter métricas alinhadas.
  @Roles(UserRole.ADMIN)
  async create(@Body() createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const user = await this.usersService.create(createUserDto);

    // Removemos o campo senha antes de retornar
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
