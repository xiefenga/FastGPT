import React from 'react';
import { useTranslation } from 'next-i18next';
import { Flex, Spinner } from '@chakra-ui/react';

interface TranslateIndicatorProps {
  isSpeaking: boolean;
  isTransCription: boolean;
}

const TranslateIndicator = ({ isSpeaking, isTransCription }: TranslateIndicatorProps) => {
  const { t } = useTranslation();

  return (
    <Flex
      position={'absolute'}
      top={0}
      bottom={0}
      left={0}
      right={0}
      zIndex={10}
      pl={5}
      alignItems={'center'}
      bg={'white'}
      color={'primary.500'}
      visibility={isSpeaking && isTransCription ? 'visible' : 'hidden'}
    >
      <Spinner size={'sm'} mr={4} />
      {t('core.chat.Converting to text')}
    </Flex>
  );
};

export default TranslateIndicator;
