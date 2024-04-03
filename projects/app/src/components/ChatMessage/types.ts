import { MessageRoleEnum } from '@/components/ChatMessage/constants';

export interface UserMessageType {
  role: MessageRoleEnum.USER;
  text: string;
  // TODO: add files type
  files?: any[];
}

export interface LLMMessageType {
  role: MessageRoleEnum.LLM;
  text: string;
}

export type MessageItemType = UserMessageType | LLMMessageType;
