import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Zod schema for message validation
const messageSchema = z.object({
  content: z.string().optional(),
  attachment: z.string().optional(), // Could be a URL for the file
  senderId: z.number(),
  receiverId: z.number(),
}).refine(data => data.content || data.attachment, {
  message: "Either content or attachment must be provided",
  path: ["content", "attachment"],
});

// Send message
export const sendMessage = async (req, res) => {
  // Safe parse request body using Zod
  const validationResult = messageSchema.safeParse(req.body);

  if (!validationResult.success) {
    return res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors: validationResult.error.errors,
    });
  }

  try {
    const { content, attachment, senderId, receiverId } = validationResult.data;

    // Create message in database
    const message = await prisma.message.create({
      data: {
        content: content || null,
        attachment: attachment || null,
        senderId,
        receiverId,
      },
      include: {
        sender: true,
        receiver: true,
      }
    });

    // Emit the real-time message event via WebSocket
    req.app.get('socketio').emit('new_message', message);

    return res.status(201).json({
      status: "success",
      data: message,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

// Get messages between two users
export const getMessages = async (req, res) => {
  const { senderId, receiverId } = req.params;

  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: parseInt(senderId), receiverId: parseInt(receiverId) },
          { senderId: parseInt(receiverId), receiverId: parseInt(senderId) },
        ],
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return res.status(200).json({
      status: "success",
      data: messages,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};
