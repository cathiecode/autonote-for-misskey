import { todo } from "@/utils";
import { ObjectId } from "mongodb";
import { Mongoose, Schema } from "mongoose";
import {
  Column,
  DataSource,
  Entity,
  ObjectIdColumn,
} from "typeorm";

export interface ISessionRepository {
  insert(userId: string): Promise<string>;
  findOneById(id: string): Promise<ISession | undefined>;
  remove(id: string): Promise<void>;
}

interface ISession {
  id: string;
  userId: string;
}

@Entity()
export class SessionEntity {
  private constructor() {}

  static create(userId: string) {
    const instance = new SessionEntity();

    instance.userId = userId;

    return instance;
  }

  @ObjectIdColumn()
  id!: ObjectId;

  @Column()
  userId!: string;

  toObject() {
    return {
      ...this,
      id: this.id.toHexString(),
    };
  }
}

const schema = new Schema({
  userId: {type: Schema.Types.ObjectId, required: true},
}, {
  methods: {
    toObject(): ISession {
      return {
        ...this,
        id: this._id.toHexString(),
        userId: this.userId.toHexString()
      };
    }
  }
});

export class MongooseSessionRepository implements ISessionRepository {
  private Session = this.connection.model("Session", schema);
  constructor(private connection: Mongoose) {}

  async insert(userId: string): Promise<string> {
    const entity = new this.Session();
    entity.$set({userId});
    const savedEntity = await entity.save();
    return savedEntity._id.toHexString();
  }
  async findOneById(id: string): Promise<ISession | undefined> {
    const entity = await this.Session.findById(id);
    return entity?.toObject();
  }

  async remove(id: string): Promise<void> {
    await this.Session.deleteOne({id});
  }
}

export class TormSessionRepository implements ISessionRepository {
  constructor(private dataSource: DataSource) {}
  remove(): Promise<void> {
    todo("TormSessionRepository#remove");
  }

  async insert(userId: string): Promise<string> {
    const entity = SessionEntity.create(userId);

    const savedEntity = await this.dataSource.manager
      .getRepository(SessionEntity)
      .save(entity);

    return savedEntity.toObject().id;
  }

  async findOneById(id: string): Promise<ISession | undefined> {
    return (
      (
        await this.dataSource.manager.getRepository(SessionEntity).findOneBy({
          id: ObjectId.createFromHexString(id),
        })
      )?.toObject() ?? undefined
    );
  }
}
