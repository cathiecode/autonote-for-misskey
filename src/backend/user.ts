import { AcceptableId, AcceptableName } from "@/policies";
import { Mongoose, Schema } from "mongoose";
import { Column, DataSource, Entity, ObjectId, ObjectIdColumn } from "typeorm";

export interface IUser {
  id: string;
  name: string;
}

export interface IUserRepository {
  insert(name: AcceptableName): Promise<string>;
  findOneById(id: string): Promise<IUser | undefined>;
}

@Entity()
export class UserEntity {
  private constructor() {}
  
  static create(name: string) {
    const instance = new UserEntity();

    instance.name = name;

    return instance;
  }

  @ObjectIdColumn()
  id!: ObjectId;

  @Column()
  name!: string;

  serialized() {
    return {
      ...this,
      id: this.id.toHexString()
    }
  }
}

const schema = new Schema({
  name: {type: String, required: true},
}, {
  methods: {
    serialized(): IUser {
      return {
        ...this,
        id: this._id.toHexString()
      }
    }
  }
});

export class MongooseUserRepository implements IUserRepository {
  private Model = this.connection.model("User", schema);

  constructor(private connection: Mongoose) {}

  async insert(name: AcceptableName): Promise<string> {
    const entity = new this.Model();

    entity.$set({name});

    const savedEntity = await entity.save();

    return savedEntity.id;
  }
  async findOneById(id: string): Promise<IUser | undefined> {
    return (await this.Model.findById(id))?.serialized();
  }
}

export class TormUserRepository implements IUserRepository {
  constructor(private dataSource: DataSource) {}

  async insert(name: AcceptableName): Promise<string> {
    const entity = UserEntity.create(name);

    const insertedEntity = await this.dataSource.manager
      .getRepository(UserEntity)
      .save(entity);

    return insertedEntity.serialized().id;
  }

  async findOneById(id: string): Promise<IUser | undefined> {
    const entity = await this.dataSource.manager
      .getRepository(UserEntity)
      .findOneBy({
        id: ObjectId.createFromHexString(id),
      });

    return entity?.serialized() ?? undefined;
  }
}
