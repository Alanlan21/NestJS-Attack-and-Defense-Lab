import { IsEmail, IsOptional, IsString, MinLength, Matches, IsEnum } from 'class-validator';
import { UserRole } from './user-role.enum';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: 'A senha deve ter pelo menos 8 caracteres' })
  @Matches(/[A-Z]/, { message: 'A senha deve conter pelo menos uma letra maiúscula' })
  @Matches(/[a-z]/, { message: 'A senha deve conter pelo menos uma letra minúscula' })
  @Matches(/[0-9]/, { message: 'A senha deve conter pelo menos um número' })
  @Matches(/[^A-Za-z0-9]/, { message: 'A senha deve conter pelo menos um caractere especial' })
  password: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Role deve ser admin ou user' })
  role?: UserRole;
}
