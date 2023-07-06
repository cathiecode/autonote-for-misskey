import { ObjectId } from "mongodb";
import {
  Column,
  DataSource,
  Entity,
  ObjectIdColumn,
} from "typeorm";

export interface ISessionRepository {
  insert(userId: string): Promise<string>;

  findOneById(id: string): Promise<ISession | undefined>;
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

export class TormSessionRepository implements ISessionRepository {
  constructor(private dataSource: DataSource) {}

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
