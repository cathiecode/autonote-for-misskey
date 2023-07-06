import { Column, DataSource, Entity, ObjectId, ObjectIdColumn } from "typeorm";
import { getTypeOrmDataSource } from "./typeorm";
import { Result, resultError, resultOk } from "@/utils";

interface IPost {
  userId: string;
  text: string;
  state: "draft" | "scheduled" | "posted" | "rescheduled";
}

type IPreInsertPost = Omit<IPost, "IPost">;

interface IPostRepository {
  insert(post: IPost): Promise<string>;
  findManyByUserId(userId: string): Promise<IPost[]>;
  findOneById(id: string): Promise<Result<IPost, void>>;
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
export class PostEntity {
  private constructor() {}
  static create(
    text: string,
    userId: string,
    state: "draft" | "scheduled" | "posted" | "rescheduled"
  ) {
    const instance = new PostEntity();

    instance.text = text;
    instance.state = state;
    instance.userId = userId;

    return instance;
  }
  @ObjectIdColumn()
  id!: ObjectId;

  @Column()
  text!: string;

  @Column()
  userId!: string;

  @Column()
  state!: "draft" | "scheduled" | "posted" | "rescheduled";

  toObject() {
    return {
      ...this,
      id: this.id.toHexString(),
    };
  }
}

export class TormPostRepository implements IPostRepository {
  constructor(private dataSource: DataSource) {}

  async findManyByUserId(userId: string): Promise<IPost[]> {
    return (
      await this.dataSource.manager.getRepository(PostEntity).findBy({
        id: ObjectId.createFromHexString(userId),
      })
    ).map((item) => item.toObject());
  }

  async findOneById(id: string): Promise<Result<IPost, void>> {
    const entity = (
      await this.dataSource.manager
        .getRepository(PostEntity)
        .findOneBy({
          id: ObjectId.createFromHexString(id),
        })
    )?.toObject();

    if (!entity) {
      return resultError(entity);
    }

    return resultOk(entity);
  }

  async insert(post: IPreInsertPost): Promise<string> {
    const entity = PostEntity.create(post.text, post.userId, post.state);
    entity.text = post.text;
    entity.state = post.state;
    entity.userId = post.userId;

    const savedEntity = await (await this.dataSource).manager
      .getRepository(PostEntity)
      .save(entity);

    return savedEntity.toObject().id;
  }

  async remove(id: string): Promise<void> {
    const entity = await (await this.dataSource).manager
      .getRepository(PostEntity)
      .findOneBy({
        id: ObjectId.createFromHexString(id),
      });

    if (!entity) {
      throw new Error("No such post");
    }

    await this.dataSource.manager
      .getRepository(PostEntity)
      .remove(entity);
  }
}
