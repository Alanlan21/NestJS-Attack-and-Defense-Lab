import { Controller, All, Req, Res, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { HoneypotService } from './honeypot.service';

/**
 * Honeypot controller - endpoints falsos para atrair e detectar atacantes
 * Todos os acessos aqui são considerados suspeitos
 */
@Controller()
export class HoneypotController {
  private readonly logger = new Logger(HoneypotController.name);

  constructor(private readonly honeypotService: HoneypotService) {}

  /**
   * Endpoint falso de admin
   */
  @All('admin')
  @All('administrator')
  @All('admin/login')
  @All('admin/dashboard')
  async fakeAdmin(@Req() req: Request, @Res() res: Response) {
    await this.recordAccess(req, 'admin');
    return res
      .status(200)
      .json(this.honeypotService.generateFakeResponse('admin'));
  }

  /**
   * Endpoint falso de database
   */
  @All('db')
  @All('database')
  @All('phpmyadmin')
  @All('mysql')
  async fakeDatabase(@Req() req: Request, @Res() res: Response) {
    await this.recordAccess(req, 'database');
    return res
      .status(200)
      .json(this.honeypotService.generateFakeResponse('database'));
  }

  /**
   * Arquivos sensíveis falsos
   */
  @All('.env')
  @All('config.json')
  @All('secrets.txt')
  @All('passwords.txt')
  @All('backup.sql')
  async fakeSensitiveFiles(@Req() req: Request, @Res() res: Response) {
    await this.recordAccess(req, 'file');
    return res
      .status(200)
      .json(this.honeypotService.generateFakeResponse('file'));
  }

  /**
   * Endpoints de desenvolvimento falsos
   */
  @All('debug')
  @All('test')
  @All('dev')
  @All('swagger')
  @All('api-docs')
  async fakeDevEndpoints(@Req() req: Request, @Res() res: Response) {
    await this.recordAccess(req, 'api');
    return res
      .status(200)
      .json(this.honeypotService.generateFakeResponse('api'));
  }

  /**
   * Registra o acesso ao honeypot
   */
  private async recordAccess(req: Request, type: string): Promise<void> {
    const ip = this.getClientIp(req);

    await this.honeypotService.recordHoneypotAccess({
      ip,
      endpoint: req.path,
      method: req.method,
      userAgent: req.headers['user-agent'],
      payload: {
        type,
        body: req.body,
        query: req.query,
        headers: req.headers,
      },
    });
  }

  private getClientIp(req: Request): string {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.ip ||
      req.socket.remoteAddress ||
      'unknown'
    );
  }
}
