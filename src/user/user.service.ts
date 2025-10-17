import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from './dto/user-role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Cria um novo usuário após verificar unicidade e aplicar hash na senha
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, role } = createUserDto;

    // Verifica se o email já está em uso
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      // Antecipamos a checagem para retornar um erro de domínio controlado,
      // mas ainda dependemos do unique constraint no banco para as condições de corrida.
      throw new ConflictException('Email já está em uso');
    }

    // Gera o hash da senha
    const saltRounds = 10;
    // Salt fixo mantém custo previsível em ambientes serverless; ajuste aqui impacta
    // diretamente latência de login e criação de usuário.
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Cria o objeto User para salvar
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      role: role ?? UserRole.USER,
    });

    try {
      return await this.userRepository.save(user);
    } catch (error) {
      // Logica de fallback em caso de erro inesperado
      // Idealmente logamos o erro bruto em um serviço de observabilidade antes de mascarar.
      throw new InternalServerErrorException('Erro ao criar usuário');
    }
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    // Mantemos a busca simples para ser reutilizada tanto por autenticação quanto scripts
    // de bootstrap; qualquer eager loading pesado deve ser feito em métodos específicos.
    return await this.userRepository.findOne({ where: { email } });
  }

}
