# SYSTEM DESCRIPTION:

**LikelyWho** is a distributed social game where groups of friends answer fun questions such as *“Who among us is most likely to finish the wine bottle first?”*.  
Each group member votes another participant. After 24 hours, the question closes and the player with the most votes gets points.  

This documentation describes microservices of the system: **Authentication**, **Question**, **User** and **Voting** services, including the **API-Gateway** container. 

---

# USER STORIES

1) As a user, I want to create an account using my email or social login, so that I can participate in voting sessions securely.  
2) As a user, I want to log in securely, so that my scores and history are saved.  
3) As a user, I want to reset my password in case I forget it, so that I can regain access to my account.  
4) As a user, I want to edit my profile (e.g., name, profile picture), so that my friends can recognize me easily in the app.  
5) As a user, I want to log out of my account securely, so that I can protect my data on shared devices.  
6) As a user, I want to create a voting session and invite my friends via a link or code, so that we can vote together and I can become the session leader.  
7) As a user, I want to join an existing voting session using an invitation code, so that I can participate in my friend’s game.  
8) As a session leader, I want to choose a pre-defined category (e.g., "fun," "career," "future predictions") so that the voting questions are relevant to my group.  
9) As a user, I want to ask the system to generate a category randomly, so that the voting questions are relevant to my group.  
10) As a session leader, I want to disable the self-voting choice, so that no participant can vote for themselves.  
11) As a user, I want the app to randomly generate a fun question based on our chosen topic, so that we always have different questions.  
12) As a user, I want to vote for one of my friends in response to the question, so that my choice is counted.  
13) As a user, I want to see a leaderboard of my friends, so that I can compare scores.  
14) As a user, I want to have all groups in the home page, so that I can access them easily.  

---

# CONTAINERS:

## CONTAINER_NAME: Authentication-Service

### DESCRIPTION
Handles all functionalities related to account creation, login, logout, password reset, and secure session management.  
It integrates with the user-service for user profile persistence.

### USER STORIES
1) As a user, I want to create an account using my email or social login, so that I can participate in voting sessions securely.  
2) As a user, I want to log in securely, so that my scores and history are saved.  
3) As a user, I want to reset my password in case I forget it, so that I can regain access to my account.  
5) As a user, I want to log out of my account securely, so that I can protect my data on shared devices.  

### PORTS
`4001:4001`

### PERSISTENCE EVALUATION
This service does not require its own persistence. User data is stored in the **user-service**.  
It only manages authentication, sessions, and password reset.

### MICROSERVICES

#### MICROSERVICE: auth-service
- TYPE: backend  
- DESCRIPTION: Manages authentication flows, JWT tokens, password reset, and logout.  
- PORTS: 4001  
- TECHNOLOGICAL SPECIFICATION:  
  - Node.js with Express  
  - JWT for token management  
  - Bcrypt for password hashing (when local login is enabled)  
  - Dockerized with Node base image  

- SERVICE ARCHITECTURE:  
  - `index.ts` defines endpoints for login, signup, logout, password reset, and token validation.    
  - Middleware ensures session persistence with JWT verification.  

- ENDPOINTS

| HTTP METHOD | URL     | Description                          | User Stories |
|-------------|---------|--------------------------------------|--------------|
| POST        | /signup | Register a new user                  | 1            |
| POST        | /login  | Login, return JWT                    | 2            |
| POST        | /logout | End session and invalidate token      | 5            |
| POST        | /reset  | Send password reset request           | 3            |

## CONTAINER_NAME: User-Service

### DESCRIPTION
Manages user accounts, profiles, and leaderboards.  
It integrates with the authentication service for secure login/signup and with voting-service to update scores after each session.

### USER STORIES
4) As a user, I want to edit my profile (e.g., name, profile picture), so that my friends can recognize me easily in the app.  
13) As a user, I want to see a leaderboard of my friends, so that I can compare scores.  
14) As a user, I want to have all groups in the home page, so that I can access them easily.  

### PORTS
`4002:4002`

### PERSISTENCE EVALUATION
Requires persistent storage for user data, including profile info and leaderboard stats.  
Stored in PostgreSQL via Prisma ORM.

### MICROSERVICES

