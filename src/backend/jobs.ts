import { IScheduledJobDef, IScheduledJobDefRepository, RepeatedJobTimingDefinition } from "./job";
import { todo } from "../utils";
import { OnInit } from "./hook";

type PostParams = {
  instance: string,
  userid: string,
  token: string
}

export class PostJob implements IScheduledJobDef<PostParams> {
  private constructor() {
    // TODO
  }

  private static instanece = new PostJob();

  static getInstance(): PostJob {
    return this.instanece;
  }

  getJobTiming(): RepeatedJobTimingDefinition {
    throw new Error("Method not implemented.");
  }

  getId(): string {
    return "cb7c4fa0-69fd-4c2e-add5-90101b3bebfe";
  }

  exec(parameters: PostParams) {
    todo("Post#exec");
    // NOTE: Postユースケースを呼び出して投稿一覧から消してもらうor投稿済みとしてマークしてもらう
  }
}

export class RegisterPostJobDef implements OnInit {
  constructor(private postRepository: IScheduledJobDefRepository) {
    
  }
  exec() {
    this.postRepository.insert(PostJob.getInstance());
  }
}
