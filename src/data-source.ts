import "reflect-metadata"
import { DataSource } from "typeorm"
import { PostEntity } from "./backend/post"
import { UserEntity } from "./backend/user"
import { SessionEntity } from "./backend/session"
import { PasswordAuthCredentialEntity } from "./backend/auth"

export const AppDataSource = new DataSource({
    type: "mongodb",
    url: process.env.MONGO_URL,
    database: process.env.MONGO_DB,
    synchronize: true,
    logging: false,
    entities: [UserEntity, PostEntity, SessionEntity, PasswordAuthCredentialEntity],
    migrations: [],
    subscribers: [],
}).initialize();
