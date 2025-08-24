import { Injectable } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
    constructor(private usersService:UsersService){}
        async validateUser(username:string, password:string): Promise<any>{
            const user = await this.usersService.findByUserName(username);

            if( user && user.password=== password){
                // so that we do not return the password too
                const{ password, username, ...rest}= user;
                return rest;
            }

            return null;
    }

}
