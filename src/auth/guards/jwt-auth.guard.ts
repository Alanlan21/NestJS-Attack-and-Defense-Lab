import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
// Guard separado facilita aplicar JwtAuthGuard via DI em vários módulos sem expor detalhes de passport para o restante da aplicação.
export class JwtAuthGuard extends AuthGuard('jwt') {}
