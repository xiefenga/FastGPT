import React from 'react';
import { Box, Card } from '@chakra-ui/react';

import Markdown from '@/components/Markdown';
import { useMarkdown } from '@/web/common/hooks/useMarkdown';

const Empty = () => {
  const { data: sophonsai } = useMarkdown({ url: '/sophonsai.md' });

  return (
    <Box pt={6} w={'85%'} maxW={'600px'} m={'auto'} alignItems={'center'} justifyContent={'center'}>
      <Card p={4} mb={10}>
        <Markdown source={sophonsai} />
      </Card>
    </Box>
  );
};

export default React.memo(Empty);
