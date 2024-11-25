import Video from './Video';

export default class TrainingPlan {
  id: number;
  description: string;
  isStandard: boolean;
  videos: Video[];

  constructor(args: TrainingPlanConstructor = {}) {
    this.setProps(args);
  }

  setProps({ id, description, isStandard, videos }: TrainingPlanConstructor) {
    if (id != null) this.id = id;
    if (description != null) this.description = description;
    if (isStandard != null) this.isStandard = isStandard;
    if (videos != null) this.videos = videos;
  }
}

interface TrainingPlanConstructor {
  id?: number;
  description?: string;
  isStandard?: boolean;
  videos?: Video[];
}