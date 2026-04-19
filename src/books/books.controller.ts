import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,UploadedFile, UseInterceptors
} from '@nestjs/common';
import { BooksService } from './books.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth/jwt-auth.guard';
import { request } from 'express';
import { IsAdminGuard } from 'src/guards/is-admin/is-admin.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';


@Controller('books')
//@UseGuards(JwtAuthGuard)
export class BooksController {
  @Inject(BooksService) bookSer: BooksService;

  @Get('/all')
  async chercherTousLesLivres(@Req() req: Request) {
    //console.log(req);
    try {
      let data = await this.bookSer.getAllBooks();
      return data;
    } catch (err) {
      console.log(err);
    }
  }
  //@UseGuards(JwtAuthGuard, IsAdminGuard)
  //@UseGuards(IsAdminGuard)
  /*@Post('/new')
  async ajouterLivre(@Req() req: Request, @Body() body) {
    console.log('USER',req["user"]);
    let data = await this.bookSer.addBook(body, req["user"]["userId"]);
    return { data };
  }*/
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @Post('/new')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueName =
            Date.now() + '-' + Math.round(Math.random() * 1e9);

          cb(null, uniqueName + extname(file.originalname));
        },
      }),
    }),
  )
  async ajouterLivre(
    @Req() req: Request,
    @Body() body,
    @UploadedFile() file: any,
  ) {
    console.log('USER:', req["user"]);

    const image = file ? file.filename : null;

    const userId = req["user"]?.userId || null;

    const data = await this.bookSer.addBook(
      {
        ...body,
        image,
      },
      userId,
    );

    return { data };
  }


  @UseGuards(JwtAuthGuard)
  @Get('/search/:id')
  async chercherBook(@Param('id', ParseIntPipe) id, @Req() request) {
    console.log("ROLE", request.user.userRole);
    
    return this.bookSer.getBookById(id);
  }

  @Put('/edit/:id')
  async modifierBook(@Body() body, @Param('id', ParseIntPipe) id) {
    let response = await this.bookSer.updateBook(id, body);
    return response;
  }

  @Delete('remove/:id')
  async removeBook(@Param('id', ParseIntPipe) id) {
    let response = await this.bookSer.removeBook(id);
    return response;
  }

  @Delete('delete/:id')
  async deleteBook(@Param('id', ParseIntPipe) id) {
    let response = await this.bookSer.deleteBook(id);
    return response;
  }
  @Delete('softdelete/:id')
  async softDeleteBook(@Param('id', ParseIntPipe) id) {
    let response = await this.bookSer.softDeleteBook(id);
    return response;
  }
  
  @Patch('restore/:id')
  async restoreBook(@Param('id', ParseIntPipe) id) {
    let response = await this.bookSer.restoreBook(id);
    return response;
  }
  @Patch('recover/:id')
  async recoverBook(@Param('id', ParseIntPipe) id) {
    let response = await this.bookSer.recoverBook(id);
    return response;
  }
  
  @Get('stats')
  async nbreLivresParAnnee() {
    let response = await this.bookSer.nbBooksPerYear();
    return response;
  }
  @Get('stats/v2')
  async nbreLivresParAnneeV2(@Query('year1') year1, @Query('year2') year2) {
    let response = await this.bookSer.nbBooksPerYearV2(year1, year2);
    return response;
  }
  //add book to favorites
   @UseGuards(JwtAuthGuard)
  @Post('favorites/:bookId')
  addFavorite(
    @Param('bookId', ParseIntPipe) bookId: number,
    @Req() req
  ) {
    const userId = req['user'].userId; 
    console.log(userId);
    return this.bookSer.addFavorite(userId, bookId);
  }

  //delete book from favorites
   @UseGuards(JwtAuthGuard)
  @Delete('favorites/:bookId')
  removeFavorite(
    @Param('bookId', ParseIntPipe) bookId: number,
    @Req() req
  ) {
    const userId = req['user'].userId; 
    return this.bookSer.removeFavorite(userId, bookId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('favorites/:bookId')
  isFavorite(
    @Param('bookId', ParseIntPipe) bookId: number,
    @Req() req
  ) {
    const userId = req['user'].userId; 
    return this.bookSer.isFavorite(userId, bookId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('favorites')
  getUserFavorites(@Req() req) {
    const userId = req['user'].userId;
    return this.bookSer.getUserFavorites(userId);
  }
}
