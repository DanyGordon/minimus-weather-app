import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaTypes } from 'mongoose';
import { User } from './user.schema';

export type CityDocument = City & Document

@Schema()
export class City {
  @Prop({ required: true, unique: true })
  city: string

  @Prop({ required: true, type: SchemaTypes.Types.ObjectId, ref: 'User' })
  user: User
}

export const CitySchema = SchemaFactory.createForClass(City)