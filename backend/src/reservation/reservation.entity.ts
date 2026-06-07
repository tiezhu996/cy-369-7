import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Member } from "../member/member.entity";

@Entity("reservations")
export class Reservation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int", nullable: true })
  memberId!: number | null;

  @ManyToOne(() => Member, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "memberId" })
  member!: Member | null;

  @Column({ type: "varchar", length: 80 })
  guestName!: string;

  @Column({ type: "varchar", length: 20 })
  guestPhone!: string;

  @Column({ type: "date" })
  checkinDate!: Date;

  @Column({ type: "date" })
  checkoutDate!: Date;

  @Column({ type: "varchar", length: 40 })
  siteType!: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  originalPrice!: number;

  @Column({ type: "decimal", precision: 3, scale: 2, default: 1.0 })
  discountRate!: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  finalPrice!: number;

  @Column({ type: "varchar", length: 20, nullable: true })
  memberLevel!: string | null;

  @Column({ type: "varchar", length: 20, default: "CONFIRMED" })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
