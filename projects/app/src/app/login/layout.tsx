import React from 'react';
import { Box, Flex } from '@chakra-ui/react';

import FormLayout from './components/FormLayout';

const Layout = ({ children }: React.PropsWithChildren) => {
  return (
    <Flex
      alignItems={'center'}
      justifyContent={'center'}
      bg={`url('/icon/login-bg.svg') no-repeat`}
      backgroundSize={'cover'}
      userSelect={'none'}
      h={'100%'}
      px={[0, '10vw']}
    >
      <Flex
        flexDirection={'column'}
        w={['100%', 'auto']}
        h={['100%', '700px']}
        maxH={['100%', '90vh']}
        bg={'white'}
        px={['5vw', '88px']}
        py={'5vh'}
        borderRadius={[0, '24px']}
        boxShadow={[
          '',
          '0px 0px 1px 0px rgba(19, 51, 107, 0.20), 0px 32px 64px -12px rgba(19, 51, 107, 0.20)'
        ]}
      >
        <Box w={['100%', '380px']} flex={'1 0 0'}>
          <FormLayout>{children}</FormLayout>
        </Box>
      </Flex>
    </Flex>
  );
};

export default Layout;
