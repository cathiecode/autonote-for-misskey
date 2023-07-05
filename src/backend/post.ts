import { Column, DataSource, Entity, PrimaryGeneratedColumn } from "typeorm";
import { getMongoUrl } from "./config";
import { getTypeOrmDataSource } from "./typeorm";

interface IPost {
  userId: string,
  text: string,
  state: "draft" | "scheduled" | "posted" | "rescheduled"
}

type IPreInsertPost = Omit<IPost, "IPost">;

interface IPostRepository {
  insert(post: IPost): Promise<string>;

  remove(id: string): Promise<void>;
}

/*
class DummyPostRepository implements IPostRepository {
  async insert(post: IPost): Promise<string> {
    todo("PostRepository");
  }
  
  async remove(post: IPost) {
    todo("PostRepository");
  }
}
*/

@Entity()
class PostEntity implements IPost {
  constructor(text: string, userId: string, state: "draft" | "scheduled" | "posted" | "rescheduled") {
    this.text = text;
    this.state = state;
    this.userId = userId;
    this.id = ""; // TODO
  }
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  text: string;

  @Column()
  userId: string;

  @Column()
  state: "draft" | "scheduled" | "posted" | "rescheduled"
}

export class TormPostRepository implements IPostRepository {
  private constructor(private dataSource: DataSource) {}

  static instance = new TormPostRepository(getTypeOrmDataSource());

  getInstance(): TormPostRepository {
    return TormPostRepository.instance;
  }

  async insert(post: IPreInsertPost): Promise<string> {
    const entity = new PostEntity(post.text, post.userId, post.state);
    entity.text = post.text;
    entity.state = post.state;
    entity.userId = post.userId;

    const savedEntity = await this.dataSource.manager.getRepository(PostEntity).save(entity);

    return savedEntity.id;
  }

  async remove(id: string): Promise<void> {
    const entity = await this.dataSource.manager.getRepository(PostEntity).findOneBy({
      id
    });

    if (!entity) {
      throw new Error("No such post");
    }

    await this.dataSource.manager.getRepository(PostEntity).remove(entity);
  }
}
