import env from '../config/env';
import print from '../utils/print';
import * as database from '../services/database';
import { Application } from 'express';

export default async function initDatabase(app: Application) {
  try {
    
    print.loading(`testing connection to database '${env.database.name}'`);
    await database.testConnection();
    print(`connected to database '${env.database.name}'`);

    // Create tables
    await database.query(`
      CREATE TABLE IF NOT EXISTS "Users" (
        "id" INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
        "name" VARCHAR(255) NOT NULL,
        "surname" VARCHAR(255) NOT NULL,
        "password" CHAR(64) NOT NULL CHECK (LENGTH("password") = 64),
        "email" VARCHAR(255) NOT NULL UNIQUE,
        "phone" VARCHAR(20) NULL,
        "gender" ENUM('male', 'female', 'other') NOT NULL,
        "country" CHAR(2) NOT NULL,
        "isValidated" BOOLEAN NOT NULL DEFAULT FALSE,
        "isAdmin" BOOLEAN NOT NULL DEFAULT FALSE,
        "trainingPlan" INT NULL REFERENCES "TrainingPlans"("id")
      );
    `);
    await database.query(`
      CREATE TABLE IF NOT EXISTS "Videos" (
        "id" INT PRIMARY KEY NOT NULL,
        "title" VARCHAR(255) NOT NULL UNIQUE,
        "vimeoId" INT NOT NULL UNIQUE,
        "vimeoThumbnailId" INT NULL UNIQUE,
        "description" TEXT NULL,
        "language" CHAR(4) NULL,
        "views" INT NOT NULL DEFAULT 0 CHECK ("views" >= 0),
        "positionInCollection" INT NULL CHECK ("positionInCollection" > 0),
        "isFree" BOOLEAN NOT NULL DEFAULT FALSE,
        "collection" INT NULL REFERENCES "Collections"("id"),
        "course" INT NULL REFERENCES "Courses"("id"),
        CONSTRAINT collection_constraint UNIQUE ("collection", "positionInCollection"),
        CHECK (
          (("positionInCollection" IS NULL) AND ("collection" IS NULL)) OR 
          (("positionInCollection" IS NOT NULL) AND ("collection" IS NOT NULL))
        ),
        FULLTEXT ("title")
      );
    `);
    await database.query(`
      CREATE TABLE IF NOT EXISTS "TrainingPlans" (
        "id" INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
        "description" TEXT NULL,
        "isStandard" BOOLEAN NOT NULL DEFAULT FALSE
      );
    `);
    await database.query(`
      CREATE TABLE IF NOT EXISTS "Workouts" (
        "id" INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
        "video" INT NOT NULL REFERENCES "Videos"("id"),
        "trainingPlan" INT NOT NULL REFERENCES "TrainingPlans"("id")
      );
    `);
    await database.query(`
      CREATE TABLE IF NOT EXISTS "Views" (
        "id" INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
        "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "user" INT NOT NULL REFERENCES "Users"("id"),
        "video" INT NOT NULL REFERENCES "Videos"("id")
      );
    `);
    await database.query(`
      CREATE TABLE IF NOT EXISTS "Courses" (
        "id" INT PRIMARY KEY NOT NULL,
        "name" VARCHAR(255) NOT NULL UNIQUE,
        "mainVideo" INT NOT NULL REFERENCES "Videos"("id"),
        "description" TEXT NULL,
        "difficulty" INT NOT NULL CHECK ("difficulty" BETWEEN 1 AND 100),
        FULLTEXT ("name")
      );
    `);
    await database.query(`
      CREATE TABLE IF NOT EXISTS "Collections" (
        "id" INT PRIMARY KEY NOT NULL,
        "name" VARCHAR(255) NOT NULL UNIQUE,
        "mainVideo" INT NULL REFERENCES "Videos"("id"),
        "description" TEXT NULL,
        "order" INT NULL,
        FULLTEXT ("name")
      );
    `);
    await database.query(`
      CREATE TABLE IF NOT EXISTS "Payments" (
        "id" INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
        "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "expiration" DATETIME NOT NULL,
        "user" INT NOT NULL REFERENCES "Users"("id"),
        "product" INT NOT NULL REFERENCES "Products"("id")
      );
    `);
    await database.query(`
      CREATE TABLE IF NOT EXISTS "Products" (
        "id" INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
        "name" VARCHAR(255) NOT NULL UNIQUE,
        "pricePerMonth" INT NOT NULL CHECK ("pricePerMonth" >= 0)
      );
    `);

  } catch (error: any) {
    print.error(`cannot connect to database ${env.database.name}: ${error?.message}`);
  }
}; 