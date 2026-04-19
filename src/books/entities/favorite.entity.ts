import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CreateDateColumn } from "typeorm";
import { UserEntity } from "src/auth/entities/user.entity";
import { BookEntity } from "./book.entity";
@Entity()
export class Favorite {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, user => user.favorites)
  user: UserEntity;

  @ManyToOne(() => BookEntity, book => book.favorites)
  book: BookEntity;

  @CreateDateColumn()
  createdAt: Date;
}