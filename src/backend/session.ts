import { Column, DataSource, Entity, PrimaryGeneratedColumn } from "typeorm";
import { getMongoUrl } from "./config";
import { getTypeOrmDataSource } from "./typeorm";

export interface ISessionRepository {
  insert(userId: string): Promise<string>;

  findOneById(id: string): Promise<ISession | undefined>;
}

interface ISession {
  id: string,
  userId: string
}

@Entity()
class SessionEntity implements ISession {
  constructor(userId: string) {
    this.id = ""; // TODO
    this.userId = userId;
  }

  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  userId: string;
}

export class TormSessionRepository implements ISessionRepository {
  private constructor(private dataSource: DataSource) {}

  private static instance = new TormSessionRepository(getTypeOrmDataSource());

  static getInstance(): TormSessionRepository {
    return TormSessionRepository.instance;
  }


  async insert(userId: string): Promise<string> {
    const entity = new SessionEntity(userId);

    const savedEntity = await this.dataSource.manager.getRepository(SessionEntity).save(entity);

    return savedEntity.id;
  }

  async findOneById(id: string): Promise<ISession | undefined> {
    return await this.dataSource.manager.getRepository(SessionEntity).findOneBy({
      id
    }) ?? undefined;
  } 
}
