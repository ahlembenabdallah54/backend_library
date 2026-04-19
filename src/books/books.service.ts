import { Favorite } from './entities/favorite.entity';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BookEntity } from './entities/book.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(BookEntity) private bookRepo: Repository<BookEntity>,
    @InjectRepository(Favorite) private favoriteRepo: Repository<Favorite>,
  ) {}

  async getAllBooks() {
    try {
      let tab = await this.bookRepo.find();
      return {
        listeBooks: tab.map(book => ({
          ...book,
          image: book.image
            ? `http://localhost:3000/${book.image}`
            : null,
        })),
      };
    } catch (err) {
      return { message: 'Problème avec TypeOrm' };
    }

    // this.bookRepo.find().then(res => {
    //     console.log(res);

    // }).catch(err => {
    //     console.log(err);
    // })
  }

  addBook(newBook, idUser) {
    newBook.user = idUser;
    return this.bookRepo.save(newBook);
  }

  async getBookById(selectedId) {
    try {
      let selectedBooks = await this.bookRepo.find({
        where: {
          id: selectedId,
        },
        relations : {
            author : true
        },
        select : {
            author : {
                prenom : true,
                nom : true
            }
        }
      });
      if (!selectedBooks.length) throw new NotFoundException();
      else return selectedBooks;
    } catch (err) {
      return err;
    }
  }

  async updateBook(selectedId, uBook) {
    let b = await this.bookRepo.preload({
      id: selectedId,
      //   title: uBook.title,
      //   editor: uBook.editor,
      //   year: uBook.year,
      //   image: uBook.image,
      ...uBook,
    });
    console.log('PRELOAD RESULT:', b);
    if (!b) {
      throw new NotFoundException('Book not found');
    }
    let response = await this.bookRepo.save(b);
    return { message: 'Livre mise à jour', response };
  }

  async deleteBook(id) {
    let response = await this.bookRepo.delete(id);
    return response;
  }

  async removeBook(selectedId) {
    let selectedBook = await this.bookRepo.findOneBy({
      id: selectedId,
    });
    let response = await this.bookRepo.remove(selectedBook);
    return {
        message: `Le livre ${response.title} a été supprimé avec succès`,
    };
}

async softDeleteBook(id) {
    let reponse = await this.bookRepo.softDelete(id)
    return reponse;
}

async restoreBook(id) {
    let reponse = await this.bookRepo.restore(id);
    return reponse;
}

 async recoverBook(selectedId) {
    let selectedBook = await this.bookRepo.findOneBy({
      id: selectedId,
      
    });
    let response = await this.bookRepo.recover(selectedBook);
    return {
        message: `Le livre ${response.title} a été restauré avec succès`,
    };
}

async softRemoveBook(selectedId) {
      let selectedBook = await this.bookRepo.findOneBy({
        id: selectedId,
      });
    let reponse = await this.bookRepo.softRemove(selectedBook)
    return reponse;
  }
  
  async nbBooksPerYear() {
    let qb = this.bookRepo.createQueryBuilder('book');
    return qb.select('book.year, count(book.id) as NbBooks')
    .groupBy('book.year')
    .getRawMany()
  }
  
  async nbBooksPerYearV2(y1, y2) {
    let qb = this.bookRepo.createQueryBuilder('book');
    return qb.select('book.year, count(book.id) as NbBooks')
    .where('book.year >= :yearMin and book.year <= :yearMax', {yearMin : y1, yearMax : y2})
    //.setParameters({yearMin : y1, yearMax : y2})
    .groupBy('book.year')
    .getRawMany()
  }
    
    //add book to favorites
    async addFavorite(userId: number, bookId: number) {
      const existing = await this.favoriteRepo.findOne({
        where: {
          user: { id: userId },
          book: { id: bookId }
        }
      });

      if (existing) {
        throw new BadRequestException('Already in favorites');
      }

      const favorite = this.favoriteRepo.create({
        user: { id: userId },
        book: { id: bookId }
      });

      return await this.favoriteRepo.save(favorite);
}

//remove book from favorites
    async removeFavorite(userId: number, bookId: number) {
      const Favorite = await this.favoriteRepo.findOne({
        where: {
          user: { id: userId },
          book: { id: bookId }
        }
      });
      if (!Favorite) {
        throw new NotFoundException('Not in favorites');
      }
      await this.favoriteRepo.remove(Favorite);
      return { message: 'Removed from favorites' };
    } 

    //check if books is in favorites
    async isFavorite(userId: number, bookId: number) {
      const Favorite = await this.favoriteRepo.findOne({
        where: {
          user: { id: userId },
          book: { id: bookId }
        }
      });
      return { isFavorite: !!Favorite };
    }
    
    //get user's favorite books
    async getUserFavorites(userId: number) {
      const favorites = await this.favoriteRepo.find({
        where: {
          user: { id: userId },
        },
        relations: {
          book: true,
        },
      });

      return favorites.map(f => f.book);
    }
    
    
  
}
