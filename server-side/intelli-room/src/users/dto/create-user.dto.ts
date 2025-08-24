// DTOs are data transfer object, schema representation of the objects used
// intermediate way to transfer information
// ApiProperty return clear documentations of what is being returned

import { ApiProperty } from "@nestjs/swagger";

export class createUserDto{
    @ApiProperty()
    name:string;

    @ApiProperty()
    username:string;

    @ApiProperty()
    email:string;

    @ApiProperty()
    password:string;
    
    @ApiProperty({required: false})
    age?:number;

    @ApiProperty({required: false})
    phone?:number;
}