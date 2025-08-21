import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    // nest js utilizing dependancy injection and instantiate classes and manage referenc to those classes
    constructor(private userService: UsersService){}

    @Get()
    getUser(): any{
        return [{id:0}];
    }

    // : marks the id as dynamic value URL parameter
    // parse the id from the URL and provide it to the service
    // param 1 to many, specify id and giv eit name id and type string
    @Get(':id')
    getUserById(@Param('id') id: string): any{
        return {
            id
        }
    }
}
