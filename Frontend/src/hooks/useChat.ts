import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store/reduxStore';
import { addMessage, markMessagesAsRead, editMessage as editMessageAction, deleteMessage as deleteMessageAction, Message } from '@/store/chatSlice';
import { useMemo } from 'react';

export const useChat = () => {
  const dispatch = useDispatch<AppDispatch>();
  const messages = useSelector((state: RootState) => state.chat.messages);

  const sendMessage = (sender: string, receiver: string, text: string) => {
    dispatch(addMessage({ sender, receiver, text }));
  };

  const getConversation = (userId1: string, userId2: string): Message[] => {
    return messages.filter(
      (msg) =>
        (msg.sender === userId1 && msg.receiver === userId2) ||
        (msg.sender === userId2 && msg.receiver === userId1)
    );
  };

  const getUnreadCount = (userId: string): number => {
    // Count messages sent TO this user
    return messages.filter((msg) => msg.receiver === userId).length;
  };

  const markAsRead = (sender: string, receiver: string) => {
    dispatch(markMessagesAsRead({ sender, receiver }));
  };

  const editMessage = (id: string, text: string) => {
    dispatch(editMessageAction({ id, text }));
  };

  const deleteMessage = (id: string) => {
    dispatch(deleteMessageAction(id));
  };

  return {
    messages,
    sendMessage,
    getConversation,
    getUnreadCount,
    markAsRead,
    editMessage,
    deleteMessage,
  };
};
