import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { MemberLevel } from "./member.constants";

@Entity("members")
export class Member {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 80 })
  name!: string;

  @Column({ type: "varchar", length: 20, unique: true })
  phone!: string;

  @Column({
    type: "varchar",
    length: 20,
    default: MemberLevel.NORMAL,
  })
  level!: MemberLevel;

  @Column({ type: "int", default: 0 })
  stayCount!: number;

  @Column({ type: "decimal", precision: 3, scale: 2, default: 1.0 })
  discountRate!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
