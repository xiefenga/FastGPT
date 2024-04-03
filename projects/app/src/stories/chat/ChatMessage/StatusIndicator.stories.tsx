import StatusIndicator from '@/components/ChatMessage/components/StatusIndicator';
import type { Meta, StoryObj } from '@storybook/react';
import { MessageStatusEnum } from '@/components/ChatMessage/constants';

export default {
  component: StatusIndicator
} satisfies Meta<typeof StatusIndicator>;

type Story = StoryObj<typeof StatusIndicator>;

export const Basic: Story = {
  args: {
    status: MessageStatusEnum.responding,
    text: '加载中...'
  }
};
