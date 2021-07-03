import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import { EncryptionService } from '../../encryption/encryption.service';

import { User, UserDocument } from '../schemas/user.schema';
import { City, CityDocument } from '../schemas/city.schema';

import { CreateUserDto } from '../dto/create-user.dto';
import { SendUserDto } from '../dto/send-user.dto';
import { CitiesDto } from '../dto/cities.dto';

@Injectable()
export class UsersService {

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(City.name) private cityModel: Model<CityDocument>,
    private readonly encryptionService: EncryptionService
  ) { }

  async getUserByUid(id: string): Promise<SendUserDto> {
    try {
      const user = await this.userModel.findById(id);
      if (user) {
        return { firstname: user.firstname, lastname: user.lastname, email: user.email, id: user._id };
      } else {
        throw NotFoundException;
      }
    } catch(e) {
      console.log(e);
    }
  }

  async findUserByEmail(email: string): Promise<CreateUserDto> {
    try {
      const user = await this.userModel.findOne({ email });
      if (user) {
        return { firstname: user.firstname, lastname: user.lastname, email: user.email, password: user.password, id: user._id };
      } else {
        return null;
      }
    } catch(e) {
      console.log(e);
      return null;
    }
  }

  async registr({ firstname, lastname, email, password }): Promise<SendUserDto> {
    try {
      const user = await (await this.userModel.create({ firstname, lastname, email, password: await this.encryptionService.hash(password), cities: [] })).populate('City');
      if(user) {
        return { firstname: user.firstname, lastname: user.lastname, email: user.email, id: user._id };
      }
    } catch (e) {
      console.log(e);
    }
  }

  async getCities(id: string): Promise<CitiesDto> {
    try {
      const user = await this.userModel.findById(id).populate('cities');
      if(user) {
        return { cities: user.cities };
      } else {
        throw NotFoundException;
      }
    } catch(e) {
      console.log(e);
    }
  }

  async addCity(id: string, { city }): Promise<any> {
    try {
      const user = await this.userModel.findById(id).populate('cities');
      if(user && user.cities) {
        const storedCity = await this.cityModel.create({ city, user: user._id });
			  user.cities.push(storedCity);
			  await user.save();
      } else {
        throw NotFoundException;
      }
    } catch (e) {
      console.log(e);
    }
  }

  async removeCity(id: string, city: string): Promise<any> {
    try {
      const user = await this.userModel.findById(id).populate('cities');
      if(user && user.cities.some(c => c.city === city)) {
        await this.cityModel.findOneAndRemove({ city, user: user._id });
      } else {
        throw NotFoundException;
      }
    } catch (e) {
      console.log(e);
    }
  }

}