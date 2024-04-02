import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import type { Meta, StoryObj } from '@storybook/react';

import { useToast } from '@fastgpt/web/hooks/useToast';
import EditableInput from '@/components/EditableInput';

const meta: Meta<typeof EditableInput> = {
  component: EditableInput
};

export default meta;

type Story = StoryObj<typeof EditableInput>;

export const Basic: Story = {
  render: () => {
    const [text, setText] = React.useState('SophonsAI');
    const { toast } = useToast();

    return (
      <Flex w={300} alignItems={'center'}>
        <Box flex={'0 0 50px'}>昵称:</Box>
        <EditableInput
          flex={'1 0 0'}
          defaultValue={text}
          title={'点击修改昵称'}
          transform={'translateX(-11px)'}
          maxLength={20}
          placeholder={'请输入昵称'}
          onEdit={async (val) => {
            await new Promise((resolve) => setTimeout(resolve, 500));
            setText(val);
            toast({
              title: '修改成功',
              status: 'success'
            });
          }}
        />
      </Flex>
    );
  }
};
