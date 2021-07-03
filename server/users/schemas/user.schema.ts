import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaTypes } from 'mongoose';
import { City } from './city.schema';

export type UserDocument = User & Document

@Schema()
export class User {
  @Prop({ required: true })
  firstname: string

  @Prop({ required: true })
  lastname: string

  @Prop({ required: true, unique: true })
  email: string

  @Prop({ required: true })
  password: string

  @Prop({ type: [SchemaTypes.Types.ObjectId], ref: 'City' })
  cities: [City]
}

export const UserSchema = SchemaFactory.createForClass(User)