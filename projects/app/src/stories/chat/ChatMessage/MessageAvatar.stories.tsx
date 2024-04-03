import MessageAvatar from '@/components/ChatMessage/components/MessageAvatar';
import type { Meta, StoryObj } from '@storybook/react';
import { MessageRoleEnum } from '@/components/ChatMessage/constants';

export default {
  component: MessageAvatar
} satisfies Meta<typeof MessageAvatar>;

export const LLM: StoryObj<typeof MessageAvatar> = {
  args: {
    role: MessageRoleEnum.LLM,
    src: 'https://chatapi.sophonsai.com/img/GPT.svg'
  }
};

export const USER: StoryObj<typeof MessageAvatar> = {
  args: {
    role: MessageRoleEnum.USER,
    src: '/icon/logo.svg'
  }
};
