import * as database from './database';
import User from '../model/User';
import TrainingPlan from '../model/TrainingPlan';
import Video from '../model/Video';
import { sha256 } from '../utils';
import ServiceError from '../model/ServiceError';
import * as VideoService from '../services/video';

export async function signIn({ name, surname, email, password, phone, country, gender }): Promise<number> {
  try {
    await database.query(`
      INSERT INTO "Users" ("name", "surname", "email", "password", "phone", "country", "gender", "isAdmin")
      VALUES (?, ?, ?, ?, ?, ?, ?, ?) `,
      [name, surname, email.toLowerCase(), sha256(password), phone, country.toUpperCase(), gender, true],
    );
    const ids = await database.query(`
      SELECT MAX("id") AS "id"
      FROM "Users" `,
    );
    return ids[0].id;
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError(500, `cannot sign user: ${error.message}`);
  }
}

export async function login(email: string, password: string): Promise<number> {
  try {
    const users = await database.query(`
      SELECT "id"
      FROM "Users"
      WHERE "email" = ? 
      AND "password" = ? `,
      [email, sha256(password)],
    );
    if (users.length === 1) {
      return users[0].id;
    }
    throw new ServiceError(404, `no user with email ${email}`);
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError(500, `cannot log user: ${error.message}`);
  }
}

export async function getHistroy(userId: number, from?: number, length?: number): Promise<Video[]> {
  try {
    const videos = await database.query(`
      SELECT "V".*, "Vs"."timestamp" AS "visualizationDate"
      FROM ("Users" AS "U" JOIN "Views" AS "Vs"
      ON "U"."id" = "Vs"."user") JOIN "Videos" AS "V"
      ON "V"."id" = "Vs"."video"
      WHERE "U"."id" = ?
      ORDER BY "timestamp" DESC
      ${from != null ? 'LIMIT ?, ?' : ''} `,
      from == null ? [userId] : [userId, from, length],
    );
    return videos.map(video => new Video(video));
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError(500, `cannot get user history: ${error.message}`);
  }
}

export async function addVideoToUserHistory(userId: number, videoId: number): Promise<boolean> {
  try {
    await database.query(`
      UPDATE "Videos"
      SET "views" = "views" + 1
      WHERE "id" = ? `,
      [videoId],
    );
    const views = await database.query(`
      SELECT 1
      FROM "Views"
      WHERE "user" = ?
      AND "video" = ? `,
      [userId, videoId],
    );
    if (views.length === 0) {
      await database.query(`
        INSERT INTO "Views" ("user", "video")
        VALUES (?, ?) `,
        [userId, videoId],
      );
    } else {
      await database.query(`
        UPDATE "Views"
        SET "timestamp" = CURRENT_TIMESTAMP
        WHERE "user" = ?
        AND "video" = ? `,
        [userId, videoId],
      );
    }
    return true;
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError(500, `cannot add video to user hisotry: ${error.message}`);
  }
}

export async function deleteHistory(userId: number): Promise<boolean> {
  try {
    await database.query(`
      DELETE FROM "Views"
      WHERE "user" = ? `,
      [userId],
    );
    return true;
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError(500, `cannot delete user history: ${error.message}`);
  }
}

export async function getTrainingPlan(userId: number): Promise<TrainingPlan> {
  try {
    const trainingPlan = new TrainingPlan();

    const plans = await database.query(`
      SELECT "T".*
      FROM "TrainingPlans" AS "T" JOIN "Users" AS "U"
      ON "T"."id" = "U"."trainingPlan"
      WHERE "U"."id" = ?`,
      [userId],
    );

    if (plans.length === 1) {
      trainingPlan.setProps({
        id: plans[0].id,
        description: plans[0].description,
        isStandard: plans[0].isStandard,
      });

      const videos = await database.query(`
        SELECT "V".*
        FROM ("Videos" AS "V" JOIN "Workouts" AS "W"
        ON "V"."id" = "W"."video") JOIN "Users" AS "U"
        ON "U"."id" = "W"."trainingPlan"
        WHERE "U"."id" = ?`,
        [userId],
      );

      trainingPlan.setProps({
        videos: videos.map(video => new Video(video)),
      });

      return trainingPlan;
    }
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError(500, `cannot get user training plan: ${error.message}`);
  }
}

export async function getRandomTrainingPlan(limit: number): Promise<TrainingPlan> {
  try {
    return new TrainingPlan({
      videos: await VideoService.getRandomVideos(limit),
    });
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError(500, `cannot get user training plan: ${error.message}`);
  }
}

export async function isAdmin(userId: number): Promise<boolean> {
  try {
    const users = await database.query(`
      SELECT "isAdmin"
      FROM "Users"
      WHERE "id" = ? `,
      [userId],
    );
    return users[0].isAdmin === 1;
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError(500, `cannot know if user is validated: ${error.message}`);
  }
}

export async function isValidated(userId: number): Promise<boolean> {
  try {
    const users = await database.query(`
      SELECT "isValidated"
      FROM "Users"
      WHERE "id" = ? `,
      [userId],
    );
    return users[0].isValidated === 1;
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError(500, `cannot know if user is validated: ${error.message}`);
  }
}

export async function validate(userId: number): Promise<boolean> {
  try {
    await database.query(`
      UPDATE "Users"
      SET "isValidated" = 1
      WHERE "id" = ? `,
      [userId],
    );
    return true;
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError(500, `cannot validate user: ${error.message}`);
  }
}

export async function changePassword(userId: number, newPassword: string): Promise<boolean> {
  try {
    await database.query(`
      UPDATE "Users"
      SET "password" = ?
      WHERE "id" = ? `,
      [sha256(newPassword), userId],
    );
    return true;
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError(500, `cannot change user password: ${error.message}`);
  }
}

export async function deleteUser(userId: number): Promise<boolean> {
  try {
    await database.query(`
      DELETE FROM "Users"
      WHERE "id" = ? `,
      [userId],
    );
    return true;
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError(500, `cannot delete user: ${error.message}`);
  }
}

export async function getUser(userId: number): Promise<User> {
  try {
    const users = await database.query(`
      SELECT *
      FROM "Users"
      WHERE "id" = ? `,
      [userId],
    );
    return new User(users[0]);
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError(500, `cannot get user info: ${error.message}`);
  }
}

export async function getUserIdFromEmail(email: string): Promise<number> {
  try {
    const users = await database.query(`
      SELECT "id"
      FROM "Users"
      WHERE "email" = ? `,
      [email],
    );
    return parseInt(users[0].id);
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError(500, `cannot get user id: ${error.message}`);
  }
}

export async function emailExists(email: string): Promise<boolean> {
  try {
    const emails = await database.query(`
      SELECT 1
      FROM "Users"
      WHERE "email" = ? `,
      [email]
    );
    return emails.length == 1;
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError(500, `cannot get user info: ${error.message}`);
  }
}