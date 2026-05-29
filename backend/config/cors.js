const parseClientOrigins = () => {
  const rawOrigins = process.env.CLIENT_URL || "http://localhost:5173";

  return rawOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

export const clientOrigins = parseClientOrigins();

export const corsOptions = {
  origin(origin, callback) {
    if (!origin || clientOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Origin is not allowed by CORS"));
  },
  credentials: true,
};
