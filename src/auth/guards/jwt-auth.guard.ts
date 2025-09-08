import { AuthGuard } from "@nestjs/passport";
import {Injectable} from "@nestjs/common";

// JwtAuthGuard - will protect routed that requires authentications 

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
 