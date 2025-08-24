// used to map 1 on 1 to the DB tables
//  @ApiProperty()is a DECORATOR to add documantation

import { ApiProperty } from "@nestjs/swagger";

export class User{
    @ApiProperty()
    id: number;

    @ApiProperty()
    name: string;

    @ApiProperty()
    username: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    password: string;

}