import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { time } from 'console';
import { createUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { ApiCreatedResponse, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
    // nest js utilizing dependancy injection and instantiate classes and manage referenc to those classes
    constructor(private usersService: UsersService){}

    @ApiOkResponse({type:User, isArray: true})
    @Get()
    getUser(): User[]{
        return this.usersService.findAll();
    }

    // get user by querying over, search by id, name...
    // you can have multipe query params, so here we will specify
    // ApiQuery makes entering the name non optional
    @ApiOkResponse({type:User, isArray: true, description: 'get user by Name'})
    @ApiQuery({name:'name',required: true})
    @Get('name')
    getUserByName(@Query('name') name: string): User[]{
        return this.usersService.findByName(name);
        // console.log('=== Controller Debug ===');
        // console.log('Received name parameter:', `"${name}"`);
        // console.log('Name length:', name.length);
        
        // const result = this.usersService.findByName(name);
        // console.log('Final result:', result);
        // console.log('Result length:', result.length);
        
        // return result;
    }

    // : marks the id as dynamic value URL parameter
    // parse the id from the URL and provide it to the service
    // param 1 to many, specify id and giv eit name id and type string
    @ApiOkResponse({type:User, description: 'get user by ID'})
    @Get(':id')
    getUserById(@Param('id') id: string): User | undefined{ // Nest already parses to int, but we will see it later on
        return this.usersService.findById(Number(id));
    }

    // body parser
    // on post it responds to 201 with type user
    @ApiCreatedResponse({type:User})
    @Post()
    createUser(@Body() body: createUserDto ): User{
        return this.usersService.createUser(body); 
    }
}
