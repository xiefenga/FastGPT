import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  component: () => <div>chatbox</div>
};

export default meta;

type Story = StoryObj;

export const Primary: Story = {
  render: () => <div>chatbox</div>
};
