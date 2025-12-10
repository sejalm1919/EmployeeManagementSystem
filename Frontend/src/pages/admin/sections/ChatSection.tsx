import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Edit2, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { useStore } from '@/store/useStore';
import { useChat } from '@/hooks/useChat';

export const ChatSection: React.FC = () => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { employees, user } = useStore();
  const { sendMessage, getConversation, editMessage, deleteMessage } = useChat();

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);

  // If somehow admin is not logged in, just show placeholder.
  if (!user) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Chat</h2>
          <p className="text-sm text-muted-foreground">
            Communicate with your team members
          </p>
        </div>
        <GlassCard className="h-[600px] flex items-center justify-center">
          <p className="text-muted-foreground">Please log in as admin to use chat.</p>
        </GlassCard>
      </div>
    );
  }

  const employeeChatId =
    selectedEmployee && selectedEmployee.employmentCode
      ? `user-emp-${selectedEmployee.employmentCode}`
      : null;

  const conversation =
    employeeChatId ? getConversation(user.id, employeeChatId) : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.length]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedEmployee || !employeeChatId) return;
    sendMessage(user.id, employeeChatId, messageText);
    setMessageText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEditMessage = (messageId: string, currentText: string) => {
    setEditingMessageId(messageId);
    setEditText(currentText);
  };

  const handleSaveEdit = () => {
    if (!editText.trim() || !editingMessageId) return;
    editMessage(editingMessageId, editText);
    setEditingMessageId(null);
    setEditText('');
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditText('');
  };

  const handleDeleteMessage = (messageId: string) => {
    deleteMessage(messageId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Chat</h2>
        <p className="text-sm text-muted-foreground">
          Communicate with your team members
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Employee List */}
        <GlassCard className="p-4 overflow-auto">
          <h3 className="font-semibold text-foreground mb-4">Employees</h3>
          <div className="space-y-2">
            {employees.map((employee) => {
              const empChatId = `user-emp-${employee.employmentCode}`;
              const employeeMessages = getConversation(user.id, empChatId);
              const unreadCount = employeeMessages.filter(
                (m) => m.sender === empChatId && m.receiver === user.id
              ).length;

              return (
                <button
                  key={employee.id}
                  onClick={() => setSelectedEmployeeId(employee.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg smooth-transition ${
                    selectedEmployeeId === employee.id
                      ? 'bg-primary/10 border border-primary'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center text-white font-semibold">
                    {employee.firstName[0]}
                    {employee.lastName[0]}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-foreground text-sm">
                      {employee.firstName} {employee.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {employee.position}
                    </p>
                  </div>
                  {unreadCount > 0 && (
                    <span className="bg-destructive text-white text-xs font-semibold px-2 py-1 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </GlassCard>

        {/* Chat Area */}
        <GlassCard className="lg:col-span-2 flex flex-col">
          {selectedEmployee && employeeChatId ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center text-white font-semibold">
                    {selectedEmployee.firstName[0]}
                    {selectedEmployee.lastName[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {selectedEmployee.firstName} {selectedEmployee.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedEmployee.position}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-auto p-4 space-y-4">
                {conversation.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">
                      No messages yet. Start a conversation!
                    </p>
                  </div>
                ) : (
                  conversation.map((message) => {
                    const isFromAdmin = message.sender === user.id;
                    const isEditing = editingMessageId === message.id;

                    return (
                      <div
                        key={message.id}
                        className={`flex ${
                          isFromAdmin ? 'justify-end' : 'justify-start'
                        } group`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg relative ${
                            isFromAdmin
                              ? 'gradient-accent text-white'
                              : 'bg-muted text-foreground'
                          }`}
                        >
                          {isEditing ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full px-2 py-1 bg-background text-foreground border border-input rounded text-sm"
                                autoFocus
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={handleSaveEdit}
                                  className="p-1 hover:bg-success/20 rounded"
                                >
                                  <Check size={16} className="text-success" />
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="p-1 hover:bg-destructive/20 rounded"
                                >
                                  <X size={16} className="text-destructive" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="text-sm">{message.text}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  isFromAdmin ? 'text-white/70' : 'text-muted-foreground'
                                }`}
                              >
                                {new Date(message.timestamp).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                              {isFromAdmin && (
                                <div className="absolute -right-20 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                  <button
                                    onClick={() =>
                                      handleEditMessage(message.id, message.text)
                                    }
                                    className="p-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
                                  >
                                    <Edit2 size={14} className="text-foreground" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMessage(message.id)}
                                    className="p-2 bg-card border border-border rounded-lg hover:bg-destructive/20 transition-colors"
                                  >
                                    <Trash2 size={14} className="text-destructive" />
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                    className="gradient-accent"
                  >
                    <Send size={18} />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <User size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Select an employee to start chatting
                </p>
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};
