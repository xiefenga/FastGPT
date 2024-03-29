import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

import Loading from '@fastgpt/web/components/common/MyLoading';

import { serviceSideProps } from '@/web/common/utils/i18n';

const Index = () => {
  const router = useRouter();

  useEffect(() => {
    router.push('/chat');
  }, [router]);

  return <Loading />;
};

export async function getServerSideProps(content: any) {
  return {
    props: {
      ...(await serviceSideProps(content))
    }
  };
}

export default Index;
