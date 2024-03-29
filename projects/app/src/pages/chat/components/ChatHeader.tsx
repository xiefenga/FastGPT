import React from 'react';
import { useTranslation } from 'next-i18next';
import { Flex, useTheme, Box } from '@chakra-ui/react';

import MyIcon from '@fastgpt/web/components/common/Icon';
import type { ChatItemType } from '@fastgpt/global/core/chat/type';

import ToolMenu from './ToolMenu';
import ModelSeletor from '@/pages/chat/components/ModelSeletor';
import { useSystemStore } from '@/web/common/system/useSystemStore';

interface ChatHeaderProps {
  chatName?: string;
  history: ChatItemType[];
  showHistory?: boolean;
  onOpenSlider: () => void;
}

const ChatHeader = ({ history, showHistory, onOpenSlider, chatName }: ChatHeaderProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { isPc } = useSystemStore();

  const title = chatName ?? t('core.chat.New Chat');

  return (
    <Flex
      alignItems={'center'}
      px={[3, 5]}
      h={['46px', '60px']}
      borderBottom={theme.borders.sm}
      color={'myGray.900'}
    >
      {isPc ? (
        <Box mr={3} fontWeight={'700'} fontSize={18} color={'myGray.1000'}>
          {title}
        </Box>
      ) : (
        <React.Fragment>
          {showHistory && (
            <MyIcon
              name={'menu'}
              w={'20px'}
              h={'20px'}
              color={'myGray.900'}
              onClick={onOpenSlider}
            />
          )}
          <Flex px={3} alignItems={'center'} flex={'1 0 0'} w={0} justifyContent={'center'}>
            <MyIcon w="16px" name="core/chat/chatFill" />
            <Box ml={1} className="textEllipsis">
              {title}
            </Box>
          </Flex>
        </React.Fragment>
      )}
      <Flex ml={'auto'} alignItems={'center'} gap={2}>
        <ModelSeletor />
        {/* control */}
        <ToolMenu history={history} />
      </Flex>
    </Flex>
  );
};

export default ChatHeader;
