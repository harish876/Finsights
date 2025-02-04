"use client";

import { useState } from "react";
import { useChat } from "ai/react";
import {
  ChatContainer,
  ChatForm,
  ChatMessages,
  PromptSuggestions,
} from "@/components/ui/chat";
import { MessageInput } from "@/components/ui/message-input";
import { MessageList } from "@/components/ui/message-list";
import { MessageSquare } from "lucide-react";
import type React from "react"; // Added import for React

interface Message {
  content: string;
  role: string;
}

export default function CustomChat({ id }: { id: number }) {
  const { messages, setMessages, input, setInput, stop, files, setFiles } =
    useChat();
  const [isLoading, setIsLoading] = useState(false);

  const isEmpty = messages.length === 0;

  const handleSendMessage = async (text: string) => {
    if (!text?.trim()) return;

    try {
      setIsLoading(true);

      // Add user message to the chat immediately
      const userMessage = { role: "user", content: text };
      setMessages((prevMessages) => [...prevMessages, userMessage]);

      // Clear input after sending
      setInput("");

      const myHeaders = new Headers();
      myHeaders.append("accept", "application/json");
      myHeaders.append("Content-Type", "application/json");

      const response = await fetch("http://127.0.0.1:8000/api/v1/query", {
        method: "POST",
        body: JSON.stringify({
          id: id,
          query: text,
        }),
        headers: myHeaders,
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const data = await response.json();
      console.log(data);

      // Add assistant message to the chat
      const assistantMessage = { role: "assistant", content: data["result"] };
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error(error);
      // Optionally, add an error message to the chat
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          content: "Sorry, an error occurred. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const customHandleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    await handleSendMessage(input);
  };

  return (
    <ChatContainer className="flex-1 p-6">
      <div className="text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-casca-100 flex items-center justify-center mx-auto">
          <MessageSquare className="w-8 h-8 text-casca-500" />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">
            Ask Finsights questions about your bank statements
          </h2>
          <p className="text-casca-600 mb-8">
            Get insights about your spending patterns, income trends, and
            financial health
          </p>
        </div>
        {isEmpty ? (
          <PromptSuggestions
            append={async (message) => handleSendMessage(message?.content)}
            suggestions={[
              "What are my top spending categories?",
              "Show my monthly income trends",
              "Identify recurring subscriptions",
              "Find potential savings opportunities",
              "Analyze my dining expenses",
            ]}
          />
        ) : (
          <ChatMessages>
            <MessageList messages={messages} isTyping={isLoading} />
          </ChatMessages>
        )}
      </div>

      <ChatForm
        className="align-bottom"
        isPending={isLoading}
        handleSubmit={customHandleSubmit}
      >
        {({ files, setFiles }) => (
          <MessageInput
            className="border-t bg-white p-4"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            stop={stop}
            isGenerating={isLoading}
          />
        )}
      </ChatForm>
    </ChatContainer>
  );
}
