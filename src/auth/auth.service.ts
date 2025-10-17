// src/auth/auth.service.ts

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Valida um usuário comparando a senha fornecida com o hash salvo no banco.
   * @param email - O e-mail do usuário.
   * @param pass - A senha a ser validada.
   * @returns O objeto do usuário se a senha for válida, caso contrário, null.
   */
  async validateUser(email: string, pass: string): Promise<Omit<User, 'password'>> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      // Retornamos um objeto sem password para impedir que camadas superiors acidentalmente serializem o hash no response ou em logs.
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  /**
   * Gera um token de acesso JWT para um usuário validado.
   * @param user - O objeto do usuário.
   * @returns Um objeto contendo o token de acesso.
   */
  async login(user: Omit<User, 'password'>) {
    const payload = {
      sub: user.id, // 'sub' é o padrão para o ID do sujeito (usuário)
      email: user.email,
      role: user.role,
    };
    
    return {
      // Centralizar a assinatura aqui mantém a estratégia Passport fina e facilita a troca futura por refresh tokens ou custom claims.
      access_token: this.jwtService.sign(payload),
    };
  }
}
