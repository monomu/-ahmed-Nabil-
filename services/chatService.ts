import { ChatConversation, ChatMessage, User } from '../types';
import { users } from './userService';

let conversations: ChatConversation[] = [];

let nextConversationId = 1;
let nextMessageId = 1;

// Helper to get user data for a conversation participant
const getParticipantData = (conversation: ChatConversation, currentUserId: number): User => {
    const otherUserId = conversation.participants.find(id => id !== currentUserId)!;
    return users.find(u => u.id === otherUserId)!;
};

export const getConversationsForUser = async (userId: number): Promise<(ChatConversation & { otherUser: User, unreadCount: number })[]> => {
    await new Promise(res => setTimeout(res, 300));
    const userConversations = conversations.filter(c => c.participants.includes(userId));
    
    const processedConversations = userConversations.map(conv => {
        const otherUser = getParticipantData(conv, userId);
        const unreadCount = conv.messages.filter(m => m.senderId !== userId && !m.isRead).length;
        return { ...conv, otherUser, unreadCount };
    });

    // Sort by most recent message
    return processedConversations.sort((a, b) => b.lastMessageTimestamp.getTime() - a.lastMessageTimestamp.getTime());
};

export const getConversationById = async (conversationId: number, currentUserId: number): Promise<(ChatConversation & { otherUser: User }) | undefined> => {
     await new Promise(res => setTimeout(res, 200));
     const conversation = conversations.find(c => c.id === conversationId);
     if (!conversation || !conversation.participants.includes(currentUserId)) {
         return undefined;
     }
     const otherUser = getParticipantData(conversation, currentUserId);
     return { ...conversation, otherUser };
};


export const sendMessage = async (conversationId: number, senderId: number, text: string): Promise<ChatMessage> => {
    await new Promise(res => setTimeout(res, 100)); // Simulate sending
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) {
        throw new Error("Conversation not found");
    }
    const newMessage: ChatMessage = {
        id: `msg${nextMessageId++}`,
        conversationId,
        senderId,
        text,
        timestamp: new Date(),
        isRead: false, // Sent, but not read yet
    };
    conversation.messages.push(newMessage);
    conversation.lastMessageTimestamp = newMessage.timestamp;
    
    const otherUserId = conversation.participants.find(id => id !== senderId)!;

    // 1. Start typing indicator
    conversation.typingUser = otherUserId;

    // 2. Simulate reply after a delay
    setTimeout(() => {
        const currentConv = conversations.find(c => c.id === conversationId);
        if (!currentConv) return;

        // 3. Stop typing indicator
        currentConv.typingUser = undefined;

        // 4. Create and send reply
        const cannedReplies = [
            "تمام، فهمت عليك.", "شكراً جزيلاً.", "حاضر، سأرى الأمر.", "تمام، متى يناسبك؟", "ممكن تفاصيل أكثر؟"
        ];
        const replyText = cannedReplies[Math.floor(Math.random() * cannedReplies.length)];
        
        const replyMessage: ChatMessage = {
            id: `msg${nextMessageId++}`,
            conversationId,
            senderId: otherUserId,
            text: replyText,
            timestamp: new Date(),
            isRead: false, // The user hasn't read this new reply yet
        };
        currentConv.messages.push(replyMessage);
        currentConv.lastMessageTimestamp = replyMessage.timestamp;

        // 5. Mark the original user's message as read
        const originalMessage = currentConv.messages.find(m => m.id === newMessage.id);
        if(originalMessage) {
            originalMessage.isRead = true;
        }

    }, 2000 + Math.random() * 1500); // Realistic delay

    return newMessage;
};

export const markConversationAsRead = async (conversationId: number, userId: number): Promise<void> => {
    await new Promise(res => setTimeout(res, 50));
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
        let changed = false;
        conversation.messages.forEach(message => {
            if (message.senderId !== userId && !message.isRead) {
                message.isRead = true;
                changed = true;
            }
        });
    }
};

export const getUnreadCount = async (userId: number): Promise<number> => {
    await new Promise(res => setTimeout(res, 100));
    let total = 0;
    conversations.forEach(conv => {
        if (conv.participants.includes(userId)) {
            total += conv.messages.filter(m => m.senderId !== userId && !m.isRead).length;
        }
    });
    return total;
};

export const startConversation = async (userId1: number, userId2: number): Promise<ChatConversation> => {
    await new Promise(res => setTimeout(res, 250));
    // Check if a conversation already exists
    let conversation = conversations.find(c => 
        c.participants.includes(userId1) && c.participants.includes(userId2)
    );

    if (conversation) {
        return conversation;
    }

    // Create a new one if not
    const newConversation: ChatConversation = {
        id: nextConversationId++,
        participants: [userId1, userId2],
        messages: [],
        lastMessageTimestamp: new Date(),
    };
    conversations.unshift(newConversation);
    return newConversation;
};