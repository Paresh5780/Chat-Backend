import express from "express";

import chatRoutes from "./routes/chat.routes";
import userRoutes from "./routes/user.routes";

const app = express();

app.use(express.json());

app.use("/chat", chatRoutes);
app.use("/users", userRoutes);

export default app;