import { Injectable } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
    constructor(private usersService:UsersService, private jwtService:JwtService){}
        async validateUser(username:string, password:string): Promise<any>{
            const user = await this.usersService.findByUserName(username);

            if( user && user.password=== password){
                // so that we do not return the password too
                const{ password, username, ...rest}= user;
                return rest;
            }

            return null;
    }

        async login(user:any){
            const payload ={name:user.name, sub:user.id};

            return{
                access_token:this.jwtService.sign(payload),
            }
        }

}
