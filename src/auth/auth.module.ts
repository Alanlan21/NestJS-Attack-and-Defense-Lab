// src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UsersModule } from '../user/user.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { loadAsymmetricKey } from './utils/key-loader';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ConfigModule,
    JwtModule.registerAsync({
      // Registrar JWT de forma assíncrona nos permite depender da ConfigService
      // e preparar chaves RSA em tempo de inicialização, mantendo a aplicação
      // agnóstica à forma como as credenciais chegam (env, arquivo, secret manager).
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const privateKey = loadAsymmetricKey(configService, {
          envVar: 'JWT_PRIVATE_KEY',
          pathVar: 'JWT_PRIVATE_KEY_PATH',
          fallbackPath: 'keys/private.pem',
        });

        const publicKey = loadAsymmetricKey(configService, {
          envVar: 'JWT_PUBLIC_KEY',
          pathVar: 'JWT_PUBLIC_KEY_PATH',
          fallbackPath: 'keys/public.pem',
        });

        return {
          privateKey,
          publicKey,
          // Usamos RS256 para facilitar rotação de chaves e manter compatibilidade
          // com provedores externos que exigem assinatura assimétrica.
          signOptions: {
            expiresIn: configService.get<string>('JWT_EXPIRATION_TIME'),
            algorithm: 'RS256',
          },
        };
      },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
