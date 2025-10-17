import * as fs from 'fs';

import { ConfigService } from '@nestjs/config';

interface LoadKeyOptions {
  envVar: string;
  pathVar: string;
  fallbackPath: string;
}

/**
 * Carrega uma chave RSA a partir de variáveis de ambiente ou do sistema de arquivos.
 * Caso a chave venha via variável de ambiente, converte sequências \n em quebras de linha reais
 * para permitir o uso em arquivos .env.
 */
export function loadAsymmetricKey(
  configService: ConfigService,
  { envVar, pathVar, fallbackPath }: LoadKeyOptions,
): string {
  const inlineKey = configService.get<string>(envVar);
  if (inlineKey) {
    // Suportar quebra de linha inline evita depender de volumes compartilhados em ambientes
    // serverless, onde nem sempre é trivial montar o arquivo de chave.
    return inlineKey.replace(/\\n/g, '\n');
  }

  const keyPath = configService.get<string>(pathVar) ?? fallbackPath;

  try {
    return fs.readFileSync(keyPath, 'utf8');
  } catch (error) {
    // Propagamos erro explícito para falhar o bootstrap e evitar que o JWT seja gerado
    // com chave inválida ou default inseguro.
    throw new Error(`Não foi possível carregar a chave definida por ${envVar} / ${pathVar}: ${(error as Error).message}`);
  }
}
