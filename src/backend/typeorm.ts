import { DataSource } from "typeorm";
import { getMongoUrl } from "./config";

export const getTypeOrmDataSource = () => new DataSource({
  type: "mongodb",
  url: getMongoUrl()
});
