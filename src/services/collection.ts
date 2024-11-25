import * as database from './database';
import Video from '../model/Video';
import Collection from '../model/Collection';
import ServiceError from '../model/ServiceError';

export async function search(query: string): Promise<Collection[]>
export async function search(query: string, from: number, length: number): Promise<Collection[]>
export async function search(query: string, from?: number, length?: number): Promise<Collection[]> {
  try {
    let collections: any = await database.query(`
      SELECT *
      FROM "Collections"
      WHERE MATCH("name") AGAINST(? IN NATURAL LANGUAGE MODE)
      OR "id" = ? `,
      Array(2).fill(query),
      from, length,
    );
    
    if (collections.length === 0) {
      collections = await database.query(`
        SELECT *
        FROM "Collections"
        WHERE "name" LIKE CONCAT('%', ?, '%')
        OR "description" LIKE CONCAT('%', ?, '%')
        OR "id" = ? `,
        Array(3).fill(query),
        from, length,
      );
    }

    collections = collections.map(collection => new Collection(collection));
    
    for await (const collection of collections as Collection[]) {
      await collection.setMainVideo();
    }

    return collections;
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError(500, `cannot search collections: ${error.message}`);
  }
}

export async function getCollection(collectionId: number): Promise<Collection> {
  try {
    const collection = new Collection({});
    const collections = await database.query(`
      SELECT *
      FROM "Collections"
      WHERE "id" = ? `,
      [collectionId],
    );
    if (collections.length === 1) {
      collection.setProps(collections[0]);

      const videos = await getVideosOfCollection(collectionId);
      collection.setProps({ videos });
      await collection.setMainVideo();

      return collection;
    }
    throw new ServiceError(404, `no collection with id ${collectionId}`);
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError(500, `cannot get collection: ${error.message}`);
  }
}

export async function getCollectionMainVideo(collectionId: number): Promise<Video> {
  try {
    const collections = await database.query(`
      SELECT "mainVideo"
      FROM "Collections"
      WHERE "id" = ? `,
      [collectionId],
    );
    if (collections.length === 1) {
      const mainVideoId: number = collections[0].mainVideo;
      if (mainVideoId != null) {
        const videos = await database.query(`
          SELECT *
          FROM "Videos"
          WHERE "id" = ?  `,
          [mainVideoId],
        );
        return new Video(videos[0]);
      }
    }

    throw new ServiceError(404, `no collection with id ${collectionId}`);
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError(500, `cannot get videos of collection: ${error.message}`);
  }
}

export async function getVideosOfCollection(collectionId: number): Promise<Video[]> {
  try {
    const collections = await database.query(`
      SELECT 1
      FROM "Collections"
      WHERE "id" = ? `,
      [collectionId],
    );
    if (collections.length === 1) {
      const videos = await database.query(`
        SELECT "V".*
        FROM "Videos" AS "V" JOIN "Collections" AS "C"
        ON "C"."id" = "V"."collection"
        WHERE "C"."id" = ? 
        ORDER BY "positionInCollection" ASC `,
        [collectionId],
      );
      return videos.map(video => new Video(video));
    }

    throw new ServiceError(404, `no collection with id ${collectionId}`);
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError(500, `cannot get videos of collection: ${error.message}`);
  }
}

export async function getRandomCollections(limit: number): Promise<Collection[]> {
  try {
    let collections: any = await database.query(`
      SELECT *
      FROM "Collections"
      ORDER BY "order" `,
      [],
      0, limit,
    );
    collections = collections.map(collection => new Collection(collection));
    
    for await (const collection of collections as Collection[]) {
      await collection.setMainVideo();
    }

    return collections;
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError(500, `cannot get random collections: ${error.message}`);
  }
}