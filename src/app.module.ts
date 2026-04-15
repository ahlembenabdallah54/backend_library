import {
  Module,
  RequestMethod,
  type MiddlewareConsumer,
  type NestModule,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';
import { BooksModule } from './books/books.module';
import { FirstMiddleware } from './middlewares/first/first.middleware';
import { SecondMiddleware } from './middlewares/second/second.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';

@Module({
  imports: [
    //  IMPORTANT : toujours en premier
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TasksModule,
    BooksModule,
    AuthModule,

    //  CONFIG DATABASE PROPRE
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/',
      serveStaticOptions: {
        index: false,
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SecondMiddleware).forRoutes('');

    consumer.apply(FirstMiddleware).forRoutes({
      path: 'tasks/*',
      method: RequestMethod.GET,
    });
  }

  constructor(private configSer: ConfigService) {}
}