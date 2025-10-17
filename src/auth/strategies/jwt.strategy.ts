import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { loadAsymmetricKey } from '../utils/key-loader';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    // A estratégia lê a chave pública no bootstrap para falhar rápido caso a infraestrutura
    // esteja mal configurada; dessa forma evitamos aceitar tokens com chave desatualizada.
    const publicKey = loadAsymmetricKey(configService, {
      envVar: 'JWT_PUBLIC_KEY',
      pathVar: 'JWT_PUBLIC_KEY_PATH',
      fallbackPath: 'keys/public.pem',
    });

    super({
      // Bearer token no header padroniza integração com clients HTTP e ferramentas de teste.
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      algorithms: ['RS256'],
      // RS256 permite rotação separada de chaves pública/privada sem derrubar clientes.
      secretOrKey: publicKey,
    });
  }

  async validate(payload: JwtPayload) {
    // Reduz o payload ao essencial para evitar que informações sensíveis do token
    // vazem para camadas superiores (ex.: claims extras adicionados no futuro).
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
