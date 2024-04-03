import ChatMessage from '@/components/ChatMessage';
import type { Meta, StoryObj } from '@storybook/react';
import { MessageRoleEnum, MessageStatusEnum } from '@/components/ChatMessage/constants';
import { ChatItemValueTypeEnum, ChatRoleEnum } from '@fastgpt/global/core/chat/constants';

export default {
  component: ChatMessage
} satisfies Meta<typeof ChatMessage>;

export const LLMResponding: StoryObj<typeof ChatMessage> = {
  args: {
    isLastChild: true,
    isChatting: true,
    statusData: {
      status: MessageStatusEnum.responding,
      text: '响应中...'
    },
    avatar: 'https://chatapi.sophonsai.com/img/GPT.svg',
    message: {
      role: MessageRoleEnum.LLM,
      text: 'Hello, how can I help you?'
    },
    role: MessageRoleEnum.LLM
  }
};
