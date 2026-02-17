import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Relation,
} from "typeorm";
import { Booking } from "./Booking";

@Entity("facilities")
export class Facility {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "varchar", length: 255 })
  location!: string;

  @Column({ type: "int" })
  capacity!: number;

  @OneToMany(() => Booking, (booking) => booking.facility)
  bookings!: Relation<Booking[]>;
}
