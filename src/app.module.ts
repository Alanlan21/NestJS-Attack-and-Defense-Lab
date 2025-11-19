// src/app.module.ts

import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
// import { LogsModule } from './logs/logs.module';
import { ConfigModule } from '@nestjs/config';
import { SecurityModule } from './security/security.module';
import { WAFMiddleware } from './security/waf/waf.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Torna as variáveis de ambiente disponíveis globalmente
      // Atenção: qualquer fallback padrão deve ir para o ConfigService para evitar
      // valores mágicos espalhados pela aplicação.
    }),
    ScheduleModule.forRoot(), // Para cron jobs de limpeza de threat intelligence
    // bloco de configuração do postgres
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true, // Carrega as entidades automaticamente
      synchronize: true, // Sincroniza o schema do banco (apenas para desenvolvimento)
    }),
    SecurityModule, // Novo módulo de segurança (IDS/IPS, WAF, Honeypot, Monitoring)
    UsersModule,
    AuthModule,
    // LogsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Aplica o WAF middleware em todas as rotas exceto honeypots
    // (honeypots devem permitir acesso para coletar inteligência)
    consumer
      .apply(WAFMiddleware)
      .exclude(
        '/admin',
        '/admin/(.*)',
        '/administrator',
        '/administrator/(.*)',
        '/db',
        '/database',
        '/phpmyadmin',
        '/phpmyadmin/(.*)',
        '/.env',
        '/config.json',
        '/secrets.txt',
        '/passwords.txt',
        '/backup.sql',
        '/debug',
        '/debug/(.*)',
        '/test',
        '/dev',
        '/swagger',
        '/swagger/(.*)',
        '/api-docs',
        '/api-docs/(.*)',
      )
      .forRoutes('*');
  }
}
