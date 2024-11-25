export default class Video {
  id: number;
  vimeoId: number;
  title: string;
  description: string;
  language: string;
  views: number;
  vimeoThumbnailId: number;
  visualizationDate: Date;
  positionInCollection: number;
  isFree: boolean;

  constructor(args: VideoConstructor) {
    this.setProprs(args);
  }

  setProprs({
    id,
    vimeoId,
    title,
    description,
    language,
    views,
    vimeoThumbnailId,
    visualizationDate,
    positionInCollection,
    isFree,
  }: VideoConstructor) {
    if (id != null) this.id = id;
    if (vimeoId != null) this.vimeoId = vimeoId;
    if (title != null) this.title = title;
    if (description != null) this.description = description;
    if (language != null) this.language = language;
    if (views != null) this.views = views;
    if (vimeoThumbnailId != null) this.vimeoThumbnailId = vimeoThumbnailId;
    if (visualizationDate != null) this.visualizationDate = new Date(visualizationDate);
    if (positionInCollection != null) this.positionInCollection = positionInCollection;
    if (isFree != null) this.isFree = isFree;
  }
}

interface VideoConstructor extends Object {
  id?: number;
  vimeoId?: number;
  title?: string;
  description?: string;
  views?: number;
  language?: string;
  vimeoThumbnailId?: number;
  visualizationDate?: Date;
  positionInCollection?: number;
  isFree?: boolean;
}