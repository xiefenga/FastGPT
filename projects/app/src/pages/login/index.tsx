import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Box, Center, Flex } from '@chakra-ui/react';
import React, { useState, useCallback, useEffect } from 'react';

import Loading from '@fastgpt/web/components/common/MyLoading';

import { LoginPageTypeEnum } from '@/constants/user';
import LoginForm from './components/LoginForm/LoginForm';
import { serviceSideProps } from '@/web/common/utils/i18n';
import type { UserResType } from '@/types/api/user';
import { useUserStore } from '@/web/support/user/useUserStore';

const RegisterForm = dynamic(() => import('./components/RegisterForm'));
const ForgetPasswordForm = dynamic(() => import('./components/ForgetPasswordForm'));
const WechatForm = dynamic(() => import('./components/LoginForm/WechatForm'));

const Login = () => {
  const router = useRouter();
  const { lastRoute = '', type = LoginPageTypeEnum.passwordLogin } = router.query as {
    lastRoute: string;
    type: `${LoginPageTypeEnum}`;
  };

  const [pageType, setPageType] = useState<`${LoginPageTypeEnum}`>(type);
  const { setUserInfo } = useUserStore();

  const loginSuccess = useCallback(
    (user: UserResType) => {
      // init store
      setUserInfo(user);
      setTimeout(() => {
        router.push(lastRoute ? decodeURIComponent(lastRoute) : '/app/chat');
      }, 300);
    },
    [lastRoute, router, setUserInfo]
  );

  function DynamicComponent({ type }: { type: `${LoginPageTypeEnum}` }) {
    const TypeMap = {
      [LoginPageTypeEnum.passwordLogin]: LoginForm,
      [LoginPageTypeEnum.register]: RegisterForm,
      [LoginPageTypeEnum.forgetPassword]: ForgetPasswordForm,
      [LoginPageTypeEnum.wechat]: WechatForm
    };

    const Component = TypeMap[type];

    return <Component setPageType={setPageType} loginSuccess={loginSuccess} />;
  }

  // useEffect(() => {
  //   clearToken();
  //   router.prefetch('/app/chat');
  // }, [router]);

  return (
    <>
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
            {pageType ? (
              <DynamicComponent type={pageType} />
            ) : (
              <Center w={'full'} h={'full'} position={'relative'}>
                <Loading fixed={false} />
              </Center>
            )}
          </Box>
        </Flex>
      </Flex>
    </>
  );
};

export async function getServerSideProps(context: any) {
  return {
    props: { ...(await serviceSideProps(context)) }
  };
}

export default Login;
