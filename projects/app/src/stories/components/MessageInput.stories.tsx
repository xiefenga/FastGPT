import MessageInput from '@/components/MessageInput';
import { useToast } from '@fastgpt/web/hooks/useToast';
import type { Meta, StoryObj } from '@storybook/react';

type MessageInputProps = React.ComponentProps<typeof MessageInput>;

export default {
  component: MessageInput,
  tags: ['autodocs']
} satisfies Meta<typeof MessageInput>;

type Story = StoryObj<typeof MessageInput>;

export const Basic: Story = {
  args: {
    isChatting: false,
    showFileSelector: false
  },
  render: ({ isChatting, showFileSelector }) => {
    const { toast } = useToast();

    type Input = Parameters<NonNullable<MessageInputProps['onSendMessage']>>[0];

    const onSendMessage = (input: Input) => {
      toast({
        title: 'onSendMessage',
        description: (
          <div>
            <div>
              text: <span>{input.text}</span>
            </div>
            <div>
              files: <span>{input.files?.map((item) => item.name)}</span>
            </div>
          </div>
        ),
        status: 'success'
      });
    };

    const onStop = () => {
      toast({
        title: 'onStop',
        status: 'success'
      });
    };

    return (
      <MessageInput
        onStop={onStop}
        isChatting={isChatting}
        onSendMessage={onSendMessage}
        showFileSelector={showFileSelector}
      />
    );
  }
};
