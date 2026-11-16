import React, { useState, useEffect, useRef } from 'react';
import { Send, Heart, Smile, Sparkles, MessageSquare, Flame } from 'lucide-react';
import { getSocket } from '../../services/socket';

const QUICK_LOVE_MESSAGES = [
  'I love you ❤️',
  'Holding your hand ✨',
  'Pass the popcorn! 🍿',
  'You look so cute tonight 🥰',
  'This part gave me chills! 😱',
  'Best movie date ever 💕',
];

const EMOJI_PALETTE = ['❤️', '💖', '🍿', '🥰', '😘', '✨', '😭', '🫣', '🔥', '🥂'];

export const ChatPanel = ({
  roomId,
  currentUser,
  partnerUser,
  partner1User,
  partner2User,
  isHost,
  onSendReaction
}) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const p1Name = partner1User?.name || (isHost ? currentUser?.name : partnerUser?.name) || 'Partner 1';
  const p2Name = partner2User?.name || (!isHost ? currentUser?.name : partnerUser?.name);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, partnerTyping]);

  // Socket event listeners for chat
  useEffect(() => {
    const socket = getSocket();

    const handleChatHistory = ({ messages: history }) => {
      setMessages(history || []);
    };

    const handleNewMessage = ({ message }) => {
      setMessages((prev) => [...prev, message]);
    };

    const handleTypingStatus = ({ isTyping: partnerIsTyping }) => {
      setPartnerTyping(partnerIsTyping);
    };

    socket.on('chat-history', handleChatHistory);
    socket.on('chat-new-message', handleNewMessage);
    socket.on('chat-typing-status', handleTypingStatus);

    return () => {
      socket.off('chat-history', handleChatHistory);
      socket.off('chat-new-message', handleNewMessage);
      socket.off('chat-typing-status', handleTypingStatus);
    };
  }, [roomId]);

  // Handle typing indicator broadcast
  const handleTextChange = (e) => {
    setText(e.target.value);
    const socket = getSocket();

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('chat-typing', {
        roomId,
        isTyping: true,
        userName: currentUser?.name,
      });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('chat-typing', {
        roomId,
        isTyping: false,
        userName: currentUser?.name,
      });
    }, 1500);
  };

  const handleSendMessage = (contentToSend) => {
    const msgText = contentToSend || text;
    if (!msgText.trim()) return;

    const socket = getSocket();
    const myRole = isHost ? 'Partner 1' : 'Partner 2';
    socket.emit('chat-send-message', {
      roomId,
      message: {
        senderId: currentUser?.id,
        senderName: currentUser?.name,
        senderAvatar: currentUser?.avatar,
        senderRole: myRole,
        text: msgText.trim(),
        type: 'text',
      },
    });

    setText('');
    setIsTyping(false);
    socket.emit('chat-typing', { roomId, isTyping: false, userName: currentUser?.name });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-cinema-darker rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
      {/* Chat Header */}
      <div className="px-4 py-3 bg-cinema-card border-b border-white/10 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-romantic-pink" />
            <h3 className="text-sm font-bold text-white tracking-wide">Live Date Chat</h3>
          </div>
          <p className="text-[10px] text-cinema-muted mt-0.5">
            <span className="text-netflix-red font-medium">{p1Name}</span> & <span className="text-romantic-pink font-medium">{p2Name || 'Partner 2'}</span>
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-cinema-muted">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Private 2-Way</span>
        </div>
      </div>

      {/* Messages List Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[240px] max-h-[380px]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <Heart className="w-8 h-8 text-romantic-pink/40 animate-pulse mb-2" />
            <p className="text-xs text-cinema-muted">
              Start chatting with {partnerUser?.name || (isHost ? 'Partner 2' : 'Partner 1')}! Send a sweet message below.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser?.id;
            const timeStr = msg.timestamp
              ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '';

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <img
                  src={msg.senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                  alt={msg.senderName}
                  className="w-7 h-7 rounded-full object-cover shrink-0 mt-1"
                />
                <div
                  className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                    isMe
                      ? 'bg-gradient-to-r from-netflix-red to-romantic-pink text-white rounded-tr-none shadow-md'
                      : 'bg-cinema-card text-cinema-text border border-white/10 rounded-tl-none'
                  }`}
                >
                  <p className={`text-[10px] font-semibold mb-0.5 ${isMe ? 'text-white/80' : 'text-romantic-pink'}`}>
                    {msg.senderName} {msg.senderRole && <span className="text-[9px] opacity-75 font-normal">({msg.senderRole})</span>}
                  </p>
                  <p className="break-words select-text">{msg.text}</p>
                  <p className={`text-[9px] mt-1 text-right ${isMe ? 'text-white/70' : 'text-cinema-muted'}`}>
                    {timeStr}
                  </p>
                </div>
              </div>
            );
          })
        )}

        {/* Partner Typing Indicator */}
        {partnerTyping && (
          <div className="flex items-center gap-2 text-xs text-romantic-pink italic animate-pulse">
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>{partnerUser?.name || 'Partner'} is typing love...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Love Phrases (chips) */}
      <div className="px-3 py-1.5 bg-cinema-darkest/60 border-t border-white/5 overflow-x-auto flex items-center gap-1.5 no-scrollbar">
        {QUICK_LOVE_MESSAGES.map((phrase, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(phrase)}
            className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white/5 hover:bg-romantic-pink/20 hover:text-romantic-pink border border-white/10 text-[11px] text-cinema-muted transition-colors cursor-pointer"
          >
            {phrase}
          </button>
        ))}
      </div>

      {/* Emoji Picker Tray (when open) */}
      {showEmojiPicker && (
        <div className="px-3 py-2 bg-cinema-card border-t border-white/10 flex items-center justify-between gap-1 overflow-x-auto">
          {EMOJI_PALETTE.map((emoji, idx) => (
            <button
              key={idx}
              onClick={() => {
                setText((prev) => prev + emoji);
                setShowEmojiPicker(false);
              }}
              className="text-lg hover:scale-125 transition-transform p-1 cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Chat Input & Action Bar */}
      <div className="p-3 bg-cinema-card border-t border-white/10 flex items-center gap-2">
        {/* Toggle Emoji Tray */}
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 rounded-xl text-cinema-muted hover:text-romantic-pink hover:bg-white/5 transition-colors"
          title="Add Emoji"
        >
          <Smile className="w-4 h-4" />
        </button>

        {/* Romantic Heart Burst Reaction */}
        {onSendReaction && (
          <button
            onClick={() => onSendReaction('heart')}
            className="p-2 rounded-xl text-romantic-pink hover:bg-romantic-pink/15 transition-colors animate-heart-beat"
            title="Send Heart Reaction ❤️"
          >
            <Heart className="w-4 h-4 fill-current" />
          </button>
        )}

        {/* Text Input */}
        <input
          type="text"
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Whisper something sweet..."
          className="flex-1 px-3 py-2 rounded-xl bg-cinema-darker border border-white/10 text-white text-xs placeholder:text-cinema-muted focus:outline-none focus:border-romantic-pink"
        />

        {/* Send Button */}
        <button
          onClick={() => handleSendMessage()}
          disabled={!text.trim()}
          className="p-2 rounded-xl bg-gradient-to-r from-netflix-red to-romantic-pink text-white hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          title="Send Message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ChatPanel;
