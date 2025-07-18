import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/auth/enums/role.enum';

export const ROLES_KEY = 'roles';
// SetMetaData is a decorator factory used to attach meta data (key-vales pairs) to a class or method
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
