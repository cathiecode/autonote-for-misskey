import { AcceptableId, AcceptableName } from "@/policies";
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

  toObject() {
    return {
      ...this,
      id: this.id.toHexString()
    }
  }
}

export class TormUserRepository implements IUserRepository {
  constructor(private dataSource: DataSource) {}

  async insert(name: AcceptableName): Promise<string> {
    const entity = UserEntity.create(name);

    const insertedEntity = await this.dataSource.manager
      .getRepository(UserEntity)
      .save(entity);

    return insertedEntity.toObject().id;
  }

  async findOneById(id: string): Promise<IUser | undefined> {
    const entity = await this.dataSource.manager
      .getRepository(UserEntity)
      .findOneBy({
        id: ObjectId.createFromHexString(id),
      });

    return entity?.toObject() ?? undefined;
  }
}
