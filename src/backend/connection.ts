import { AppDataSource } from "@/data-source";
import mongoose, { Mongoose } from "mongoose";

export async function getTypeOrmDataSource() {
  return await AppDataSource;
}

export async function getMongooseConnection() {
  return await new Mongoose().connect(process.env.MONGO_URL!, {
    dbName: process.env.MONGO_DB!
  })
}