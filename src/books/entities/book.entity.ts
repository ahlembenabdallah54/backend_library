import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { TimeStampISIDS } from "../shared/timestamp";
import { AuthorEntity } from "./author.entity";
import { UserEntity } from "src/auth/entities/user.entity";
import { Favorite } from "./favorite.entity";


@Entity('livre')
export class BookEntity extends TimeStampISIDS {
   
    @PrimaryGeneratedColumn()
    id;
    
    @Column(
        {
            //name : 'titre'
            //type : "varchar"
            length : 50,
            //unique : true
            //update : false
        }
    )
    title : string;
    
    @Column()
    year : number;
    
    @Column(
        {
            type: "varchar"
        }
    )
    editor;// : string;
    
    @Column()
    image : string;
    
    @ManyToOne(type => AuthorEntity, author => author.id,   {
               // eager : true
            })
    author ;
    
    @ManyToOne(type => UserEntity, user => user.id)
    user;
    
   @OneToMany(() => Favorite, fav => fav.book)
    favorites: Favorite[];
    
}
