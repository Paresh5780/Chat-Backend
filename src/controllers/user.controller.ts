import { Request, Response } from "express";
import { prisma } from "../config/db";

export const createUser = async (req: Request, res: Response) => {
    try {
        const { email, name } = req.body;

        if (!email || !name) {
            return res.status(400).json({
                success: false,
                message: "Please provide both email and name",
            });
        }

        const user = await prisma.user.create({
            data: {
                email,
                name
            }
        })

        res.status(200).json({
            success: true,
            message: "hey !!!User created successfully",
            data: user
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


export const getUserChats = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const chats = await prisma.chat.findMany({
            where: {
                members: {
                    some: {
                        userId: userId
                    }
                }
            },
            include: {
                members: {
                    select: {
                        userId: true,
                    }
                }
            }
        })

        return res.status(200).json({
            success: true,
            message: "User chats retrieved successfully",
            data: chats
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

