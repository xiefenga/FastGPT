import { POST } from '@/web/common/api/sophonsai';
import { ChatHistoryItemType, ChatMessageItemType } from '@/types/api/chat';

export const getChatHistories = () =>
  POST<ChatHistoryItemType[]>('/user/list_history_conversations');

// 获取对话消息列表
export const getChatMessages = (id: string) =>
  POST<ChatMessageItemType[]>('/user/list_conversation_messages', `"${id}"`);
