import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';

import { UsersService } from '../services/users.service';

import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard';

import { CitiesDto } from '../dto/cities.dto';
import { CityDto } from '../dto/city.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { SendUserDto } from '../dto/send-user.dto';

@Controller('users')
export class UsersController {

  constructor(private usersService: UsersService) { }

  @UseGuards(JwtAuthGuard)
  @Get(':uid')
  async getUserByUid(@Param('uid') uid: string): Promise<SendUserDto> {
    return await this.usersService.getUserByUid(uid);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':uid/cities')
  async getStoredCities(@Param('uid') uid: string): Promise<CitiesDto> {
    return await this.usersService.getCities(uid);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':uid/cities')
  async storeNewCity(@Param('uid') uid: string, @Body() reqBody: CityDto): Promise<any> {
    return await this.usersService.addCity(uid, reqBody);
  }

  @Post('signup')
  async registr(@Body() registrData: CreateUserDto): Promise<SendUserDto> {
    return await this.usersService.registr(registrData);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':uid/cities/:city')
  async removeStoredCities(@Param('uid') uid: string, @Param('city') city: string): Promise<any> {
    return await this.usersService.removeCity(uid, city);
  }

}
