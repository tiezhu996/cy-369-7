import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Member } from "./member.entity";
import {
  MemberLevel,
  MEMBER_LEVEL_CONFIG,
  calculateLevelByStayCount,
} from "./member.constants";

export interface CreateMemberDto {
  name: string;
  phone: string;
  level?: MemberLevel;
  stayCount?: number;
}

export interface UpdateMemberDto {
  name?: string;
  phone?: string;
  level?: MemberLevel;
  stayCount?: number;
}

export interface MemberResponse {
  id: number;
  name: string;
  phone: string;
  level: MemberLevel;
  levelLabel: string;
  stayCount: number;
  discountRate: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
  ) {}

  async findAll(): Promise<MemberResponse[]> {
    const members = await this.memberRepository.find({
      order: { updatedAt: "DESC" },
    });
    return members.map((member) => this.toResponse(member));
  }

  async findOne(id: number): Promise<MemberResponse> {
    const member = await this.memberRepository.findOneBy({ id });
    if (!member) {
      throw new NotFoundException(`会员ID ${id} 不存在`);
    }
    return this.toResponse(member);
  }

  async findByPhone(phone: string): Promise<MemberResponse | null> {
    const member = await this.memberRepository.findOneBy({ phone });
    return member ? this.toResponse(member) : null;
  }

  async create(dto: CreateMemberDto): Promise<MemberResponse> {
    const existing = await this.memberRepository.findOneBy({ phone: dto.phone });
    if (existing) {
      throw new ConflictException(`手机号 ${dto.phone} 已存在`);
    }

    const stayCount = dto.stayCount ?? 0;
    const level = dto.level ?? calculateLevelByStayCount(stayCount);
    const discountRate = MEMBER_LEVEL_CONFIG[level].discountRate;

    const member = this.memberRepository.create({
      name: dto.name,
      phone: dto.phone,
      level,
      stayCount,
      discountRate,
    });

    const saved = await this.memberRepository.save(member);
    return this.toResponse(saved);
  }

  async update(id: number, dto: UpdateMemberDto): Promise<MemberResponse> {
    const member = await this.memberRepository.findOneBy({ id });
    if (!member) {
      throw new NotFoundException(`会员ID ${id} 不存在`);
    }

    if (dto.phone && dto.phone !== member.phone) {
      const existing = await this.memberRepository.findOneBy({ phone: dto.phone });
      if (existing) {
        throw new ConflictException(`手机号 ${dto.phone} 已存在`);
      }
    }

    const stayCount = dto.stayCount ?? member.stayCount;
    const level = dto.level ?? calculateLevelByStayCount(stayCount);
    const discountRate = MEMBER_LEVEL_CONFIG[level].discountRate;

    Object.assign(member, {
      name: dto.name ?? member.name,
      phone: dto.phone ?? member.phone,
      level,
      stayCount,
      discountRate,
    });

    const saved = await this.memberRepository.save(member);
    return this.toResponse(saved);
  }

  async incrementStayCount(phone: string): Promise<MemberResponse | null> {
    const member = await this.memberRepository.findOneBy({ phone });
    if (!member) {
      return null;
    }

    member.stayCount += 1;
    const newLevel = calculateLevelByStayCount(member.stayCount);
    if (newLevel !== member.level) {
      member.level = newLevel;
      member.discountRate = MEMBER_LEVEL_CONFIG[newLevel].discountRate;
    }

    const saved = await this.memberRepository.save(member);
    return this.toResponse(saved);
  }

  async remove(id: number): Promise<void> {
    const result = await this.memberRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`会员ID ${id} 不存在`);
    }
  }

  async getMemberLevelConfig() {
    return Object.entries(MEMBER_LEVEL_CONFIG).map(([key, value]) => ({
      level: key as MemberLevel,
      label: value.label,
      discountRate: value.discountRate,
      minStayCount: value.minStayCount,
      color: value.color,
    }));
  }

  private toResponse(member: Member): MemberResponse {
    return {
      id: member.id,
      name: member.name,
      phone: member.phone,
      level: member.level,
      levelLabel: MEMBER_LEVEL_CONFIG[member.level].label,
      stayCount: member.stayCount,
      discountRate: Number(member.discountRate),
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    };
  }
}
