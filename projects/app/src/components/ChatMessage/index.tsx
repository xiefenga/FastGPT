import React from 'react';
import { Box, BoxProps, Flex } from '@chakra-ui/react';

import { MessageRoleEnum, MessageStatusEnum } from '@/components/ChatMessage/constants';
import MessageAvatar from '@/components/ChatMessage/components/MessageAvatar';
import MessageController from '@/components/ChatMessage/components/MessageController';
import StatusIndicator from '@/components/ChatMessage/components/StatusIndicator';
import MessageContent from '@/components/ChatMessage/components/MessageContent';
import type { MessageItemType } from '@/components/ChatMessage/types';

interface ChatMessageProps {
  message: MessageItemType;
  isChatting: boolean;
  role: MessageRoleEnum;
  avatar: string;
  statusData: {
    status: MessageStatusEnum;
    text?: string;
  };
  isLastChild?: boolean;
}

const ChatMessage: React.FC<React.PropsWithChildren<ChatMessageProps>> = ({
  message,
  role,
  avatar,
  statusData,
  children,
  isLastChild = false,
  isChatting
}) => {
  const styleMap: BoxProps =
    role === MessageRoleEnum.USER
      ? { order: 0, justifyContent: 'flex-end' }
      : { order: 1, justifyContent: 'flex-start' };

  return (
    <>
      {/* control */}
      <Flex w={'100%'} alignItems={'center'} gap={2} justifyContent={styleMap.justifyContent}>
        {statusData.status === MessageStatusEnum.finish && (
          <Box order={styleMap.order}>
            <MessageController text={message.text} />
          </Box>
        )}
        <MessageAvatar src={avatar} role={role} />
        <StatusIndicator status={statusData.status} text={statusData.text} />
      </Flex>
      {/* content */}
      <MessageContent
        role={role}
        extra={children}
        text={message.text}
        isChatting={isChatting && isLastChild}
      />
    </>
  );
};

export default ChatMessage;