#### MICROSERVICE: user-service
- TYPE: backend  
- DESCRIPTION: Provides CRUD operations on users, manages leaderboards, and stores user-group memberships.  
- PORTS: 4002  
- TECHNOLOGICAL SPECIFICATION:  
  - Node.js with Express  
  - Prisma ORM  
  - PostgreSQL  
  - Dockerized with Node base image  

- SERVICE ARCHITECTURE:  
  - `index.ts` exposes REST routes for profile, leaderboard, and groups.  
  - Prisma schema includes `User` and `Membership`.  
  - Integration with voting-service to update user scores after votes.  

- ENDPOINTS

| HTTP METHOD | URL                    | Description                                   | User Stories |
|-------------|------------------------|-----------------------------------------------|--------------|
| GET         | /users/:id/profile     | Get user profile                              | 4            |
| PATCH       | /users/:id/profile     | Edit user profile (name, picture)             | 4            |
| GET         | /users/:id/leaderboard | Get leaderboard                               | 13           |
| GET         | /users/:id/groups      | Retrieve all groups the user belongs to       | 14           |

- DB STRUCTURE:

**_User_** : | id | email | name | avatarUrl | score | createdAt | updatedAt |  
**_Membership_** : | id | userId | groupId | role |  

## CONTAINER_NAME: Question-Service

### DESCRIPTION
Owns the lifecycle of **sessions** and **questions** inside groups.  
It lets leaders create a session and invite users, pick (or randomly generate) categories, generate the actual fun question, and optionally disable self-voting. It collaborates with voting-service for vote collection.

### USER STORIES
6) As a user, I want to create a voting session and invite my friends via a link or code, so that we can vote together and I can become the session leader.  
7) As a user, I want to join an existing voting session using an invitation code, so that I can participate in my friend’s game.  
8) As a session leader, I want to choose a pre-defined category (e.g., "fun," "career," "future predictions") so that the voting questions are relevant to my group.  
9) As a user, I want to ask the system to generate a category randomly, so that the voting questions are relevant to my group.  
10) As a session leader, I want to disable the self-voting choice, so that no participant can vote for themselves.  
11) As a user, I want the app to randomly generate a fun question based on our chosen topic, so that we always have different questions.  

### PORTS
`4003:4003`

### PERSISTENCE EVALUATION
Requires persistent storage for **sessions**, **participants**, and **question metadata** (topic/category, self-voting flag).  
Stored in PostgreSQL via Prisma ORM.

### MICROSERVICES

#### MICROSERVICE: question-service
- TYPE: backend  
- DESCRIPTION: Creates/updates sessions, manages categories/topics, generates the question text, and enforces self-voting rules at question level.  
- PORTS: 4003  
- TECHNOLOGICAL SPECIFICATION:  
  - Node.js with Express  
  - Prisma ORM  
  - PostgreSQL  
  - Dockerized with Node base image  

- SERVICE ARCHITECTURE:  
  - `index.ts` exposes REST endpoints for session creation/join, category selection/randomization, question generation, and status retrieval.  
  - Collaborates with voting-service (question ID and self-vote flag).

- ENDPOINTS

| HTTP METHOD | URL                               | Description                                              | User Stories |
|-------------|------------------------------------|----------------------------------------------------------|--------------|
| POST        | /sessions                          | Create a new session (leader, group, code generation)    | 6            |
| POST        | /sessions/:id/join                 | Join a session via code (adds participant)               | 7            |
| POST        | /sessions/:id/category             | Set predefined category/topic                            | 8            |
| POST        | /sessions/:id/category/random      | Generate a random category                               | 9            |
| PATCH       | /sessions/:id/selfVoting           | Enable/disable self-voting for the session/question      | 10           |
| POST        | /sessions/:id/questions/generate   | Generate the question text from category/topic           | 11           |
| GET         | /sessions/:id/questions/current    | Get current question + self-vote flag                    | 10, 11       |

- DB STRUCTURE (logical model)

**_Session_** : | id | groupId | leaderId | code | createdAt |  
**_SessionParticipant_** : | id | sessionId | userId | joinedAt |  
**_Question_** : | id | sessionId | text | category | selfVotingDisabled | createdAt |

## CONTAINER_NAME: Voting-Service

### DESCRIPTION
Owns the **vote lifecycle** for a session’s current question.  
It records and validates votes (one per voter per question) and enforces the session/question expiration rule (no votes after the 24h window defined by question-service).  
It integrates with user-service to update scores after votes.

