// // src/bookings/bookings.service.ts

// import { Injectable, NotFoundException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { MongoRepository } from 'typeorm';
// import { Booking } from './entities/booking.entity';
// import { CreateBookingDto } from './dto/create-booking.dto';
// import { UpdateBookingDto } from './dto/update-booking.dto';

// @Injectable()
// export class BookingsService {
//   constructor(
//     @InjectRepository(Booking)
//     private readonly bookingsRepository: MongoRepository<Booking>,
//   ) {}

//   // A helper function to get the next sequential ID
//   private async getNextBookingId(): Promise<number> {
//     const highestIdBooking = await this.bookingsRepository.findOne({
//       order: { id: 'DESC' },
//     });
//     return highestIdBooking ? highestIdBooking.id + 1 : 1;
//   }

//   // Creates a new booking
//   async create(createBookingDto: CreateBookingDto): Promise<Booking> {
//     const nextId = await this.getNextBookingId();
//     const newBooking = this.bookingsRepository.create({
//       id: nextId,
//       ...createBookingDto,
//     });
//     return this.bookingsRepository.save(newBooking);
//   }

//   // Retrieves all bookings
//   async findAll(): Promise<Booking[]> {
//     return this.bookingsRepository.find();
//   }

//   // Finds a single booking by its ID
//   // Note: The return type is Promise<Booking> because we handle the
//   // "not found" case by throwing an exception instead of returning null.
//   async findOne(id: number): Promise<Booking> {
//     const booking = await this.bookingsRepository.findOneBy({ id });
//     if (!booking) {
//       throw new NotFoundException(`Booking with ID ${id} not found.`);
//     }
//     return booking;
//   }

//   // Updates an existing booking
//   async update(
//     id: number,
//     updateBookingDto: UpdateBookingDto,
//   ): Promise<Booking> {
//     const booking = await this.bookingsRepository.findOneBy({ id });
//     if (!booking) {
//       throw new NotFoundException(`Booking with ID ${id} not found.`);
//     }
//     Object.assign(booking, updateBookingDto);
//     return this.bookingsRepository.save(booking);
//   }

//   // Removes a booking
//   async remove(id: number): Promise<void> {
//     const result = await this.bookingsRepository.deleteOne({ id });
//     if (result.deletedCount === 0) {
//       throw new NotFoundException(`Booking with ID ${id} not found.`);
//     }
//   }
// }
