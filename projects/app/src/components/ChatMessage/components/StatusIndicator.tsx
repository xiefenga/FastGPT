import React from 'react';
import { Box, Flex } from '@chakra-ui/react';

import styles from '../index.module.scss';
import { MessageStatusEnum } from '../constants';

interface StatusIndicatorProps {
  text?: string;
  status: MessageStatusEnum;
}

const StatusColorMap = {
  [MessageStatusEnum.waiting]: {
    bg: 'myGray.100',
    color: 'myGray.600'
  },
  [MessageStatusEnum.responding]: {
    bg: 'green.50',
    color: 'green.700'
  },
  [MessageStatusEnum.finish]: {
    bg: 'green.50',
    color: 'green.700'
  }
};
const StatusIndicator: React.FC<StatusIndicatorProps> = ({ text, status }) => {
  const style = StatusColorMap[status];

  if (status === MessageStatusEnum.finish) {
    return null;
  }

  return (
    <Flex alignItems={'center'} px={3} py={'1.5px'} borderRadius="md" bg={style.bg}>
      <Box
        w="8px"
        h="8px"
        mt={'1px'}
        bg={style.color}
        borderRadius={'50%'}
        className={styles.statusAnimation}
      />
      <Box ml={2} color={'myGray.600'}>
        {text}
      </Box>
    </Flex>
  );
};

export default StatusIndicator;
