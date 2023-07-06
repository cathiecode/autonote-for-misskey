import { Column, DataSource, Entity, ObjectIdColumn, ObjectId as TormObjectId } from "typeorm";
import { Result, resultError, resultOk } from "@/utils";
import mongoose, { Schema, ObjectId, model, Mongoose} from "mongoose";

interface IPost {
  id: string;
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
  id!: TormObjectId;

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

const schema = new Schema({
  text: {type: String, required: true},
  userId: {type: Schema.Types.ObjectId, required: true},
  state: {type: String, required: true},
}, {
  methods: {
    toObject(cb): IPost {
      return {
        ...this,
        id: this._id.toHexString(),
        userId: this._id.toHexString(),
        state: this.state as IPost["state"]
      };
    }
  }
});

export class MongoosePostRepository implements IPostRepository {
  private Model = this.connection.model("Post", schema);

  constructor(private connection: Mongoose) {}

  async insert(post: IPost): Promise<string> {
    const entity = new this.Model();
    entity.$set(post);
    const savedEntity = await entity.save();

    return savedEntity._id.toHexString();
  }
  async findManyByUserId(userId: string): Promise<IPost[]> {
    return (await this.Model.find({userId})).map(item => item.toObject());
  }
  async findOneById(id: string): Promise<Result<IPost, void>> {
    const result = await this.Model.findOne({_id: id});
    if (result) {
      return resultOk(result.toObject());
    } else {
      return resultError(undefined);
    }
  }
  async remove(id: string): Promise<void> {
    await this.Model.deleteOne({_id: id});
  }
}

export class TormPostRepository implements IPostRepository {
  constructor(private dataSource: DataSource) {}

  async findManyByUserId(userId: string): Promise<IPost[]> {
    return (
      await this.dataSource.manager.getRepository(PostEntity).findBy({
        id: TormObjectId.createFromHexString(userId),
      })
    ).map((item) => item.toObject());
  }

  async findOneById(id: string): Promise<Result<IPost, void>> {
    const entity = (
      await this.dataSource.manager
        .getRepository(PostEntity)
        .findOneBy({
          id: TormObjectId.createFromHexString(id),
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
        id: TormObjectId.createFromHexString(id),
      });

    if (!entity) {
      throw new Error("No such post");
    }

    await this.dataSource.manager
      .getRepository(PostEntity)
      .remove(entity);
  }
}
