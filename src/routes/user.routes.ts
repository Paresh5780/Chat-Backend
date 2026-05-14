import { Router } from "express";

import { createUser, getUserChats } from "../controllers/user.controller";

const router = Router();

router.post("/user-create", createUser)
router.get("/:userId/chats", getUserChats);

export default router;