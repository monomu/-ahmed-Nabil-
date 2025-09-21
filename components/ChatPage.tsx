import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, ChatConversation, ChatMessage } from '../types';
import { getConversationsForUser, getConversationById, sendMessage, markConversationAsRead } from '../services/chatService';
import Spinner from './Spinner';
import { ArrowRightIcon, SendIcon, ChatBubbleIcon, CheckIcon, DoubleCheckIcon } from './icons';

interface ChatPageProps {
    currentUser: User;
    selectedConversationId: number | null;
    onSelectConversation: (conversationId: number | null) => void;
    onBack: () => void;
    onSelectUser: (userId: number) => void;
}

const timeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return `${Math.floor(interval)}س`;
    interval = seconds / 2592000;
    if (interval > 1) return `${Math.floor(interval)}ش`;
    interval = seconds / 86400;
    if (interval > 1) return `${Math.floor(interval)}ي`;
    interval = seconds / 3600;
    if (interval > 1) return `${Math.floor(interval)}س`;
    interval = seconds / 60;
    if (interval > 1) return `${Math.floor(interval)}د`;
    return `الآن`;
};

const ConversationList: React.FC<{
    conversations: (ChatConversation & { otherUser: User; unreadCount: number })[];
    selectedConversationId: number | null;
    onSelect: (id: number) => void;
}> = ({ conversations, selectedConversationId, onSelect }) => {
    return (
        <div className="bg-white border-l border-slate-200 h-full overflow-y-auto">
            <div className="p-4 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-800">الرسائل</h2>
            </div>
            {conversations.length > 0 ? (
                <ul className="divide-y divide-slate-100">
                    {conversations.map(conv => (
                        <li key={conv.id}>
                            <button
                                onClick={() => onSelect(conv.id)}
                                className={`w-full text-right p-4 flex gap-4 transition-colors ${selectedConversationId === conv.id ? 'bg-teal-50' : 'hover:bg-slate-50'}`}
                            >
                                <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                                    {conv.otherUser.name.charAt(0)}
                                </div>
                                <div className="flex-grow overflow-hidden">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-slate-800 truncate">{conv.otherUser.name}</span>
                                        <span className="text-xs text-slate-400 flex-shrink-0">{timeAgo(conv.lastMessageTimestamp)}</span>
                                    </div>
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm text-slate-500 truncate">
                                            {conv.messages[conv.messages.length - 1]?.text || 'لا توجد رسائل بعد'}
                                        </p>
                                        {conv.unreadCount > 0 && (
                                            <span className="w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                                                {conv.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                 <div className="p-8 text-center text-slate-500">
                    <p>لا توجد محادثات لعرضها.</p>
                </div>
            )}
        </div>
    );
};

const MessageView: React.FC<{
    conversation: (ChatConversation & { otherUser: User });
    currentUser: User;
    onSendMessage: (text: string) => void;
    onSelectUser: (userId: number) => void;
    onBackToList: () => void;
}> = ({ conversation, currentUser, onSendMessage, onSelectUser, onBackToList }) => {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [conversation.messages]);
    
    useEffect(() => {
        markConversationAsRead(conversation.id, currentUser.id);
    }, [conversation.id, currentUser.id, conversation.messages.length]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            onSendMessage(newMessage.trim());
            setNewMessage('');
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-100">
            <div className="p-4 border-b border-slate-200 bg-white flex items-center gap-3">
                <button onClick={onBackToList} className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full">
                    <ArrowRightIcon className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                    {conversation.otherUser.name.charAt(0)}
                </div>
                <div>
                    <button onClick={() => onSelectUser(conversation.otherUser.id)} className="font-bold text-slate-800 hover:underline">{conversation.otherUser.name}</button>
                    <p className="text-xs text-slate-500">اضغط لعرض الملف الشخصي</p>
                </div>
            </div>
            <div className="flex-grow p-4 overflow-y-auto">
                <div className="space-y-4">
                    {conversation.messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.senderId === currentUser.id ? 'bg-emerald-500 text-white rounded-br-lg' : 'bg-slate-200 text-slate-800 rounded-bl-lg'}`}>
                                <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                                <div className={`flex items-center gap-1.5 justify-end text-xs mt-1 ${msg.senderId === currentUser.id ? 'text-emerald-100' : 'text-slate-500'}`}>
                                    <span>
                                        {new Date(msg.timestamp).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {msg.senderId === currentUser.id && (
                                        msg.isRead 
                                        ? <DoubleCheckIcon className="w-4 h-4 text-blue-300" /> 
                                        : <CheckIcon className="w-4 h-4" />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 pt-2 h-14 flex items-center">
                {conversation.typingUser === conversation.otherUser.id && (
                    <div className="text-sm text-slate-500 animate-pulse">
                        يكتب الآن...
                    </div>
                )}
            </div>
            <div className="p-4 bg-white border-t border-slate-200">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="اكتب رسالتك هنا..."
                        className="w-full px-4 py-2 border border-slate-300 rounded-full bg-white text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                    />
                    <button type="submit" className="bg-teal-600 text-white rounded-full p-3 hover:bg-teal-700 transition-colors flex-shrink-0 disabled:bg-teal-300" disabled={!newMessage.trim()}>
                        <SendIcon className="w-5 h-5"/>
                    </button>
                </form>
            </div>
        </div>
    );
};

const ChatPage: React.FC<ChatPageProps> = ({ currentUser, selectedConversationId, onSelectConversation, onBack, onSelectUser }) => {
    const [conversations, setConversations] = useState<(ChatConversation & { otherUser: User; unreadCount: number })[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentConversation, setCurrentConversation] = useState<(ChatConversation & { otherUser: User }) | null>(null);

    const fetchAllData = useCallback(async () => {
        const convs = await getConversationsForUser(currentUser.id);
        setConversations(convs);

        if (selectedConversationId) {
            const currentConv = await getConversationById(selectedConversationId, currentUser.id);
             if (currentConv) {
                setCurrentConversation(currentConv);
                markConversationAsRead(currentConv.id, currentUser.id);
            }
        } else if (window.innerWidth >= 768 && convs.length > 0 && !selectedConversationId) {
            // Auto-select first conversation on desktop
            onSelectConversation(convs[0].id);
        }

        if (loading) setLoading(false);
    }, [currentUser.id, selectedConversationId, onSelectConversation, loading]);
    
    useEffect(() => {
        fetchAllData(); // Initial fetch
        const interval = setInterval(fetchAllData, 1500); // Poll for new messages/typing status
        return () => clearInterval(interval);
    }, [fetchAllData]);

    const handleSendMessage = async (text: string) => {
        if (!currentConversation) return;

        // Optimistic update
        const optimisticMessage: ChatMessage = {
            id: `temp-${Date.now()}`,
            conversationId: currentConversation.id,
            senderId: currentUser.id,
            text,
            timestamp: new Date(),
            isRead: false
        };
        setCurrentConversation(prev => prev ? { ...prev, messages: [...prev.messages, optimisticMessage] } : null);
        
        await sendMessage(currentConversation.id, currentUser.id, text);
        // Data will be re-synced by the polling interval
    };

    // Responsive Logic: On mobile, show only one pane at a time.
    const showMessageView = selectedConversationId !== null;

    return (
        <div className="container mx-auto px-4 py-8">
            <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-teal-700 font-bold mb-4">
                <ArrowRightIcon className="w-5 h-5 transform rotate-180"/>
                <span>العودة للرئيسية</span>
            </button>
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden" style={{ height: 'calc(100vh - 200px)'}}>
                <div className="md:grid md:grid-cols-3 lg:grid-cols-4 h-full">
                    {/* Conversation List Pane */}
                    <div className={`${showMessageView ? 'hidden' : 'block'} md:block md:col-span-1 lg:col-span-1 h-full`}>
                         {loading ? <div className="flex justify-center items-center h-full"><Spinner /></div> : <ConversationList conversations={conversations} selectedConversationId={selectedConversationId} onSelect={onSelectConversation} />}
                    </div>
                    {/* Message View Pane */}
                    <div className={`${!showMessageView ? 'hidden' : 'block'} md:block md:col-span-2 lg:col-span-3 h-full`}>
                        {currentConversation ? (
                            <MessageView 
                                conversation={currentConversation} 
                                currentUser={currentUser} 
                                onSendMessage={handleSendMessage} 
                                onSelectUser={onSelectUser}
                                onBackToList={() => onSelectConversation(null)}
                            />
                        ) : (
                             <div className="hidden md:flex flex-col justify-center items-center h-full bg-slate-50 p-8 text-center">
                                <ChatBubbleIcon className="w-16 h-16 text-slate-300 mb-4"/>
                                <h2 className="text-2xl font-bold text-slate-700">مرحباً بك في رسائل سوق هرج</h2>
                                <p className="text-slate-500 mt-2">اختر محادثة من القائمة للبدء.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;