import "reflect-metadata";
import { IPasswordAuthCredentialRepository, TormPasswordAuthCredentialRepository } from "./auth";
import {
  AgendaScheduledJobDefRegistory,
  DummyJobDefRegistory,
  DummyJobRegisotry,
  RepeatedJobTimingDefinition,
} from "./job";
import { PostJob, RegisterPostJobDef } from "./jobs";
import { ISessionRepository, TormSessionRepository } from "./session";
import { IUserRepository, TormUserRepository } from "./user";

export class Usecases {
  constructor(
    private userRepository: IUserRepository,
    private passwordAuthCredentialRepository: IPasswordAuthCredentialRepository,
    private sessionRepository: ISessionRepository
  ) {}

  async createUserWithPasswordAuth(
    loginId: string,
    password: string
  ): Promise<void> {
    if (await this.passwordAuthCredentialRepository.isLoginIdExists(loginId)) {
      throw new Error("Login id exists");
    }

    const userId = await this.userRepository.insert({
      name: loginId,
    });

    await this.passwordAuthCredentialRepository.insert({ userId, loginId, password });
  }

  async changePassword(userId: string, password: string): Promise<void> {
    await this.passwordAuthCredentialRepository.update(userId, password);
  }

  async checkIsLoginIdExists(loginId: string): Promise<true | false> {
    return await this.passwordAuthCredentialRepository.isLoginIdExists(loginId);
  }

  async createSessionWithPasswordLogin(loginId: string, password: string): Promise<string> {
    if (!await this.passwordAuthCredentialRepository.checkWithLoginId(loginId, password)) {
      throw new Error("Failed to login");
    }

    return await this.sessionRepository.insert(loginId);
  }

  async getCurrentUser(sessionId: string): Promise<{userId: string} | null> {
    const session = await this.sessionRepository.findOneById(sessionId);
    if (!session) {
      return null;
    }

    return {userId: session.userId};
  }
}

export const controller = new Usecases(TormUserRepository.getInstance(), TormPasswordAuthCredentialRepository.getInstance(), TormSessionRepository.getInstance());

export async function main(): Promise<void> {
  
  const jobDefRegistory = AgendaScheduledJobDefRegistory.getInstance()
  new RegisterPostJobDef(jobDefRegistory).exec();
}

main();
