import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Passport } from "passport";
import { Strategy } from "passport-local";
import { AuthService } from "./auth.service";

// it is going to be a providor so we use injectable
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy){
    constructor(private authService: AuthService){
        super(); //pass in any config
    }

    async validate(username:string, password: string):Promise<any>{
        const user= await this.authService.validateUser(username,password);

        if(!user){
            throw new UnauthorizedException();
        }

        return user;
    }
}