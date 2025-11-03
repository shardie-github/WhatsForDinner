/**
 * Message Center Component
 * In-app messaging inbox with CTAs and deep links
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '../src/components/Button';
import { Card } from '../src/components/Card';
import { Text } from '../src/components/Text';
import { View } from '../src/components/View';

export interface InAppMessage {
  id: string;
  title: string;
  body: string;
  cta?: {
    text: string;
    action: string; // deep link or URL
  };
  imageUrl?: string;
  read: boolean;
  createdAt: string;
}

interface MessageCenterProps {
  messages: InAppMessage[];
  onMessageClick?: (message: InAppMessage) => void;
  onMarkRead?: (messageId: string) => void;
  onCTAClick?: (message: InAppMessage, action: string) => void;
  className?: string;
}

export function MessageCenter({
  messages,
  onMessageClick,
  onMarkRead,
  onCTAClick,
  className,
}: MessageCenterProps) {
  const [selectedMessage, setSelectedMessage] = useState<InAppMessage | null>(null);

  const unreadCount = messages.filter((m) => !m.read).length;

  const handleMessageClick = (message: InAppMessage) => {
    if (!message.read && onMarkRead) {
      onMarkRead(message.id);
    }
    setSelectedMessage(message);
    onMessageClick?.(message);
  };

  const handleCTAClick = (message: InAppMessage, action: string) => {
    onCTAClick?.(message, action);
    // Handle deep link navigation
    if (action.startsWith('/')) {
      window.location.href = action;
    } else if (action.startsWith('http')) {
      window.open(action, '_blank');
    }
  };

  if (selectedMessage) {
    return (
      <View className={className}>
        <Card>
          <Button variant="ghost" onClick={() => setSelectedMessage(null)}>
            ? Back
          </Button>
          <Text variant="heading" style={{ marginTop: 16 }}>
            {selectedMessage.title}
          </Text>
          {selectedMessage.imageUrl && (
            <img src={selectedMessage.imageUrl} alt={selectedMessage.title} style={{ width: '100%', marginTop: 16 }} />
          )}
          <Text variant="body" style={{ marginTop: 16 }}>
            {selectedMessage.body}
          </Text>
          {selectedMessage.cta && (
            <Button
              variant="primary"
              style={{ marginTop: 24 }}
              onClick={() => handleCTAClick(selectedMessage, selectedMessage.cta!.action)}
            >
              {selectedMessage.cta.text}
            </Button>
          )}
        </Card>
      </View>
    );
  }

  return (
    <View className={className}>
      <Text variant="heading">Messages {unreadCount > 0 && `(${unreadCount})`}</Text>
      {messages.length === 0 ? (
        <Card>
          <Text variant="body" style={{ textAlign: 'center', color: '#9ca3af' }}>
            No messages
          </Text>
        </Card>
      ) : (
        <View style={{ marginTop: 16 }}>
          {messages.map((message) => (
            <Card
              key={message.id}
              onClick={() => handleMessageClick(message)}
              style={{
                marginBottom: 12,
                cursor: 'pointer',
                opacity: message.read ? 0.7 : 1,
                borderLeft: message.read ? 'none' : '4px solid #0070f3',
              }}
            >
              <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
                {!message.read && (
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#0070f3',
                      marginRight: 12,
                      marginTop: 6,
                    }}
                  />
                )}
                <View style={{ flex: 1 }}>
                  <Text variant="subheading" style={{ fontWeight: message.read ? 400 : 600 }}>
                    {message.title}
                  </Text>
                  <Text variant="body" style={{ marginTop: 4, color: '#6b7280' }}>
                    {message.body.substring(0, 100)}
                    {message.body.length > 100 ? '...' : ''}
                  </Text>
                  {message.cta && (
                    <Button
                      variant="ghost"
                      size="sm"
                      style={{ marginTop: 8 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCTAClick(message, message.cta!.action);
                      }}
                    >
                      {message.cta.text} ?
                    </Button>
                  )}
                  <Text variant="caption" style={{ marginTop: 8, color: '#9ca3af' }}>
                    {new Date(message.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}
    </View>
  );
}
