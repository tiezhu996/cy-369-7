import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from "@nestjs/common";
import { MemberService, CreateMemberDto, UpdateMemberDto } from "./member.service";
import { MemberLevel } from "./member.constants";

@Controller()
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get("members")
  async getMembers() {
    return this.memberService.findAll();
  }

  @Get("api/members")
  async apiGetMembers() {
    return this.memberService.findAll();
  }

  @Get("members/:id")
  async getMember(@Param("id") id: string) {
    return this.memberService.findOne(Number(id));
  }

  @Get("api/members/:id")
  async apiGetMember(@Param("id") id: string) {
    return this.memberService.findOne(Number(id));
  }

  @Get("members/lookup/phone")
  async getMemberByPhone(@Query("phone") phone: string) {
    return this.memberService.findByPhone(phone);
  }

  @Get("api/members/lookup/phone")
  async apiGetMemberByPhone(@Query("phone") phone: string) {
    return this.memberService.findByPhone(phone);
  }

  @Get("members/levels/config")
  async getMemberLevelConfig() {
    return this.memberService.getMemberLevelConfig();
  }

  @Get("api/members/levels/config")
  async apiGetMemberLevelConfig() {
    return this.memberService.getMemberLevelConfig();
  }

  @Post("members")
  async createMember(
    @Body()
    body: {
      name: string;
      phone: string;
      level?: MemberLevel;
      stayCount?: number;
    },
  ) {
    const dto: CreateMemberDto = {
      name: body.name,
      phone: body.phone,
      level: body.level,
      stayCount: body.stayCount,
    };
    return this.memberService.create(dto);
  }

  @Post("api/members")
  async apiCreateMember(
    @Body()
    body: {
      name: string;
      phone: string;
      level?: MemberLevel;
      stayCount?: number;
    },
  ) {
    const dto: CreateMemberDto = {
      name: body.name,
      phone: body.phone,
      level: body.level,
      stayCount: body.stayCount,
    };
    return this.memberService.create(dto);
  }

  @Put("members/:id")
  async updateMember(
    @Param("id") id: string,
    @Body()
    body: {
      name?: string;
      phone?: string;
      level?: MemberLevel;
      stayCount?: number;
    },
  ) {
    const dto: UpdateMemberDto = {
      name: body.name,
      phone: body.phone,
      level: body.level,
      stayCount: body.stayCount,
    };
    return this.memberService.update(Number(id), dto);
  }

  @Put("api/members/:id")
  async apiUpdateMember(
    @Param("id") id: string,
    @Body()
    body: {
      name?: string;
      phone?: string;
      level?: MemberLevel;
      stayCount?: number;
    },
  ) {
    const dto: UpdateMemberDto = {
      name: body.name,
      phone: body.phone,
      level: body.level,
      stayCount: body.stayCount,
    };
    return this.memberService.update(Number(id), dto);
  }

  @Delete("members/:id")
  async deleteMember(@Param("id") id: string) {
    await this.memberService.remove(Number(id));
    return { success: true };
  }

  @Delete("api/members/:id")
  async apiDeleteMember(@Param("id") id: string) {
    await this.memberService.remove(Number(id));
    return { success: true };
  }
}
