import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { UserRole } from "src/users/entities/user.entity";
import { ROLES_KEY } from "../decorators/roles.decorators";


@Injectable()
export class RolesGuard implements CanActivate{
    //Reflector -> utility that  will help to access metadata
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        // Retrieve the roles metadata set by the roles decorator

        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
            ROLES_KEY, [
                context.getHandler(), // method level metadata
                context.getClass() // class level metadata
            ]
        );

        if(!requiredRoles) return true

        const {user} = context.switchToHttp().getRequest()

        if(!user) throw new ForbiddenException('User not anthenticated')

        const hasRequiredRole = requiredRoles.some(role=> user.role === role)

        if (!hasRequiredRole) throw new ForbiddenException('Insufficient permission')
        
        return true
    }
}