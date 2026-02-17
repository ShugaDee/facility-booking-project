import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Relation,
} from "typeorm";
import { User } from "./User";
import { Facility } from "./Facility";

@Entity("bookings")
export class Booking {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int" })
  facility_id!: number;

  @Column({ type: "int" })
  user_id!: number;

  @Column({ type: "date" })
  date!: string;

  @Column({ type: "time" })
  start_time!: string;

  @Column({ type: "time" })
  end_time!: string;

  @Column({ type: "varchar", length: 20, default: "pending" })
  status!: "pending" | "confirmed" | "cancelled";

  @ManyToOne(() => User, (user) => user.bookings)
  @JoinColumn({ name: "user_id" })
  user!: Relation<User>;

  @ManyToOne(() => Facility, (facility) => facility.bookings)
  @JoinColumn({ name: "facility_id" })
  facility!: Relation<Facility>;
}
