import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { AuthService } from "../auth.service";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(private authService: AuthService){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || ''
        })
    }

    async validate(payload: any) {
        try{
            const user = await this.authService.getUserById(payload.sub);

            if (!user) throw new UnauthorizedException('User not found');

            return{
                ...user,
                role: payload.role // farmer or processor or admin
            }
        }catch(error){
            throw new UnauthorizedException('Invalid token')
        }
    }
}