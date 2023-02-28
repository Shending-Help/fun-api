import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import fetch from 'node-fetch';

type Address = {
  city: string;
  state: string;
  country: string;
};

@Injectable()
export class UsersService {
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const address = await this.generateAddress(createUserDto);
      const user = new User();
      user.name = createUserDto.name;
      user.email = createUserDto.email;
      user.password = createUserDto.password;
      user.city = address.city;
      user.state = address.state;

      if (address.country == 'United States') {
        await user.save();
        delete user.password;
        return user;
      } else {
        throw new BadRequestException("User's address must be within the US");
      }
    } catch (error) {
      throw new HttpException(
        {
          status: error.status,
          error: error.message,
        },
        error.status,
        { cause: error },
      );
    }
  }

  //function to generate the address from the lat and long coordinates using geocoding api
  async generateAddress(createUserDto: CreateUserDto): Promise<Address> {
    const lat = createUserDto.latitude;
    const long = createUserDto.longitude;

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('Google Maps API key is missing');
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK') {
        throw new InternalServerErrorException('Failed to retrieve address');
      }

      const { address_components } = data.results[0];
      const city =
        this.findAddressComponent(address_components, 'locality') ||
        this.findAddressComponent(address_components, 'sublocality_level_1') ||
        this.findAddressComponent(address_components, 'sublocality') ||
        this.findAddressComponent(
          address_components,
          'administrative_area_level_3',
        );
      const state = this.findAddressComponent(
        address_components,
        'administrative_area_level_1',
      );
      const country = this.findAddressComponent(address_components, 'country');

      if (!city || !state || !country) {
        throw new InternalServerErrorException(
          'Incomplete address data returned from Google Maps API',
        );
      }

      const address: Address = {
        city,
        state,
        country,
      };

      return address;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to generate address: ${error.message}`,
      );
    }
  }

  //function to find a user by id
  async findOne(id: number): Promise<User> {
    try {
      const user = await User.findOneBy({ id: id });
      delete user.password;
      return user;
    } catch (error) {
      throw new InternalServerErrorException('Failed to find user');
    }
  }

  //function to find a user by email
  async findOneByEmail(email: string): Promise<User> {
    try {
      return await User.findOneBy({ email: email });
    } catch (error) {
      throw new InternalServerErrorException('Failed to find user');
    }
  }

  private findAddressComponent(
    components: any[],
    type: string,
  ): string | undefined {
    const component = components.find((c) => c.types.includes(type));
    return component ? component.long_name : undefined;
  }
}
