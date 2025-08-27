import { ApiProperty } from "@nestjs/swagger";

export class Catalogue {
  id: number;

  @ApiProperty({ description: 'season of the catalogue', example: "S-S2025" })
  season: string;

  @ApiProperty({ description: 'gallary for which the catalogue belongs to', example: "Ikea" })
  gallary: string;
}