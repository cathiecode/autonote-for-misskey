import { Column, DataSource, Entity, Unique } from "typeorm";
import bcrypt from "bcrypt";
import { getMongoUrl } from "./config";
import { getTypeOrmDataSource } from "./typeorm";

interface IPasswordAuthCredential {
  userId: string,
  loginId: string,
  password: string,
}

export interface IPasswordAuthCredentialRepository {
  insert(passwordAuthCredential: IPasswordAuthCredential): Promise<void>;
  checkWithUserId(userId: string, password: string): Promise<true | false>;
  checkWithLoginId(loginId: string, password: string): Promise<true | false>;
  findOneByLoginId(loginId: string): Promise<IPasswordAuthCredential | undefined>;
  update(userId: string, password: string): Promise<void>;
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
class PasswordAuthCredential implements IPasswordAuthCredential {
  constructor(userId: string, loginId: string, password: string) {
    this.userId = userId;
    this.loginId = loginId;
    this.password = password;
  }
  @Column({ name: "user_id" })
  userId: string;

  @Column({ name: "login_id" })
  loginId: string;

  @Column({ name: "password" })
  password: string;
}

export class TormPasswordAuthCredentialRepository implements IPasswordAuthCredentialRepository {
  private constructor(private dataSource: DataSource) {}
  async findOneByLoginId(loginId: string): Promise<IPasswordAuthCredential | undefined> {
    return await this.dataSource.manager.getRepository(PasswordAuthCredential).findOneBy({loginId}) ?? undefined;
  }

  private static instance = new TormPasswordAuthCredentialRepository(getTypeOrmDataSource());

  static getInstance(): TormPasswordAuthCredentialRepository {
    return this.instance;
  }

  async insert(passwordAuthCredential: PasswordAuthCredential): Promise<void> {
    if (await this.isLoginIdExists(passwordAuthCredential.userId)) {
      throw new Error("Login id already exists");
    }
    await this.dataSource.manager.save(passwordAuthCredential);
  }

  async checkWithUserId(userId: string, password: string): Promise<boolean> {
    const entity = await this.dataSource.manager.getRepository(PasswordAuthCredential).findOneBy({
      userId
    });

    if (!entity) {
      throw new Error("No such login credential");
    }

    return await bcrypt.compare(entity.password, password);
  }

  async checkWithLoginId(loginId: string, password: string): Promise<boolean> {
    const entity = await this.dataSource.manager.getRepository(PasswordAuthCredential).findOneBy({
      loginId
    });

    if (!entity) {
      throw new Error("No such login credential");
    }

    return await bcrypt.compare(password, entity.password);
  }

  async update(userId: string, password: string): Promise<void> {
    const entity = await this.dataSource.manager.getRepository(PasswordAuthCredential).findOneBy({
      userId
    });

    this.dataSource.manager.save({
      ...entity,
      password: bcrypt.hash(password, 10)
    })

    this.dataSource.manager.getRepository(PasswordAuthCredential).findBy({})

    if (!entity) {
      throw new Error("No such login credential");
    }

    return;
  }

  isLoginIdExists(loginId: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  
}
