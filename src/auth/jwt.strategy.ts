import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
    private configSer : ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configSer.get<string>('JWT_SECRET')
    });
  }

  async validate(payload: any) {
    const u = await this.userRepo.findOne({
      where: { id: payload.sub }, 
    });
    if (!u) {
      throw new UnauthorizedException();
    }

    return {
      userId: u.id,
      userRole: u.role,
    };
}
}
