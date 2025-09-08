import { SetMetadata } from '@nestjs/common';
import { UserRole}  from 'src/users/entities/user.entity'

// Unique identifier for storing and retriving role requirements as metadata on route handlers

export const ROLES_KEY = 'roles';

// roles decorator markers the routes with the roles that are allowed to access them

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

// roles guard will read this metadata  to check if user has permission