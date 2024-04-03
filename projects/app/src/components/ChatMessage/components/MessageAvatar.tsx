import React from 'react';
import { Box } from '@chakra-ui/react';
import { useTheme } from '@chakra-ui/system';

import Avatar from '@/components/Avatar';
import { MessageRoleEnum } from '@/components/ChatMessage/constants';

interface MessageAvatarProps {
  src: string;
  role: MessageRoleEnum;
}

const MessageAvatar: React.FC<MessageAvatarProps> = ({ src, role }) => {
  const theme = useTheme();
  return (
    <Box
      w={['28px', '34px']}
      h={['28px', '34px']}
      p={'2px'}
      borderRadius={'sm'}
      border={theme.borders.base}
      boxShadow={'0 0 5px rgba(0,0,0,0.1)'}
      bg={role === MessageRoleEnum.USER ? 'white' : 'primary.50'}
    >
      <Avatar src={src} w={'100%'} h={'100%'} />
    </Box>
  );
};

export default React.memo(MessageAvatar);
