import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersService } from "src/users/users.service";


@Injectable() //providor
export class JwtStrategy extends PassportStrategy(Strategy){
    UsersService: UsersService;
    // to config your strategy do that in the constructor
    constructor(){
        // provide config for jwt strategy
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration:false,
            secretOrKey:'SECRET' //protect this string, put in env
        })
    }
    async validate(payload: any) {
        const user = await this.UsersService.findById(payload.sub)
        return {
            id: payload.sub,
            name: payload.name,
            ...user
        };
    }
}