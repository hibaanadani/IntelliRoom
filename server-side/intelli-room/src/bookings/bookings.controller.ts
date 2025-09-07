// import {
//   Body,
//   Controller,
//   Delete,
//   Get,
//   Param,
//   Patch,
//   Post,
//   ParseIntPipe,
//   HttpCode,
//   HttpStatus,
// } from '@nestjs/common';
// import { BookingsService } from './bookings.service';
// import { CreateBookingDto } from './dto/create-booking.dto';
// import { UpdateBookingDto } from './dto/update-booking.dto';
// import {
//   ApiCreatedResponse,
//   ApiOkResponse,
//   ApiNotFoundResponse,
//   ApiOperation,
//   ApiParam,
//   ApiTags,
// } from '@nestjs/swagger';
// import { Booking } from './entities/booking.entity';

// @ApiTags('Bookings')
// @Controller('bookings')
// export class BookingsController {
//   constructor(private readonly bookingsService: BookingsService) {}

//   // @ApiOperation({ summary: 'Create a new booking' })
//   // @ApiCreatedResponse({ type: Booking, description: 'Booking created successfully' })
//   // @Post()
//   // async create(@Body() createBookingDto: CreateBookingDto): Promise<Booking> {
//   //   return await this.bookingsService.create(createBookingDto);
//   // }

//   @ApiOperation({ summary: 'Get all bookings' })
//   @ApiOkResponse({ type: Booking, isArray: true, description: 'List of all bookings' })
//   @Get()
//   async findAll(): Promise<Booking[]> {
//     return await this.bookingsService.findAll();
//   }

//   @ApiOperation({ summary: 'Get a single booking by ID' })
//   @ApiParam({ name: 'id', description: 'Booking ID', type: 'integer' })
//   @ApiOkResponse({ type: Booking, description: 'Booking found successfully' })
//   @ApiNotFoundResponse({ description: 'Booking not found' })
//   @Get(':id')
//   async findOne(@Param('id', ParseIntPipe) id: number): Promise<Booking> {
//     return await this.bookingsService.findOne(id);
//   }

//   @ApiOperation({ summary: 'Update a booking by ID' })
//   @ApiParam({ name: 'id', description: 'Booking ID', type: 'integer' })
//   @ApiOkResponse({ type: Booking, description: 'Booking updated successfully' })
//   @ApiNotFoundResponse({ description: 'Booking not found' })
//   @Patch(':id')
//   async update(
//     @Param('id', ParseIntPipe) id: number,
//     @Body() updateBookingDto: UpdateBookingDto,
//   ): Promise<Booking> {
//     return await this.bookingsService.update(id, updateBookingDto);
//   }

//   @ApiOperation({ summary: 'Delete a booking by ID' })
//   @ApiParam({ name: 'id', description: 'Booking ID', type: 'integer' })
//   @ApiOkResponse({ description: 'Booking deleted successfully' })
//   @ApiNotFoundResponse({ description: 'Booking not found' })
//   @HttpCode(HttpStatus.NO_CONTENT)
//   @Delete(':id')
//   async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
//     return await this.bookingsService.remove(id);
//   }
// }
