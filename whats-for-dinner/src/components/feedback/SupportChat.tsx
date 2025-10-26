'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  X, 
  Bot, 
  User, 
  Phone, 
  Mail, 
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot' | 'agent';
  timestamp: Date;
  type: 'text' | 'quick_reply' | 'suggestion' | 'status';
  metadata?: {
    agentName?: string;
    status?: 'typing' | 'delivered' | 'read';
    quickReplies?: string[];
  };
}

interface SupportChatProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  sessionId?: string;
}

const QUICK_REPLIES = [
  'I need help with my account',
  'How do I reset my password?',
  'I want to cancel my subscription',
  'Report a bug',
  'Feature request',
  'Speak to a human agent',
];

const FAQ_QUESTIONS = [
  {
    question: 'How do I create a meal plan?',
    answer: 'To create a meal plan, go to the "Meal Planning" section and click "Create New Plan". You can customize it based on your dietary preferences and schedule.',
  },
  {
    question: 'Can I sync with my calendar?',
    answer: 'Yes! You can sync your meal plans with Google Calendar, Outlook, or Apple Calendar. Go to Settings > Integrations to set this up.',
  },
  {
    question: 'How do I add dietary restrictions?',
    answer: 'Go to your Profile > Dietary Preferences to add allergies, dietary restrictions, or food preferences. This will help us suggest better meal options.',
  },
  {
    question: 'Is there a mobile app?',
    answer: 'Yes! We have mobile apps for iOS and Android. You can download them from the App Store or Google Play Store.',
  },
];

export function SupportChat({ isOpen, onClose, userId, sessionId }: SupportChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [agentStatus, setAgentStatus] = useState<'available' | 'busy' | 'offline'>('available');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      // Initialize chat with welcome message
      const welcomeMessage: Message = {
        id: 'welcome',
        content: 'Hi! I\'m your AI support assistant. How can I help you today?',
        sender: 'bot',
        timestamp: new Date(),
        type: 'text',
        metadata: {
          quickReplies: QUICK_REPLIES,
        },
      };
      setMessages([welcomeMessage]);
      setIsConnected(true);
    }
  }, [isOpen]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: content.trim(),
      sender: 'user',
      timestamp: new Date(),
      type: 'text',
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Simulate AI response
      const response = await fetch('/api/support/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          userId,
          sessionId,
          conversationHistory: messages,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        content: data.response,
        sender: 'bot',
        timestamp: new Date(),
        type: 'text',
        metadata: {
          quickReplies: data.quickReplies,
        },
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: 'Sorry, I encountered an error. Please try again or contact support directly.',
        sender: 'bot',
        timestamp: new Date(),
        type: 'text',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply);
  };

  const handleEscalateToHuman = async () => {
    const escalationMessage: Message = {
      id: `escalation-${Date.now()}`,
      content: 'I\'m connecting you with a human agent. Please hold on...',
      sender: 'bot',
      timestamp: new Date(),
      type: 'status',
    };

    setMessages(prev => [...prev, escalationMessage]);
    setAgentStatus('busy');

    try {
      // Simulate escalation to human agent
      const response = await fetch('/api/support/escalate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          sessionId,
          conversationHistory: messages,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        const agentMessage: Message = {
          id: `agent-${Date.now()}`,
          content: `Hi! I'm ${data.agentName}, a human support agent. I can see your conversation history. How can I help you?`,
          sender: 'agent',
          timestamp: new Date(),
          type: 'text',
          metadata: {
            agentName: data.agentName,
          },
        };

        setMessages(prev => [...prev, agentMessage]);
        setAgentStatus('available');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to connect to human agent. Please try again later.',
        variant: 'destructive',
      });
      setAgentStatus('available');
    }
  };

  const handleFAQClick = (question: string) => {
    const faq = FAQ_QUESTIONS.find(f => f.question === question);
    if (faq) {
      const faqMessage: Message = {
        id: `faq-${Date.now()}`,
        content: `**${faq.question}**\n\n${faq.answer}`,
        sender: 'bot',
        timestamp: new Date(),
        type: 'text',
      };
      setMessages(prev => [...prev, faqMessage]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] z-50">
      <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <CardTitle className="text-lg">Support Chat</CardTitle>
            <Badge 
              variant={isConnected ? 'default' : 'secondary'}
              className="text-xs"
            >
              {isConnected ? 'Online' : 'Offline'}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : message.sender === 'agent'
                        ? 'bg-blue-100 text-blue-900'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.sender === 'bot' && <Bot className="h-4 w-4 mt-0.5" />}
                      {message.sender === 'agent' && <User className="h-4 w-4 mt-0.5" />}
                      <div className="flex-1">
                        <div className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </div>
                        <div className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3 flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Quick Replies */}
          {messages.length > 0 && messages[messages.length - 1].metadata?.quickReplies && (
            <div className="p-4 border-t">
              <div className="text-sm text-gray-600 mb-2">Quick replies:</div>
              <div className="flex flex-wrap gap-2">
                {messages[messages.length - 1].metadata?.quickReplies?.map((reply, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickReply(reply)}
                    className="text-xs"
                  >
                    {reply}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* FAQ Suggestions */}
          {messages.length === 1 && (
            <div className="p-4 border-t">
              <div className="text-sm text-gray-600 mb-2">Frequently asked:</div>
              <div className="space-y-1">
                {FAQ_QUESTIONS.slice(0, 3).map((faq, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFAQClick(faq.question)}
                    className="text-xs text-left justify-start h-auto p-2"
                  >
                    {faq.question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(inputValue);
                  }
                }}
                disabled={isTyping}
              />
              <Button
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim() || isTyping}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-between mt-2">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEscalateToHuman}
                  disabled={agentStatus === 'busy'}
                >
                  <Phone className="h-4 w-4 mr-1" />
                  Human Agent
                </Button>
                <Button variant="ghost" size="sm">
                  <Mail className="h-4 w-4 mr-1" />
                  Email Support
                </Button>
              </div>
              
              <div className="text-xs text-gray-500">
                {agentStatus === 'available' && 'Agent available'}
                {agentStatus === 'busy' && 'Connecting...'}
                {agentStatus === 'offline' && 'Agent offline'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}