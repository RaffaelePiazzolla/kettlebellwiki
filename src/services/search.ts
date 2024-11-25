import * as database from './database';
import Video from '../model/Video';
import ServiceError from '../model/ServiceError';
import Collection from '../model/Collection';

const videos: Video[] = [];
const collections: Collection[] = [];

export async function search(query: string, from?: number, length?: number): Promise<{ videos: Video[], collections: Collection[] }> {
  return {
    videos: await searchVideos(query, from, length),
    collections: await searchCollection(query, from, length),
  }
}

export async function searchVideos(query: string, from?: number, length?: number): Promise<Video[]> {
  return videos.sort((a, b) => {
    return calcVideoRelevance(b, query) - calcVideoRelevance(a, query);
  }).slice(from ?? 0, length ?? Infinity);
}

export async function searchCollection(query: string, from?: number, length?: number): Promise<Collection[]> {
  const _collections = collections.sort((a, b) => {
    return calcCollectionRelevance(b, query) - calcCollectionRelevance(a, query);
  }).slice(from ?? 0, length ?? Infinity);
  for await (const collection of _collections) {
    await collection.setMainVideo();
  }
  return _collections;
}

export async function initSearch() {
  try {
    if (videos.length == 0) {
      videos.push(...(await database.query(`
        SELECT *
        FROM "Videos" `,
      )).map(video => new Video(video)));
    }
    if (collections.length == 0) {
      collections.push(...(await database.query(`
        SELECT *
        FROM "Collections" `,
      )).map(video => new Collection(video)));
    }
  } catch (error: any) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError(500, `cannot retreive videos and collections: ${error.message}`);
  }
}

function calcVideoRelevance(video: Video, query: string) {
  query = query.trim().replace(/\s{2,}/g, ' ');
  let relevance = 0;
  relevance += 2000 * +(video.id.toString() == query);  // check if query == id
  relevance += 1000 * +(video.title == query);  // check if query == title
  relevance += 10 * query.split(' ').filter(word => video.title.split(' ').includes(word)).length;  // count how many words of query there are in video title
  relevance += 2 * (video.title.split(query).length - 1); // count how many occurances of query there are in video title
  relevance += 1 * (video.description.split(query).length - 1);  // count how many occurances of query there are in video description
  return relevance;
}

function calcCollectionRelevance(collection: Collection, query: string) {
  query = query.trim().replace(/\s{2,}/g, ' ');
  let relevance = 0;
  relevance += 2000 * +(collection.id.toString() == query);  // check if query == id
  relevance += 1000 * +(collection.name == query);  // check if query == name
  relevance += 10 * query.split(' ').filter(word => collection.name.split(' ').includes(word)).length;  // count how many words of query there are in collection name
  relevance += 2 * (collection.name.split(query).length - 1); // count how many occurances of query there are in collection name
  relevance += 1 * (collection.description.split(query).length - 1);  // count how many occurances of query there are in collection description
  return relevance;
}