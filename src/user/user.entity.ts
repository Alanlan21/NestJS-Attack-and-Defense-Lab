import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { UserRole } from './dto/user-role.enum';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: false })
  // Email único vira o identificador canônico; qualquer alteração precisa passar
  // por rotina de migração porque impacta o login e scripts de bootstrap.
  email: string;

  @Column({ nullable: false })
  // Guardamos apenas o hash; atualização de custo do bcrypt deve ser feita via
  // job de rehash para não invalidar logins existentes.
  password: string;
  
  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  // Enum facilita validação em nível de banco e evita phantom roles em relatórios.
  role: UserRole;

  @Column({ nullable: true })
  name: string;
}
