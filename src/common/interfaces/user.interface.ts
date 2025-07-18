import { Request as ExpressRequest } from 'express';
import { Role } from 'src/auth/enums/role.enum';

export interface User {
  id: string;
  role: Role;
}

export interface RequestWithUser extends ExpressRequest {
  user: User;
}
