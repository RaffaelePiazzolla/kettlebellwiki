import * as database from './database';
import Video from '../model/Video';
import ServiceError from '../model/ServiceError';

export async function search(query: string): Promise<Video[]>;
export async function search(query: string, from: number, length: number): Promise<Video[]>;
export async function search(query: string, from?: number, length?: number): Promise<Video[]> {
  try {
    let videos = await database.query(`
      SELECT *
      FROM "Videos"
      WHERE MATCH("title") AGAINST(? IN NATURAL LANGUAGE MODE)
      OR "id" = ? `,
      Array(2).fill(query),
      from, length,
    );

    if (videos.length === 0) {
      videos = await database.query(`
        SELECT *
        FROM "Videos"
        WHERE "title" LIKE CONCAT('%', ?, '%')
        OR "description" LIKE CONCAT('%', ?, '%')
        OR "id" = ? `,
        Array(3).fill(query),
        from, length,
      );
    }
    
    return videos.map(video => new Video(video));
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError(500, `cannot search videos: ${error.message}`);
  }
}

export async function getVideo(videoId: number): Promise<Video> {
  try {
    const videos = await database.query(`
      SELECT *
      FROM "Videos"
      WHERE "id" = ? `,
      [videoId],
    );
    if (videos.length === 1) return new Video(videos[0]);
    throw new ServiceError(404, `no video with id ${videoId}`);
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError(500, `cannot get video: ${error.message}`);
  }
}

export async function getFreeVideos(): Promise<Video[]> {
  try {
    const videos = await database.query(`
      SELECT *
      FROM "Videos"
      WHERE "isFree" = TRUE
      ORDER BY "positionInCollection" ASC `,
    );
    return videos.map(video => new Video(video));
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError(500, `cannot get free videos: ${error.message}`);
  }
}

export async function getRelatedVideos(videoId: number): Promise<Video[]>;
export async function getRelatedVideos(videoId: number, from: number, length: number): Promise<Video[]>;
export async function getRelatedVideos(videoId: number, from?: number, length?: number): Promise<Video[]> {
  try {
    const video = await getVideo(videoId);
    const relatedVideos = await database.query(`
      SELECT *
      FROM "Videos"
      WHERE MATCH("title") AGAINST(? IN NATURAL LANGUAGE MODE)
      AND "id" <> ? `,
      [video.title, videoId],
      from, length,
    );
    return relatedVideos.map(video => new Video(video));
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError(500, `cannot get related videos: ${error.message}`);
  }
}

export async function getRandomVideos(limit: number): Promise<Video[]> {
  try {
    const videos = await database.query(`
      SELECT *
      FROM "Videos"
      ORDER BY RAND()
      LIMIT ? `,
      [limit],
    );
    return videos.map(video => new Video(video));
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError(500, `cannot get random videos: ${error.message}`);
  }
}