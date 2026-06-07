import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { OverviewController } from "./overview/overview.controller";
import { OverviewService } from "./overview/overview.service";
import { MemberController } from "./member/member.controller";
import { MemberService } from "./member/member.service";
import { Member } from "./member/member.entity";
import { ReservationController } from "./reservation/reservation.controller";
import { ReservationService } from "./reservation/reservation.service";
import { Reservation } from "./reservation/reservation.entity";
import { AppLogger } from "./common/app.logger";
import { envConfig } from "./config/env.config";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: "mysql",
      url: envConfig.databaseUrl,
      entities: [Member, Reservation],
      synchronize: false,
      logging: false,
      extra: {
        connectionLimit: 10,
      },
    }),
    TypeOrmModule.forFeature([Member, Reservation]),
  ],
  controllers: [
    OverviewController,
    MemberController,
    ReservationController,
  ],
  providers: [
    OverviewService,
    MemberService,
    ReservationService,
    AppLogger,
  ],
})
export class AppModule {}
