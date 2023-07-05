import { getMongoUrl } from "./config";
import {Column, DataSource, Entity, PrimaryGeneratedColumn} from "typeorm";
import { getTypeOrmDataSource } from "./typeorm";

export interface IUser {
  id: string,
  name: string
}

type IPreInsertUser = Omit<IUser, "id">;

export interface IUserRepository {
  insert(user: IPreInsertUser): Promise<string>;
  findOneById(id: string): Promise<IUser | undefined>;
}

@Entity()
class UserEntity implements IUser {
  constructor(name: string) {
    this.id = ""; // TODO
    this.name = name;
  }
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;
}

export class TormUserRepository implements IUserRepository {
  private constructor(private dataSource: DataSource) {}

  private static instance = new TormUserRepository(getTypeOrmDataSource());

  static getInstance(): TormUserRepository {
    return TormUserRepository.instance;
  }

  async insert(user: IPreInsertUser): Promise<string> {
    const entity = new UserEntity(user.name);

    const insertedEntity = await this.dataSource.manager.save(entity);

    return insertedEntity.id;
  }

  async findOneById(id: string): Promise<IUser | undefined> {
    const entity = await this.dataSource.manager.getRepository(UserEntity).findOneBy({
      id
    });

    return entity ?? undefined;
  }
}
