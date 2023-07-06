import {
  Column,
  DataSource,
  Entity,
  ObjectIdColumn,
  PrimaryColumn,
  Unique,
} from "typeorm";
import bcrypt from "bcrypt";
import { Result, resultError, resultOk } from "@/utils";
import { ErrorCode, INVALID_PASSWORD, NO_SUCH_USER, PASSWORD_ALREADY_REGISTERED } from "@/error";
import { ObjectId } from "mongodb";

interface IPasswordAuthCredential {
  userId: string;
  loginId: string;
  password: string;
}

export interface IPasswordAuthCredentialRepository {
  insert(passwordAuthCredential: IPasswordAuthCredential): Promise<Result<void, ErrorCode>>;
  checkWithUserId(
    userId: string,
    password: string
  ): Promise<Result<void, ErrorCode>>;
  checkWithLoginId(
    loginId: string,
    password: string
  ): Promise<Result<void, ErrorCode>>;
  findOneByLoginId(
    loginId: string
  ): Promise<IPasswordAuthCredential | undefined>;
  update(userId: string, password: string): Promise<Result<void, ErrorCode>>;
  isLoginIdExists(loginId: string): Promise<true | false>;
}

/*class PasswordLoginUsecase {
  private constructor(private passwordAuthCredentialRepository: IpasswordAuthCredentialRepository) {}

  async auth(userId: string, password: string): Promise<true | false> {
    return await this.passwordAuthCredentialRepository.check(userId, password);
  }
}*/

@Entity()
@Unique(["userId", "loginId"])
export class PasswordAuthCredentialEntity {
  private constructor() {}

  static create(userId: string, loginId: string, password: string) {
    const instance = new PasswordAuthCredentialEntity();
    instance.userId = ObjectId.createFromHexString(userId);
    instance.loginId = loginId;
    instance.password = password;

    return instance;
  }

  @ObjectIdColumn()
  id!: ObjectId;

  @Column("userId")
  userId!: ObjectId;

  @Column({ name: "loginId" })
  loginId!: string;

  @Column({ name: "password" })
  password!: string;


  toObject(): IPasswordAuthCredential {
    return {
      ...this,
      userId: this.userId.toHexString()
    }
  }
}

export class TormPasswordAuthCredentialRepository
  implements IPasswordAuthCredentialRepository
{
  constructor(private dataSource: DataSource) {}
  async findOneByLoginId(
    loginId: string
  ): Promise<IPasswordAuthCredential | undefined> {
    return (
      (await (await this.dataSource).manager
        .getRepository(PasswordAuthCredentialEntity)
        .findOneBy({ loginId })) ?? undefined
    )?.toObject();
  }

  async insert(passwordAuthCredential: IPasswordAuthCredential): Promise<Result<void, ErrorCode>> {
    if (await this.isLoginIdExists(passwordAuthCredential.userId)) {
      return resultError(PASSWORD_ALREADY_REGISTERED);
    }
    await this.dataSource.manager
      .getRepository(PasswordAuthCredentialEntity)
      .save(
        PasswordAuthCredentialEntity.create(
          passwordAuthCredential.userId,
          passwordAuthCredential.loginId,
          await bcrypt.hash(passwordAuthCredential.password, 10)
        )
      );
    
    return resultOk(undefined);
  }

  async checkWithUserId(
    userId: string,
    password: string
  ): Promise<Result<void, ErrorCode>> {
    const entity = await this.dataSource.manager
      .getRepository(PasswordAuthCredentialEntity)
      .findOneBy({
        userId: ObjectId.createFromHexString(userId),
      });

    if (!entity) {
      return resultError(NO_SUCH_USER);
    }

    if (!(await bcrypt.compare(password, entity.password))) {
      return resultError(INVALID_PASSWORD);
    }

    return resultOk(undefined);
  }

  async checkWithLoginId(
    loginId: string,
    password: string
  ): Promise<Result<void, string>> {
    const entity = await this.dataSource.manager
      .getRepository(PasswordAuthCredentialEntity)
      .findOneBy({
        loginId,
      });

    if (!entity) {
      return resultError(NO_SUCH_USER);
    }

    if (!(await bcrypt.compare(password, entity.password))) {
      return resultError(INVALID_PASSWORD);
    }

    return resultOk(undefined);
  }

  async update(
    userId: string,
    password: string
  ): Promise<Result<void, ErrorCode>> {
    const entity = await this.dataSource.manager
      .getRepository(PasswordAuthCredentialEntity)
      .findOneBy({
        userId: ObjectId.createFromHexString(userId),
      });

    if (!entity) {
      return resultError(NO_SUCH_USER);
    }

    entity.password = await bcrypt.hash(password, 10);

    this.dataSource.manager.save(entity);

    return resultOk(undefined);
  }

  async isLoginIdExists(loginId: string): Promise<boolean> {
    const entity = await this.dataSource.manager
      .getRepository(PasswordAuthCredentialEntity)
      .findOneBy({
        loginId,
      });

    return !!entity;
  }
}
