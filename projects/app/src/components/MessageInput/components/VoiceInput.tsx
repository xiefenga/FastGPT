import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';

import { useToast } from '@fastgpt/web/hooks/useToast';
import MyIcon from '@fastgpt/web/components/common/Icon';

import MyTooltip from '@/components/MyTooltip';

interface VoiceInputProps {
  isSpeaking: boolean;
  isTransCription: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  startSpeak: (callback: (text: string) => void) => void;
  stopSpeak: () => void;
  speakingTimeString: string;
}

const VoiceInput = (props: VoiceInputProps) => {
  const { isSpeaking, isTransCription, canvasRef, speakingTimeString } = props;

  const { t } = useTranslation();

  const { toast } = useToast();

  return (
    <React.Fragment>
      <canvas
        ref={canvasRef}
        style={{
          height: '30px',
          width: isSpeaking && !isTransCription ? '100px' : 0,
          background: 'white',
          zIndex: 0
        }}
      />
      <Flex
        mr={2}
        alignItems={'center'}
        justifyContent={'center'}
        flexShrink={0}
        h={['26px', '32px']}
        w={['26px', '32px']}
        borderRadius={'md'}
        cursor={'pointer'}
        _hover={{ bg: '#F5F5F8' }}
        onClick={() => {
          toast({ title: '敬请期待', status: 'info' });
        }}
      >
        <MyTooltip label={isSpeaking ? t('core.chat.Stop Speak') : t('core.chat.Record')}>
          <MyIcon
            name={isSpeaking ? 'core/chat/stopSpeechFill' : 'core/chat/recordFill'}
            width={['20px', '22px']}
            height={['20px', '22px']}
            color={'primary.500'}
          />
        </MyTooltip>
      </Flex>
      {isSpeaking && (
        <Box color={'#5A646E'} textAlign={'right'}>
          {speakingTimeString}
        </Box>
      )}
    </React.Fragment>
  );
};

export default VoiceInput;
