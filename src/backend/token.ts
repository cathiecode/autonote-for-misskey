import { ErrorCode } from "@/error";
import { Result, errorIfNullable, resultError, resultOk } from "@/utils";
import { ObjectId } from "mongodb";
import { Mongoose, Schema } from "mongoose";
import { Column, DataSource, Entity, ObjectIdColumn } from "typeorm";

export interface IToken {
  id: string,
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

  serialized() {
    return {
      ...this,
      id: this.id.toHexString()
    };
  }
}

const schema = new Schema({
  userId: {type: Schema.Types.ObjectId, required: true},
  instance: {type: String, required: true},
  instanceUserId: {type: String, required: true},
  token: {type: String, required: true},
}, {
  methods: {
    serialized(): IToken {
      return {
        ...this,
        id: this.id.toHexString(),
        userId: this.userId.toHexString()
      }
    }
  }
});

export class MongooseTokenRepository implements ITokenRepository {
  private Model = this.connection.model("Token", schema);

  constructor(private connection: Mongoose) {}

  async create(userId: string, token: string, instance: string, instanceUserId: string): Promise<Result<void, string>> {
    const entity = new this.Model();
  
    entity.$set({
      userId,
      token,
      instance,
      instanceUserId
    });

    await entity.save();

    return resultOk(undefined);
  }
  async findManyByUserId(userId: string): Promise<IToken[]> {
    return this.Model.find({userId});
  }
  async findOneByTokenId(id: string): Promise<Result<IToken, void>> {
    const result = await this.Model.findById(id);

    if (result) {
      return resultOk(result.serialized());
    } else {
      return resultError(undefined);
    }
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
    })).map(item => item.serialized());
  }

  async findOneByTokenId(id: string): Promise<Result<IToken, void>> {
    return errorIfNullable((await this.dataSource.manager.getRepository(TokenEntity).findOneBy({
      id: ObjectId.createFromHexString(id)
    }))?.serialized(), undefined);
  }
}