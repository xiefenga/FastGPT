import React from 'react';
import { Flex } from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';

import MyTooltip from '@/components/MyTooltip';
import MyIcon from '@fastgpt/web/components/common/Icon';

interface InputButtonProps {
  havInput: boolean;
  isChatting: boolean;
  onClick?: () => void;
}

const InputButton = ({ isChatting, havInput, onClick }: InputButtonProps) => {
  const { t } = useTranslation();

  return (
    <Flex
      alignItems={'center'}
      justifyContent={'center'}
      flexShrink={0}
      h={['28px', '32px']}
      w={['28px', '32px']}
      borderRadius={'md'}
      bg={isChatting ? '' : !havInput ? '#E5E5E5' : 'primary.500'}
      cursor={havInput ? 'pointer' : 'not-allowed'}
      lineHeight={1}
      onClick={onClick}
    >
      {isChatting ? (
        <MyIcon
          animation={'zoomStopIcon 0.4s infinite alternate'}
          width={['22px', '25px']}
          height={['22px', '25px']}
          cursor={'pointer'}
          name={'stop'}
          color={'gray.500'}
        />
      ) : (
        <MyTooltip label={t('core.chat.Send Message')}>
          <MyIcon
            name={'core/chat/sendFill'}
            width={['18px', '20px']}
            height={['18px', '20px']}
            color={'white'}
          />
        </MyTooltip>
      )}
    </Flex>
  );
};

export default InputButton;
