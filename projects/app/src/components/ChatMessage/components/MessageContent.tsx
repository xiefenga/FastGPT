import React from 'react';
import { Box, BoxProps, Card } from '@chakra-ui/react';
import { MessageRoleEnum } from '@/components/ChatMessage/constants';
import FilesBlock from '@/components/ChatBox/components/FilesBox';
import Markdown from '@/components/Markdown';
import { MessageItemType } from '@/components/ChatMessage/types';

const MessageCardStyle: BoxProps = {
  px: 4,
  py: 3,
  borderRadius: '0 8px 8px 8px',
  boxShadow: 'none',
  display: 'inline-block',
  maxW: ['calc(100% - 25px)', 'calc(100% - 40px)'],
  color: 'myGray.900'
};

interface MessageContentProps {
  role: MessageRoleEnum;
  isChatting: boolean;
  files?: any[];
  text: string;
  extra?: React.ReactNode;
}

const MessageContent: React.FC<MessageContentProps> = ({
  text,
  files = [],
  isChatting,
  role,
  extra
}) => {
  const styleMap: BoxProps =
    role === MessageRoleEnum.USER
      ? {
          borderRadius: '8px 0 8px 8px',
          textAlign: 'right',
          bg: 'primary.100'
        }
      : {
          borderRadius: '0 8px 8px 8px',
          textAlign: 'left',
          bg: 'myGray.50'
        };

  const responding = role === MessageRoleEnum.LLM ? isChatting : false;

  return (
    <Box mt={['6px', 2]} textAlign={styleMap.textAlign}>
      <Card
        className="markdown"
        {...MessageCardStyle}
        bg={styleMap.bg}
        borderRadius={styleMap.borderRadius}
        textAlign={'left'}
      >
        {role === MessageRoleEnum.USER && files.length > 0 && <FilesBlock files={files} />}
        <Markdown source={text} isChatting={responding} />
        {extra}
      </Card>
    </Box>
  );
};

export default MessageContent;
