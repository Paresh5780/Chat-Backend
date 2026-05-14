import { Router } from "express";
import { sendMessage, createChat, getChatMessages, markMessageRead } from "../controllers/chat.controller";

const router = Router();

router.post("/create", createChat)
router.post("/:chatId/message/send", sendMessage);
router.get("/:chatId/messages", getChatMessages);
router.post("/:chatId/message/:messageId/read", markMessageRead);

export default router;