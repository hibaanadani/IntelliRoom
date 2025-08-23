import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { time } from 'console';
import { createUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
    // nest js utilizing dependancy injection and instantiate classes and manage referenc to those classes
    constructor(private usersService: UsersService){}

    @Get()
    getUser(): User[]{
        return this.usersService.findAll();
    }

    // : marks the id as dynamic value URL parameter
    // parse the id from the URL and provide it to the service
    // param 1 to many, specify id and giv eit name id and type string
    @Get(':id')
    getUserById(@Param('id') id: string): User | undefined{ // Nest already parses to int, but we will see it later on
        return this.usersService.findById(Number(id));
    }

    // body parser
    @Post()
    createUser(@Body() body: createUserDto ): User{
        return this.usersService.createUser(body); 
    }
}