### USER STORIES
12) As a user, I want to vote for one of my friends in response to the question, so that my choice is counted.  

### PORTS
`4004:4004`

### PERSISTENCE EVALUATION
Requires persistent storage for **votes** and their associations with users and questions.  
Stored in PostgreSQL via Prisma ORM.

### MICROSERVICES

#### MICROSERVICE: voting-service
- TYPE: backend  
- DESCRIPTION: Records/updates votes, enforces eligibility and timing rules, and validates voting window against question-service’s expiration. Publishes result events to user-service (for scoring).  
- PORTS: 4004  
- TECHNOLOGICAL SPECIFICATION:  
  - Node.js with Express  
  - Prisma ORM  
  - PostgreSQL  
  - Dockerized with Node base image  

- SERVICE ARCHITECTURE:  
  - `index.ts` exposes REST routes for submitting votes.  
  - Validates voting window against `expiresAt` provided by question-service.  
  - On finalize, emits event to user-service for score update.

- ENDPOINTS

| HTTP METHOD | URL                 | Description                               | User Stories |
|-------------|----------------------|-------------------------------------------|--------------|
| POST        | /votes/:questionId   | Submit a vote (one per voter; validates)  | 12           |

- DB STRUCTURE (logical model)

**_Vote_** : | id | questionId | voterId | targetId | createdAt |

## CONTAINER_NAME: API-Gateway

### DESCRIPTION
Provides a single entry point for the frontend to interact with all backend microservices.  
It proxies requests to **auth-service**, **user-service**, **question-service**, and **voting-service**.  
Handles CORS, authentication propagation, health checks, and error normalization.

### USER STORIES
*(This container does not own user stories directly; it supports all user stories [1–14] by routing frontend calls to the appropriate microservice.)*

### PORTS
`8080:8080`

### PERSISTENCE EVALUATION
The API-Gateway container does not include a database.  
It does not persist business data, only forwards and transforms requests.

### MICROSERVICES

#### MICROSERVICE: api-gateway
- TYPE: middleware  
- DESCRIPTION: Provides a single point of access to the LikelyWho platform. Routes requests to the correct microservice and normalizes responses.  
- PORTS: 8080  
- TECHNOLOGICAL SPECIFICATION:  
  - Node.js with Express  
  - `node-fetch` for service-to-service calls  
  - CORS enabled for frontend origins  
  - JSON error and 404 handling  
  - Dockerized with Node base image  

- SERVICE ARCHITECTURE:  
  - Proxies authentication, user, session/question, and voting endpoints.  
  - Normalizes responses and errors for the frontend.

- ENDPOINTS

| HTTP METHOD | URL                                 | Description                                           | User Stories |
|-------------|--------------------------------------|-------------------------------------------------------|--------------|
| GET         | /health                             | API Gateway healthcheck                               | —            |
| POST        | /api/auth/register                  | Register new user (delegates to auth-service)         | 1            |
| POST        | /api/auth/login                     | Login user (delegates to auth-service)                | 2            |
| POST        | /api/auth/reset                     | Reset password (delegates to auth-service)            | 3            |
| POST        | /api/auth/logout                    | Logout user (delegates to auth-service)               | 5            |
| GET         | /api/users/:userId/profile          | Get user profile (via user-service)                   | 4            |
| PATCH       | /api/users/:userId/profile          | Update user profile                                   | 4            |
| GET         | /api/users/:userId/leaderboard      | Get leaderboard (via user-service)                    | 13           |
| GET         | /api/users/:userId/groups           | Retrieve all groups the user belongs to               | 14           |
| POST        | /api/sessions                       | Create new voting session (via question-service)      | 6            |
| POST        | /api/sessions/:id/join              | Join an existing voting session (via question-service)| 7            |
| POST        | /api/sessions/:id/category          | Set predefined category/topic                         | 8            |
| POST        | /api/sessions/:id/category/random   | Generate a random category                            | 9            |
| PATCH       | /api/sessions/:id/selfVoting        | Enable/disable self-voting for the session            | 10           |
| POST        | /api/sessions/:id/questions/generate| Generate a fun question                               | 11           |
| GET         | /api/sessions/:id/questions/current | Get current question                                  | 10, 11       |
| POST        | /api/votes/:questionId              | Submit a vote (via voting-service)                    | 12           |
