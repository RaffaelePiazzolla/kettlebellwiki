import Video from './Video';
import * as CollectionService from '../services/collection';

export default class Collection {
  id: number;
  name: string;
  mainVideo: Video;
  description: string;
  difficulty: number;
  videos: Video[];

  constructor(args: CollectionConstructor) {
    this.setProps(args);
  }

  setProps({ id, name, mainVideo, description, difficulty, videos }: CollectionConstructor = {}) {
    if (id != null) this.id = id;
    if (name != null) this.name = name;
    if (mainVideo != null) this.mainVideo = mainVideo;
    if (description != null) this.description = description;
    if (difficulty != null) this.difficulty = difficulty;
    if (videos != null) this.videos = videos;
  }

  async setMainVideo() {
    if (!(this.mainVideo instanceof Video)) {
      const video = await CollectionService.getCollectionMainVideo(this.id);
      this.mainVideo = video;
    }
  }
}

interface CollectionConstructor {
  id?: number,
  name?: string;
  mainVideo?: Video,
  description?: string;
  difficulty?: number;
  videos?: Video[];
}