import type { Meta, StoryObj } from '@storybook/react';
import MessageController from '@/components/ChatMessage/components/MessageController';

export default {
  component: MessageController
} satisfies Meta<typeof MessageController>;

type Story = StoryObj<typeof MessageController>;

export const Basic: Story = {
  args: {
    text: '我是一个人工智能助手，可以回答你的问题和提供帮助。有什么可以帮到你的吗?'
  }
};
