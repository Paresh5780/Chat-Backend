import { Request, Response } from "express";
import { firestore } from "../config/firebase";
import { prisma } from "../config/db";
import admin from "firebase-admin"

export const createChat = async (req: Request, res: Response) => {
    try {

        const { userAId, userBId } = req.body;

        if (!userAId || !userBId) {
            return res.status(400).json({
                success: false,
                message: "Please provide both user IDs",
            });
        }

        const existingChat = await prisma.chat.findFirst({
            where: {
                members: {
                    every: {
                        userId: {
                            in: [userAId, userBId]
                        }
                    }
                }
            },
            include: {
                members: true
            }
        })

        if (existingChat && existingChat.members.length === 2) {
            return res.status(200).json({
                success: true,
                message: "Chat already exists",
                data: existingChat
            })
        }

        const chat = await prisma.chat.create({
            data: {
                members: {
                    create: [
                        {
                            userId: userAId
                        },
                        {
                            userId: userBId
                        }
                    ]
                }
            }
        })

        return res.status(200).json({
            success: true,
            message: "hey !!! Chat created successfully",
            data: chat
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

export const sendMessage = async (req: Request, res: Response) => {
    try {
        const { chatId } = req.params;
        const { senderId, text } = req.body;

        const messageRef = firestore
            .collection("messages")
            .doc(chatId as string)
            .collection("chat_messages")
            .doc();

        const payload = {
            id: messageRef.id,
            chatId,
            senderId,
            text,
            timestamp: new Date(),
            readBy: [senderId]
        }

        await messageRef.set(payload);

        res.status(200).json({
            success: true,
            message: "Message sent successfully",
            data: payload
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

export const getChatMessages = async (req: Request, res: Response) => {
    try {
        const { chatId } = req.params;

        const limit = Number(req.query.limit) || 50;

        const snapshot = await firestore
            .collection("messages")
            .doc(chatId as string)
            .collection("chat_messages")
            .orderBy("timestamp", "asc")
            .limit(limit)
            .get();

        const messages = snapshot.docs.map((doc) => doc.data());

        res.status(200).json({
            success: true,
            message: "Messages retrieved successfully",
            data: messages
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

export const markMessageRead = async (req: Request, res: Response) => {
    try {
        const { chatId, messageId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "Please provide user ID"
            })
        }

        const messageRef = firestore
            .collection("messages")
            .doc(chatId as string)
            .collection("chat_messages")
            .doc(messageId as string);

        await messageRef.update({
            readBy: admin.firestore.FieldValue.arrayUnion(userId)
        })

        res.status(200).json({
            success: true,
            message: "Message marked as read successfully"
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

export const updateLastSeen = async (req: Request, res: Response) => {
    try {
        const { chatId } = req.params;
        const { userId, messageId } = req.body;

        const docId = `${chatId}_${userId}`
        await firestore
            .collection("last_seen")
            .doc(docId)
            .set({
                chatId,
                messageId,
                userId,
                updatedAt: new Date(),
            })

        res.status(200).json({
            success: true,
            message: "Last seen updated successfully"
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}
