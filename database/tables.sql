CREATE TABLE `Users` (
  `id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `surname` VARCHAR(255) NOT NULL,
  `password` CHAR(64) NOT NULL CHECK (LENGTH(`password`) = 64),
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `phone` VARCHAR(20) NULL,
  `gender` ENUM('male', 'female', 'other') NOT NULL,
  `country` CHAR(2) NOT NULL CHECK (LENGTH(`country`) = 2),
  `isValidated` BOOLEAN NOT NULL DEFAULT FALSE,
  `isAdmin` BOOLEAN NOT NULL DEFAULT FALSE,
  `trainingPlan` INT NULL REFERENCES `TrainingPlans`(`id`)
);

CREATE TABLE `Videos` (
  `id` INT PRIMARY KEY NOT NULL,
  `title` VARCHAR(255) NOT NULL UNIQUE,
  `vimeoId` INT NOT NULL UNIQUE,
  `vimeoThumbnailId` INT NULL UNIQUE,
  `description` TEXT NULL,
  `language` VARCHAR(4) NULL,
  `views` INT NOT NULL DEFAULT 0 CHECK (`views` >= 0),
  `positionInCollection` INT NULL CHECK (`positionInCollection` > 0),
  `isFree` BOOLEAN NOT NULL DEFAULT FALSE,
  `collection` INT NULL REFERENCES `Collections`(`id`),
  `course` INT NULL REFERENCES `Courses`(`id`),
  CONSTRAINT collection_constraint UNIQUE (`collection`, `positionInCollection`),
  CHECK (
    ((`positionInCollection` IS NULL) AND (`collection` IS NULL)) OR 
    ((`positionInCollection` IS NOT NULL) AND (`collection` IS NOT NULL))
  ),
  FULLTEXT (`title`)
);

CREATE TABLE `TrainingPlans` (
  `id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `description` TEXT NULL,
  `isStandard` BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE `Workouts` (
  `id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `video` INT NOT NULL REFERENCES `Videos`(`id`),
  `trainingPlan` INT NOT NULL REFERENCES `TrainingPlans`(`id`)
);

CREATE TABLE `Views` (
  `id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `user` INT NOT NULL REFERENCES `Users`(`id`),
  `video` INT NOT NULL REFERENCES `Videos`(`id`)
);

CREATE TABLE `Courses` (
  `id` INT PRIMARY KEY NOT NULL,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `mainVideo` INT NOT NULL REFERENCES `Videos`(`id`),
  `description` TEXT NULL,
  `difficulty` INT NOT NULL CHECK (`difficulty` BETWEEN 1 AND 100),
  FULLTEXT (`name`)
);

CREATE TABLE `Collections` (
  `id` INT PRIMARY KEY NOT NULL,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `mainVideo` INT NULL REFERENCES `Videos`(`id`),
  `description` TEXT NULL,
  `order` INT NULL,
  FULLTEXT (`name`)
);

CREATE TABLE `Payments` (
  `id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expiration` DATETIME NOT NULL,
  `user` INT NOT NULL REFERENCES `Users`(`id`),
  `product` INT NOT NULL REFERENCES `Products`(`id`)
);

CREATE TABLE `Products` (
  `id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `pricePerMonth` INT NOT NULL CHECK (`pricePerMonth` >= 0)
);

DELIMITER $$
  CREATE OR REPLACE FUNCTION CALC_VIDEO_RELEVANCE(q VARCHAR(255), id INT, title VARCHAR(255), description TEXT) RETURNS INT DETERMINISTIC
  BEGIN
    DECLARE relevance INT;
    SET relevance = 0;
    
    IF title LIKE CONCAT('%', q, '%') THEN
      SET relevance = relevance + 10;
    ELSEIF description LIKE CONCAT('%', q, '%') THEN
      SET relevance = relevance + 1;
    ELSEIF id = q THEN
      SET relevance = relevance + 20;
    END IF;
      
    RETURN relevance;
  END$$
DELIMITER ;

DELIMITER $$
  CREATE OR REPLACE FUNCTION CALC_COLLECTION_RELEVANCE(q VARCHAR(255), id INT, name VARCHAR(255), description TEXT) RETURNS INT DETERMINISTIC
  BEGIN
    DECLARE relevance INT;
    SET relevance = 0;
    
    IF name LIKE CONCAT('%', q, '%') THEN
      SET relevance = relevance + 10;
    ELSEIF description LIKE CONCAT('%', q, '%') THEN
      SET relevance = relevance + 1;
    ELSEIF id = q THEN
      SET relevance = relevance + 20;
    END IF;
      
    RETURN relevance;
  END$$
DELIMITER ;