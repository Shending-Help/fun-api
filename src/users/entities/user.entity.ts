import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  BeforeInsert,
} from 'typeorm';

import * as bcrypt from 'bcryptjs';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class User extends BaseEntity {
  @ApiProperty({ type: Number, description: 'ID of the user' })
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @ApiProperty({ type: String, description: 'Name of the user' })
  name: string;

  @Column({ unique: true })
  @ApiProperty({ type: String, description: 'Email of the user' })
  email: string;

  @Column()
  password: string;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  async comparePassword(attempt: string): Promise<boolean> {
    return await bcrypt.compare(attempt, this.password);
  }

  @Column()
  @ApiProperty({ type: String, description: 'City of the user' })
  city: string;

  @Column()
  @ApiProperty({ type: String, description: 'State of the user' })
  state: string;
}
