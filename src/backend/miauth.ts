import { ErrorCode, MIAUTH_DENIED, MISSKEY_INSTANCE_CONNECTION_ERROR, NO_SUCH_MI_AUTH_SESSION } from "@/error";
import { Result, resultError, resultOk } from "@/utils";
import { randomUUID } from "crypto";
import { Mongoose, Schema } from "mongoose";

export interface IMiAuthSession {
  userId: string,
  instance: string,
}

export interface IMiAuthSessionRepository {
  insert(session: IMiAuthSession): Promise<string>;
  findOneBySessionId(sessionId: string): Promise<Result<IMiAuthSession, ErrorCode>>;
}

export interface IMisskeyInteractor {
  getTokenWithMiAuth(instance: string, sessionId: string): Promise<Result<{username: string, token: string}, ErrorCode>>;
}

export class FetchMisskeyProfileInteractor implements IMisskeyInteractor {
  async getTokenWithMiAuth(instance: string, sessionId: string): Promise<Result<{username: string, token: string}, ErrorCode>> {
    console.log(instance, sessionId);
    const response = await fetch(`https://${instance}/api/miauth/${sessionId}/check`, {
      method: "POST"
    });

    if (!response.ok) {
      return resultError(MISSKEY_INSTANCE_CONNECTION_ERROR);
    }

    const responseJson = await response.json() as {ok: boolean, token: string, user: {username: string}}

    if (!responseJson.ok) {
      return resultError(MIAUTH_DENIED);
    }

    return resultOk({username: responseJson.user.username, token: responseJson.token});
  }

  /*async getUserId(instance: string): Promise<string> {
    await fetch(`https://${instance}/api/i`, {
      method: "POST"
    });
  }*/
}

const schema = new Schema({
  userId: {type: Schema.Types.ObjectId, required: true},
  instance: {type: String, required: true},
  sessionId: {type: String, required: true}
}, {
  methods: {
    serialized(): IMiAuthSession {
      return {
        ...this,
        instance: this.instance,
        userId: this.userId.toHexString()
      }
    }
  }
});

export class MongooseMiAuthSessionRepository implements IMiAuthSessionRepository {
  private Model = this.connection.model("MiAuthSession", schema);
  constructor(private connection: Mongoose) {}

  async insert(session: IMiAuthSession): Promise<string> {
    const entity = new this.Model();

    entity.$set(session);
    entity.sessionId = randomUUID();

    await entity.save();

    return entity.sessionId;
  }
  async findOneBySessionId(sessionId: string): Promise<Result<IMiAuthSession, string>> {
    const entity = await this.Model.findOne({sessionId});

    if (!entity) {
      return resultError(NO_SUCH_MI_AUTH_SESSION);
    }

    return resultOk(entity.serialized());
  }

}