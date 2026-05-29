import { query } from "../config/db.js";
import { AppError, asyncHandler } from "../middleware/errorMiddleware.js";
import { emitToUser } from "../socket/socketHandler.js";

const parseUserId = (value, label = "User") => {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(`${label} id is invalid`, 400);
  }

  return id;
};

const ensureReceiverExists = async (receiverId) => {
  const { rows } = await query("SELECT id, name, email FROM users WHERE id = $1", [
    receiverId,
  ]);

  if (!rows[0]) {
    throw new AppError("Selected user does not exist", 404);
  }

  return rows[0];
};

export const getUsers = asyncHandler(async (req, res) => {
  const currentUserId = req.user.id;
  const { rows } = await query(
    `SELECT
       u.id,
       u.name,
       u.email,
       u.created_at,
       COALESCE(unread.unread_count, 0)::int AS unread_count
     FROM users u
     LEFT JOIN (
       SELECT sender_id, COUNT(*) AS unread_count
       FROM messages
       WHERE receiver_id = $1 AND is_read = FALSE
       GROUP BY sender_id
     ) unread ON unread.sender_id = u.id
     WHERE u.id <> $1
     ORDER BY u.name ASC`,
    [currentUserId],
  );

  res.status(200).json({
    success: true,
    users: rows,
  });
});

export const getChatHistory = asyncHandler(async (req, res) => {
  const currentUserId = req.user.id;
  const selectedUserId = parseUserId(req.params.userId, "Selected user");

  if (selectedUserId === currentUserId) {
    throw new AppError("You cannot open a conversation with yourself", 400);
  }

  await ensureReceiverExists(selectedUserId);

  const { rows } = await query(
    `SELECT id, sender_id, receiver_id, message, is_read, created_at
     FROM messages
     WHERE (sender_id = $1 AND receiver_id = $2)
        OR (sender_id = $2 AND receiver_id = $1)
     ORDER BY created_at ASC, id ASC`,
    [currentUserId, selectedUserId],
  );

  res.status(200).json({
    success: true,
    messages: rows,
  });
});

export const sendMessage = asyncHandler(async (req, res) => {
  const senderId = req.user.id;
  const receiverId = parseUserId(req.params.receiverId, "Receiver");
  const messageText = req.body.message?.trim();

  if (receiverId === senderId) {
    throw new AppError("You cannot send messages to yourself", 400);
  }

  if (!messageText) {
    throw new AppError("Message cannot be empty", 400);
  }

  await ensureReceiverExists(receiverId);

  const { rows } = await query(
    `INSERT INTO messages (sender_id, receiver_id, message)
     VALUES ($1, $2, $3)
     RETURNING id, sender_id, receiver_id, message, is_read, created_at`,
    [senderId, receiverId, messageText],
  );

  const savedMessage = rows[0];
  emitToUser(receiverId, "newMessage", savedMessage);

  res.status(201).json({
    success: true,
    message: savedMessage,
  });
});

export const markMessagesRead = asyncHandler(async (req, res) => {
  const currentUserId = req.user.id;
  const senderId = parseUserId(req.params.userId, "Sender");

  if (senderId === currentUserId) {
    throw new AppError("Sender id must belong to another user", 400);
  }

  await ensureReceiverExists(senderId);

  const { rows } = await query(
    `UPDATE messages
     SET is_read = TRUE
     WHERE sender_id = $1 AND receiver_id = $2 AND is_read = FALSE
     RETURNING id`,
    [senderId, currentUserId],
  );

  res.status(200).json({
    success: true,
    updatedCount: rows.length,
  });
});
