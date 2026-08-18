import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { SendOutlined, PaperClipOutlined } from "@ant-design/icons";
import { useContactAll } from "../hooks/useContactAll";

interface ChatMessage {
    id: number;
    sender: string;
    content: string;
    timestamp: string;
    isOwn: boolean;
}

const MessagesPage: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 1,
            sender: "John Doe",
            content: "Hello! How are you?",
            timestamp: "10:30 AM",
            isOwn: false,
        },
        {
            id: 2,
            sender: "Me",
            content: "I'm good, thanks! How about you?",
            timestamp: "10:31 AM",
            isOwn: true,
        },
        {
            id: 3,
            sender: "John Doe",
            content: "Great! Can we discuss the project?",
            timestamp: "10:32 AM",
            isOwn: false,
        },
    ]);

    const [inputValue, setInputValue] = useState("");

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const newMessage: ChatMessage = {
            id: messages.length + 1,
            sender: "Me",
            content: inputValue.trim(),
            timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
            isOwn: true,
        };

        setMessages((prev) => [...prev, newMessage]);
        setInputValue("");
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    useContactAll()
    return (
        <MainLayout>
            <div className="flex h-full flex-col">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Messages
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Send and receive WhatsApp messages
                        </p>
                    </div>

                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Online
                    </span>
                </div>

                {/* Chat Area */}
                <div className="flex-1 space-y-4 overflow-y-auto py-6">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                                    message.isOwn
                                        ? "bg-emerald-500 text-white"
                                        : "bg-gray-100 text-gray-900"
                                }`}
                            >
                                {!message.isOwn && (
                                    <p className="mb-1 text-xs font-medium text-emerald-600">
                                        {message.sender}
                                    </p>
                                )}

                                <p className="text-sm">{message.content}</p>

                                <p
                                    className={`mt-1 text-right text-xs ${
                                        message.isOwn
                                            ? "text-emerald-100"
                                            : "text-gray-400"
                                    }`}
                                >
                                    {message.timestamp}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center gap-3">
                        <button className="flex h-10 w-10 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
                            <PaperClipOutlined />
                        </button>

                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Type a message..."
                            className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:bg-white"
                        />

                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim()}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <SendOutlined />
                        </button>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default MessagesPage;