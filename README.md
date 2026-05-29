# ChatApp

ChatApp is a full-stack one-to-one real-time chat application built with React, Vite, Node.js, Express.js, Socket.io, and PostgreSQL. It includes JWT authentication, online user status, typing indicators, chat history, read receipts, dark mode, and responsive mobile navigation.

## Tech Stack

- Frontend: React, Vite, Context API, Axios, Socket.io Client, plain CSS
- Backend: Node.js, Express.js, Socket.io, JWT, bcryptjs
- Database: PostgreSQL, compatible with Supabase Postgres
- Deployment targets: Render for backend, Vercel or Netlify for frontend, Supabase for PostgreSQL

## Project Structure

```text
chatApp/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── config/
│   ├── socket/
│   ├── sql/
│   ├── .env.example
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   ├── .env.example
│   └── package.json
└── README.md
```

## Local Setup

### 1. Create the database

Create a PostgreSQL database named `chat_app`, then run:

```bash
psql -d chat_app -f backend/sql/schema.sql
```

### 2. Configure backend environment

Copy the backend environment file:

```bash
cp backend/.env.example backend/.env
```

Backend variables:

| Variable | Description |
| --- | --- |
| `PORT` | Express server port. |
| `DB_HOST` | PostgreSQL host for local database connections. |
| `DB_PORT` | PostgreSQL port. |
| `DB_USER` | PostgreSQL username. |
| `DB_PASSWORD` | PostgreSQL password. |
| `DB_NAME` | PostgreSQL database name. |
| `DATABASE_URL` | Optional hosted PostgreSQL connection string, useful for Supabase and Render. |
| `DB_SSL` | Set to `true` for hosted databases requiring SSL. |
| `JWT_SECRET` | Long random secret used to sign JWTs. |
| `JWT_EXPIRES_IN` | JWT lifetime, for example `7d`. |
| `CLIENT_URL` | Frontend origin allowed by CORS and Socket.io. Use a comma-separated list for local plus deployed origins. |

### 3. Configure frontend environment

Copy the frontend environment file:

```bash
cp frontend/.env.example frontend/.env
```

Frontend variables:

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Backend API base URL ending in `/api`. |
| `VITE_SOCKET_URL` | Backend Socket.io server URL. |

### 4. Install and run backend

```bash
cd backend
npm install
npm run dev
```

### 5. Install and run frontend

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal.

## REST API Reference

| Method | Endpoint | Auth | Description | Body |
| --- | --- | --- | --- | --- |
| `POST` | `/api/auth/register` | No | Register a user and return JWT plus user info. | `{ "name": "Ava", "email": "ava@example.com", "password": "secret12" }` |
| `POST` | `/api/auth/login` | No | Log in and return JWT plus user info. | `{ "email": "ava@example.com", "password": "secret12" }` |
| `GET` | `/api/messages/users` | Yes | Return all users except the authenticated user. | None |
| `GET` | `/api/messages/:userId` | Yes | Return full chat history with selected user, ordered oldest first. | None |
| `POST` | `/api/messages/send/:receiverId` | Yes | Persist a message and emit `newMessage` to the receiver if online. | `{ "message": "Hello" }` |
| `PATCH` | `/api/messages/read/:userId` | Yes | Mark unread messages from a sender as read. | None |

Authenticated requests must include:

```text
Authorization: Bearer <token>
```

## Socket.io Event Reference

| Event | Direction | Payload | Description |
| --- | --- | --- | --- |
| `connection` | Client to server | `auth: { userId }` | Registers the user in the online user map. |
| `getOnlineUsers` | Server to client | `[1, 2, 3]` | Broadcasts the full online user id list. |
| `sendMessage` | Client to server | `{ receiverId, message }` | Emits an already persisted message object to the receiver. |
| `newMessage` | Server to client | `{ id, sender_id, receiver_id, message, is_read, created_at }` | Delivers a real-time message. |
| `typing` | Client to server | `{ receiverId }` | Notifies a receiver that the sender is typing. |
| `userTyping` | Server to client | `{ senderId }` | Shows typing status for the sender. |
| `stopTyping` | Client to server | `{ receiverId }` | Notifies a receiver that the sender stopped typing. |
| `userStopTyping` | Server to client | `{ senderId }` | Hides typing status for the sender. |
| `disconnect` | Client to server | None | Removes the user from the online user map. |

## Deployment Notes

### Supabase PostgreSQL

1. Create a Supabase project.
2. Open the SQL editor and run `backend/sql/schema.sql`.
3. Copy the project database connection string.
4. Set backend environment variables:
   - `DATABASE_URL=<supabase_connection_string>`
   - `DB_SSL=true`

The app uses its own JWT authentication and database tables. It does not use Supabase Auth or Supabase Realtime.

### Render Backend

1. Create a new Blueprint or Web Service from the GitHub repository.
2. If using the included `render.yaml`, Render reads `rootDir: backend`, `buildCommand: npm install`, and `startCommand: npm start`.
3. Add `DATABASE_URL` from Supabase.
4. Set `CLIENT_URL` to the deployed frontend origin. To support local and production at the same time, use a comma-separated value such as `http://localhost:5173,https://your-app.vercel.app`.
5. Keep `DB_SSL=true` for Supabase.

### Vercel Frontend

1. Create a new Vercel project from the GitHub repository.
2. Set root directory to `frontend`.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Add `VITE_API_URL` and `VITE_SOCKET_URL` pointing to the deployed backend.

### Netlify Frontend

1. Create a new Netlify site from the GitHub repository.
2. Base directory: `frontend`.
3. Build command: `npm run build`.
4. Publish directory: `frontend/dist`.
5. Add `VITE_API_URL` and `VITE_SOCKET_URL` pointing to the deployed backend.

## Screenshots

Add screenshots after deployment:

- Login page
- Register page
- Desktop chat layout
- Mobile sidebar
- Mobile conversation view
