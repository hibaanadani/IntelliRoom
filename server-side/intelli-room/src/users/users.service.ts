import { Injectable } from '@nestjs/common';
import { createUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {

    private users: User[] = [{id:0, name:'Charbel'}];

    // : User[] provides return type, important to help catch bugs early
    findAll(): User[]{
        return this.users;
    }

    findById(userId: number): User | undefined{
        return this.users.find((user) => user.id === userId );
    }
// ... spreading since we will connect to a db lateron and we will need more than the name
    createUser(createUserDto: createUserDto): User{
        const newUser ={id: Date.now(), ...createUserDto};

        this.users.push(newUser);

        return newUser;
    }
}
