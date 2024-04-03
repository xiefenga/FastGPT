import MessageContent from '@/components/ChatMessage/components/MessageContent';
import type { Meta, StoryObj } from '@storybook/react';
import { MessageRoleEnum } from '@/components/ChatMessage/constants';

export default {
  component: MessageContent
} satisfies Meta<typeof MessageContent>;

export const LLM: StoryObj<typeof MessageContent> = {
  args: {
    isChatting: true,
    role: MessageRoleEnum.LLM,
    text: 'Hello, how can I help you?'
  }
};

export const User: StoryObj<typeof MessageContent> = {
  args: {
    role: MessageRoleEnum.USER,
    text: '你好'
  }
};
