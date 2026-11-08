import { BeforeInsert, CreateDateColumn, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { newObjectId } from '../utils/object-id.js';

/** Mọi bảng đều có _id dạng chuỗi 24 ký tự + createdAt/updatedAt (tương đương timestamps của Mongoose). */
export abstract class BaseEntity {
  @PrimaryColumn({ type: 'char', length: 24 })
  _id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  assignId() {
    if (!this._id) this._id = newObjectId();
  }
}
