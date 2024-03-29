import React from 'react';
import Head from 'next/head';
import { Flex } from '@chakra-ui/react';

import PageContainer from '@/components/PageContainer';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { serviceSideProps } from '@/web/common/utils/i18n';

const AgentPage = () => {
  return (
    <Flex h={'100%'}>
      <Head>
        <title>智能体</title>
      </Head>
      <PageContainer flex={'1 0 0'}>
        <Flex
          h={'100%'}
          flex={'1 0 0'}
          flexDirection={'column'}
          justifyContent={'center'}
          alignItems={'center'}
        >
          <MyIcon name="comingSoon" w={300} />
        </Flex>
      </PageContainer>
    </Flex>
  );
};

export async function getServerSideProps(context: any) {
  return {
    props: {
      ...(await serviceSideProps(context))
    }
  };
}

export default AgentPage;
