import "reflect-metadata";
import {
  IPasswordAuthCredentialRepository,
  MongoosePasswordAuthCredentialRepository,
} from "./auth";
import { AgendaScheduledJobDefRegistory } from "./job";
import { RegisterPostJobDef } from "./jobs";
import { ISessionRepository, MongooseSessionRepository } from "./session";
import { IUserRepository, MongooseUserRepository } from "./user";
import { getMongooseConnection, getTypeOrmDataSource } from "./connection";
import { Result, resultError, resultOk, todo } from "@/utils";
import { APPLICATION_ERROR, ErrorCode, FORBIDDEN, LOGINID_ALREADY_TAKEN } from "@/error";
import { AcceptableId, AcceptableName, AcceptablePassword } from "@/policies";
import { IToken, ITokenRepository, MongooseTokenRepository } from "./token";
import {
  FetchMisskeyProfileInteractor,
  IMiAuthSessionRepository,
  IMisskeyInteractor,
  MongooseMiAuthSessionRepository,
} from "./miauth";
import { DummyConfigurationService, IConfigurationService } from "./config";

export class Usecases {
  constructor(
    private configService: IConfigurationService,
    private misskeyInteractor: IMisskeyInteractor,
    private userRepository: IUserRepository,
    private passwordAuthCredentialRepository: IPasswordAuthCredentialRepository,
    private sessionRepository: ISessionRepository,
    private tokenRepository: ITokenRepository,
    private miAuthSessionRepository: IMiAuthSessionRepository
  ) {}

  async createUserWithPasswordAuth(
    name: AcceptableName,
    loginId: AcceptableId,
    password: AcceptablePassword
  ): Promise<Result<string, string>> {
    if (await this.passwordAuthCredentialRepository.isLoginIdExists(loginId)) {
      return resultError(LOGINID_ALREADY_TAKEN);
    }

    const userId = await this.userRepository.insert(name);

    await this.passwordAuthCredentialRepository.insert({
      userId,
      loginId,
      password,
    });

    const session = await this.createSessionWithPasswordLogin(
      loginId,
      password
    );

    if (!session.ok) {
      return resultError(APPLICATION_ERROR, session.error);
    }

    return session;
  }

  async changePassword(userId: string, password: string): Promise<void> {
    await this.passwordAuthCredentialRepository.update(userId, password);
  }

  async checkIsLoginIdExists(loginId: string): Promise<true | false> {
    return await this.passwordAuthCredentialRepository.isLoginIdExists(loginId);
  }

  async createSessionWithPasswordLogin(
    loginId: string,
    password: string
  ): Promise<Result<string, string>> {
    const loginResult =
      await this.passwordAuthCredentialRepository.checkWithLoginId(
        loginId,
        password
      );

    if (!loginResult.ok) {
      return loginResult;
    }

    const session = await this.sessionRepository.insert(loginResult.result);

    return resultOk(session);
  }

  async getCurrentUser(sessionId: string): Promise<{ userId: string } | null> {
    const session = await this.sessionRepository.findOneById(sessionId);

    if (!session) {
      return null;
    }

    return { userId: session.userId };
  }

  async getTokenList(userId: string): Promise<IToken[]> {
    return await this.tokenRepository.findManyByUserId(userId);
  }

  async startMiAuth(
    userId: string,
    instance: string
  ): Promise<{ redirect: string }> {
    const sessionId = await this.miAuthSessionRepository.insert({
      userId,
      instance,
    });

    const redirectUrl = [
      `https://${instance}/miauth/`,
      sessionId,
      `?name=${encodeURI(await this.configService.getServiceName())}`,
      `&icon=${encodeURI(await this.configService.getServiceIconUri())}`,
      `&callback=${await this.configService.getMiAuthCallback()}`,
      `&permission=read:account,write:notes`,
    ].join("");

    return {redirect: redirectUrl};
  }

  async validateMiAuth(userId: string, sessionId: string): Promise<Result<void, ErrorCode>> {
    const session = await this.miAuthSessionRepository.findOneBySessionId(sessionId);

    if (!session.ok) {
      return session;
    }

    if (userId !== session.result.userId) {
      return resultError(FORBIDDEN);
    }

    const authResult = await this.misskeyInteractor.getTokenWithMiAuth(session.result.instance, sessionId);

    if (!authResult.ok) {
      return authResult;
    }

    const saveResult = await this.tokenRepository.create(userId, authResult.result.token, session.result.instance, authResult.result.username);

    if (!saveResult.ok) {
      return saveResult;
    }

    return saveResult;
  }

  private static instance: Promise<Usecases> | null;

  private static async createInstance() {
    const connection = await getMongooseConnection();

    return new Usecases(
      new DummyConfigurationService(),
      new FetchMisskeyProfileInteractor(),
      new MongooseUserRepository(connection),
      new MongoosePasswordAuthCredentialRepository(connection),
      new MongooseSessionRepository(connection),
      new MongooseTokenRepository(connection),
      new MongooseMiAuthSessionRepository(connection)
    );
  }

  static getInstnace() {
    if (!Usecases.instance) {
      Usecases.instance = this.createInstance();
    }

    return Usecases.instance;
  }
}

export async function getController() {
  return await Usecases.getInstnace();
}

export async function main(): Promise<void> {
  const jobDefRegistory = AgendaScheduledJobDefRegistory.getInstance();
  new RegisterPostJobDef(jobDefRegistory).exec();
}

main();
