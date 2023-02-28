import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

type Address = {
  city: string;
  state: string;
  country: string;
};

@Injectable()
export class UsersService {
  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = User.create(createUserDto);
    const address = await this.generateAddress(createUserDto);
    user.city = address.city;
    user.state = address.state;

    if (address.country == 'United States') {
      return await user.save();
    }
  }

  //function to generate the address from the lat and long coordinates using geocoding api
  async generateAddress(createUserDto: CreateUserDto): Promise<Address> {
    const lat = createUserDto.latitude;
    const long = createUserDto.longitude;

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    const fullAddress = data.plus_code.compound_code;
    const city = fullAddress.split(',')[0];
    const state = fullAddress.split(',')[1];
    const country = fullAddress.split(',')[2];

    const address: Address = {
      city,
      state,
      country,
    };

    return address;
  }
}
