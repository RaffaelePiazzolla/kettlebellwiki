# Kettlebell Wiki

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white) ![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white) ![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white) ![Vimeo](https://img.shields.io/badge/Vimeo-1AB7EA?style=for-the-badge&logo=vimeo&logoColor=white) ![Heroku](https://img.shields.io/badge/Heroku-430098?style=for-the-badge&logo=heroku&logoColor=white) ![Namecheap](https://img.shields.io/badge/Namecheap-DE3723?style=for-the-badge&logo=namecheap&logoColor=white) ![EJS](https://img.shields.io/badge/EJS-8BC0D0?style=for-the-badge&logo=ejs&logoColor=white) ![HTML](https://img.shields.io/badge/HTML-E34F26?style=for-the-badge&logo=html5&logoColor=white) ![CSS](https://img.shields.io/badge/CSS-1572B6?style=for-the-badge&logo=css3&logoColor=white)

> [!NOTE]
> Kettlebell Wiki is a project initiated in 2019 and no longer available due to discontinuation in 2022. The current commit is the first public upload of the codebase after confidentiality requirements expired.

Kettlebell Wiki was a specialized subscription-based fitness platform exclusively dedicated to kettlebell workouts. The platform was commissioned to me in 2019 by a personal trainer. Over the months, I wrote the entire codebase from scratch, designing every end of the project: server code architecture, database modeling, UI/UX design, and hosting.

## Features
Kettlebell Wiki served as a comprehensive video library, offering high-quality tutorials and instructional videos for fitness enthusiasts, with a special focus on kettlebells. The main features included:

* __Comprehensive Video Library__: a curated collection of exclusive kettlebell workout tutorials and exercises created by a professional trainer for every degree of expertise.
* __Personalized Workouts__: user-specific workout plans were automatically generated for each user based on their activity.
* __Exclusive Content__: additional to workout tutorials, the platform offered other exclusive fitness-related content, such as ebooks.
* __Detailed User Control__: user activity was available to each consumer, ensuring a detailed insight of the workouts over time.

## Architectural overview

* __Node.js__ application written in __TypeScript__.
* __Express.js__ library for handling web routes and REST API endpoints.
* __EJS__ templating engine for web pages rendering.
* __MariaDB__ (MySQL) relational database.
* __Heroku__ hosting with SSL certificate.
* Independent DNS configuration with __Namecheap__.
* IP tracking with __Google Sheets__ integration.
* __Vimeo API__ integration for _private_ video hosting and visualization. 
* Automatic __emailing service__ for user-specific communications.

## License

This project is proprietary and was developed exclusively for the commissioning client; I publish it here under the [CC BY-NC-ND 4.0 License](https://creativecommons.org/licenses/by-nc-nd/4.0/).
