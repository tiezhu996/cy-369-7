import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Reservation } from "./reservation.entity";
import { MemberService } from "../member/member.service";
import { MEMBER_LEVEL_CONFIG } from "../member/member.constants";

export interface CreateReservationDto {
  guestName: string;
  guestPhone: string;
  checkinDate: string;
  checkoutDate: string;
  siteType: string;
  originalPrice: number;
}

export interface ReservationResponse {
  id: number;
  memberId: number | null;
  guestName: string;
  guestPhone: string;
  checkinDate: string;
  checkoutDate: string;
  siteType: string;
  originalPrice: number;
  discountRate: number;
  finalPrice: number;
  memberLevel: string | null;
  memberLevelLabel: string | null;
  status: string;
  isNewMember: boolean;
  createdAt: Date;
}

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    private memberService: MemberService,
  ) {}

  async findAll(): Promise<ReservationResponse[]> {
    const reservations = await this.reservationRepository.find({
      order: { createdAt: "DESC" },
      relations: ["member"],
    });
    return reservations.map((r) => this.toResponse(r, false));
  }

  async create(dto: CreateReservationDto): Promise<ReservationResponse> {
    const { guestPhone, guestName, originalPrice } = dto;

    let member = await this.memberService.findByPhone(guestPhone);
    let isNewMember = false;
    let memberId: number | null = null;
    let memberLevel: string | null = null;
    let discountRate = 1.0;

    if (member) {
      memberId = member.id;
      memberLevel = member.level;
      discountRate = member.discountRate;

      await this.memberService.incrementStayCount(guestPhone);
      const updatedMember = await this.memberService.findByPhone(guestPhone);
      if (updatedMember) {
        memberLevel = updatedMember.level;
        discountRate = updatedMember.discountRate;
      }
    } else {
      isNewMember = true;
      const newMember = await this.memberService.create({
        name: guestName,
        phone: guestPhone,
        stayCount: 1,
      });
      memberId = newMember.id;
      memberLevel = newMember.level;
      discountRate = newMember.discountRate;
    }

    const finalPrice = Number((originalPrice * discountRate).toFixed(2));

    const reservation = this.reservationRepository.create({
      memberId,
      guestName: dto.guestName,
      guestPhone: dto.guestPhone,
      checkinDate: new Date(dto.checkinDate),
      checkoutDate: new Date(dto.checkoutDate),
      siteType: dto.siteType,
      originalPrice: dto.originalPrice,
      discountRate,
      finalPrice,
      memberLevel,
      status: "CONFIRMED",
    });

    const saved = await this.reservationRepository.save(reservation);
    return this.toResponse(saved, isNewMember);
  }

  async lookupByPhone(phone: string): Promise<{
    exists: boolean;
    member: {
      id: number;
      name: string;
      phone: string;
      level: string;
      levelLabel: string;
      stayCount: number;
      discountRate: number;
      nextLevel: string | null;
      staysToNextLevel: number | null;
    } | null;
  }> {
    const member = await this.memberService.findByPhone(phone);

    if (!member) {
      return { exists: false, member: null };
    }

    const currentLevel = member.level;
    const levels = ["NORMAL", "SILVER", "GOLD"];
    const currentIndex = levels.indexOf(currentLevel);
    const nextLevel = currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
    const nextLevelConfig = nextLevel ? MEMBER_LEVEL_CONFIG[nextLevel as keyof typeof MEMBER_LEVEL_CONFIG] : null;
    const staysToNextLevel = nextLevelConfig ? Math.max(0, nextLevelConfig.minStayCount - member.stayCount) : null;

    return {
      exists: true,
      member: {
        id: member.id,
        name: member.name,
        phone: member.phone,
        level: member.level,
        levelLabel: member.levelLabel,
        stayCount: member.stayCount,
        discountRate: member.discountRate,
        nextLevel: nextLevel ? MEMBER_LEVEL_CONFIG[nextLevel as keyof typeof MEMBER_LEVEL_CONFIG].label : null,
        staysToNextLevel,
      },
    };
  }

  private toResponse(
    reservation: Reservation,
    isNewMember: boolean,
  ): ReservationResponse {
    return {
      id: reservation.id,
      memberId: reservation.memberId,
      guestName: reservation.guestName,
      guestPhone: reservation.guestPhone,
      checkinDate: reservation.checkinDate.toISOString().split("T")[0],
      checkoutDate: reservation.checkoutDate.toISOString().split("T")[0],
      siteType: reservation.siteType,
      originalPrice: Number(reservation.originalPrice),
      discountRate: Number(reservation.discountRate),
      finalPrice: Number(reservation.finalPrice),
      memberLevel: reservation.memberLevel,
      memberLevelLabel: reservation.memberLevel
        ? MEMBER_LEVEL_CONFIG[reservation.memberLevel as keyof typeof MEMBER_LEVEL_CONFIG].label
        : null,
      status: reservation.status,
      isNewMember,
      createdAt: reservation.createdAt,
    };
  }
}
