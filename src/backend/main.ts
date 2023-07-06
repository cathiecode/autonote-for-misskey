import "reflect-metadata";
import {
  IPasswordAuthCredentialRepository,
  TormPasswordAuthCredentialRepository,
} from "./auth";
import {
  AgendaScheduledJobDefRegistory,
} from "./job";
import { PostJob, RegisterPostJobDef } from "./jobs";
import { ISessionRepository, TormSessionRepository } from "./session";
import { IUserRepository, TormUserRepository } from "./user";
import { getTypeOrmDataSource } from "./typeorm";
import { Result, resultError, resultOk } from "@/utils";
import { APPLICATION_ERROR, LOGINID_ALREADY_TAKEN } from "@/error";
import { AcceptableId, AcceptableName, AcceptablePassword } from "@/policies";
import { IToken, ITokenRepository, TormTokenRepository } from "./token";

export class Usecases {
  constructor(
    private userRepository: IUserRepository,
    private passwordAuthCredentialRepository: IPasswordAuthCredentialRepository,
    private sessionRepository: ISessionRepository,
    private tokenRepository: ITokenRepository
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

    const session = await this.createSessionWithPasswordLogin(loginId, password);

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
    const loginResult = await this.passwordAuthCredentialRepository.checkWithLoginId(
      loginId,
      password
    )

    if (!loginResult.ok) {
      return loginResult;
    }

    const session = await this.sessionRepository.insert(loginId);

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

  private static instance: Usecases;

  static async getInstnace() {
    if (this.instance) {
      return this.instance;
    }
    const dataSource = await getTypeOrmDataSource();

    this.instance = new Usecases(
      new TormUserRepository(dataSource),
      new TormPasswordAuthCredentialRepository(dataSource),
      new TormSessionRepository(dataSource),
      new TormTokenRepository(dataSource)
    );

    return this.instance;
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
