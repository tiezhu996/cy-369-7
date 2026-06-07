import { Controller, Get, Post, Body, Query } from "@nestjs/common";
import { ReservationService, CreateReservationDto } from "./reservation.service";

@Controller()
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Get("reservations")
  async getReservations() {
    return this.reservationService.findAll();
  }

  @Get("api/reservations")
  async apiGetReservations() {
    return this.reservationService.findAll();
  }

  @Get("reservations/lookup")
  async lookupMember(@Query("phone") phone: string) {
    return this.reservationService.lookupByPhone(phone);
  }

  @Get("api/reservations/lookup")
  async apiLookupMember(@Query("phone") phone: string) {
    return this.reservationService.lookupByPhone(phone);
  }

  @Post("reservations")
  async createReservation(
    @Body()
    body: {
      guestName: string;
      guestPhone: string;
      checkinDate: string;
      checkoutDate: string;
      siteType: string;
      originalPrice: number;
    },
  ) {
    const dto: CreateReservationDto = {
      guestName: body.guestName,
      guestPhone: body.guestPhone,
      checkinDate: body.checkinDate,
      checkoutDate: body.checkoutDate,
      siteType: body.siteType,
      originalPrice: body.originalPrice,
    };
    return this.reservationService.create(dto);
  }

  @Post("api/reservations")
  async apiCreateReservation(
    @Body()
    body: {
      guestName: string;
      guestPhone: string;
      checkinDate: string;
      checkoutDate: string;
      siteType: string;
      originalPrice: number;
    },
  ) {
    const dto: CreateReservationDto = {
      guestName: body.guestName,
      guestPhone: body.guestPhone,
      checkinDate: body.checkinDate,
      checkoutDate: body.checkoutDate,
      siteType: body.siteType,
      originalPrice: body.originalPrice,
    };
    return this.reservationService.create(dto);
  }
}
