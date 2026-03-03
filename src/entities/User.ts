import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Relation,
} from "typeorm";
import { Booking } from "./Booking";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email!: string;

  @Column({ type: "varchar", length: 20 })
  role!: "user" | "admin" | "blocked";

  @OneToMany(() => Booking, (booking) => booking.user)
  bookings!: Relation<Booking[]>;
}
