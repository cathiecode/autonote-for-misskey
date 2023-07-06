import { AppDataSource } from "@/data-source";
import mongoose from "mongoose";

export async function getTypeOrmDataSource() {
  return await AppDataSource;
}

export async function getMongooseConnection() {
  return await mongoose.connect(process.env.MONGO_URL!, {
    dbName: process.env.MONGO_DB!
  })
}