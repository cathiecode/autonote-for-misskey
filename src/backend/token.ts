import { ErrorCode } from "@/error";
import { Result, errorIfNullable, resultOk } from "@/utils";
import { ObjectId } from "mongodb";
import { Column, DataSource, Entity, ObjectIdColumn } from "typeorm";

export interface IToken {
  userId: string,
  token: string,
  instance: string,
  instanceUserId: string,
}

export interface ITokenRepository {
  create(userId: string, token: string, instance: string, instanceUserId: string): Promise<Result<void, ErrorCode>>

  findManyByUserId(userId: string): Promise<IToken[]>;
  findOneByTokenId(id: string): Promise<Result<IToken, void>>;
}

@Entity()
export class TokenEntity {
  private constructor() {}

  static create(userId: string, instance: string, instanceUserId: string, token: string) {
    const entity = new TokenEntity();

    entity.userId = userId;
    entity.instance = instance;
    entity.instanceUserId = instanceUserId;
    entity.token = token;

    return entity;
  }

  @ObjectIdColumn()
  id!: ObjectId;

  @Column()
  userId!: string;
  
  @Column()
  instance!: string;

  @Column()
  instanceUserId!: string;

  @Column()
  token!: string;

  toObject() {
    return {
      ...this,
      id: this.id.toHexString()
    };
  }
}

export class TormTokenRepository implements ITokenRepository {
  constructor(private dataSource: DataSource) {}

  async create(userId: string, token: string, instance: string, instanceUserId: string): Promise<Result<void, string>> {
    await this.dataSource.manager.getRepository(TokenEntity).save(TokenEntity.create(userId, instance, instanceUserId, token));
    return resultOk(undefined);
  }

  async findManyByUserId(id: string): Promise<IToken[]> {
    return (await this.dataSource.manager.getRepository(TokenEntity).findBy({
      id: ObjectId.createFromHexString(id)
    })).map(item => item.toObject());
  }

  async findOneByTokenId(id: string): Promise<Result<IToken, void>> {
    return errorIfNullable((await this.dataSource.manager.getRepository(TokenEntity).findOneBy({
      id: ObjectId.createFromHexString(id)
    }))?.toObject(), undefined);
  }
}