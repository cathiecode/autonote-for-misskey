import { Agenda } from "agenda";

import { todo } from "../utils";

export class RepeatedJobTimingDefinition {
  jobType: "repeated"
  delayed: boolean;
  constructor(private cronString: string) {
    todo("RepeatedJobTimingDefinition");
  }

  getCronString(): string {
    return this.cronString;
  }
}

export interface IScheduledJobDefRepository {
  insert(exec: IScheduledJobDef<any>): void;
}

export interface IScheduledJobRepository {
  insert<JobDef extends IScheduledJobDef<Params>, Params>(jobDef: JobDef, timing: RepeatedJobTimingDefinition, params: Params): void;
}

export interface IScheduledJobDef<Params> {
  getId(): string;
  exec(parameters: Params): void | Promise<void>;
}

export class DummyJobDefRegistory implements IScheduledJobDefRepository {
  insert(exec: IScheduledJobDef<any>): void {
    todo("JobDefRegistory");
  }
}

export class DummyJobRegisotry implements IScheduledJobRepository {
  insert<Params>(jobDef: IScheduledJobDef<Params>, timing: RepeatedJobTimingDefinition, params: Params): void {
    todo("JobRegistory");
    jobDef.exec(params);
  }
}


const agenda = new Agenda();

export class AgendaScheduledJobDefRegistory implements IScheduledJobDefRepository {
  agenda = agenda;

  private constructor() {
    // TODO: mongo
  }

  private static instance = new AgendaScheduledJobDefRegistory();

  static getInstance(): AgendaScheduledJobDefRegistory {
    return this.instance;
  }

  insert(exec: IScheduledJobDef<any>): void {
    this.agenda.define(exec.getId(), {}, async (job: {attrs: any}) => {
      await exec.exec(job.attrs);
    });
  }
}

export class AgendaScheduledJobRegistory implements IScheduledJobRepository {
  agenda = agenda;

  private constructor() {
    // TODO: mongo
  }

  instance = new AgendaScheduledJobRegistory();

  getInstance(): AgendaScheduledJobRegistory {
    return this.instance;
  }

  insert<JobDef extends IScheduledJobDef<Params>, Params>(jobDef: JobDef, timing: RepeatedJobTimingDefinition, params: Params): void {
    this.agenda.every(timing.getCronString(), jobDef.getId(), params as {[key: string]: any});
    // TODO: retry
  }
}

