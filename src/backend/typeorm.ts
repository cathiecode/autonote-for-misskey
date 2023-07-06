import { AppDataSource } from "@/data-source";

export async function getTypeOrmDataSource() {
  return await AppDataSource;
}
