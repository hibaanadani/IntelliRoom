import { Injectable } from '@nestjs/common';
import { createUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {

    private users: User[] = [{id:0, name:'Charbel'},{id:1, name:'Taha'},{id:2, name:'Nour'},{id:3, name:'Nour'}];

    // : User[] provides return type, important to help catch bugs early
    findAll(): User[]{
        return this.users;
    }

    findById(userId: number): User | undefined{
        return this.users.find(user => user.id === userId );
    }

    findByName(userName : string ): User[]{
        return this.users.filter(user => user.name === userName );
        // console.log('=== Service Debug ===');
        // console.log('Searching for userName:', `"${userName}"`);
        // console.log('Available users:');
        // this.users.forEach((user, index) => {
        //     console.log(`  [${index}] id: ${user.id}, name: "${user.name}" (length: ${user.name.length})`);
        // });
        
        // const result = this.users.filter(user => {
        //     const match = user.name === userName;
        //     console.log(`Comparing "${user.name}" === "${userName}": ${match}`);
        //     return match;
        // });
        
        // console.log('Filter result:', result);
        // return result;
    }
// ... spreading since we will connect to a db lateron and we will need more than the name
    createUser(createUserDto: createUserDto): User{
        const newUser ={id: Date.now(), ...createUserDto};

        this.users.push(newUser);

        return newUser;
    }
}
