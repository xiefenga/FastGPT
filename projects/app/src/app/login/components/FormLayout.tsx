'use client';
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AbsoluteCenter, Box, Button, Flex, Image } from '@chakra-ui/react';

import MyIcon from '@fastgpt/web/components/common/Icon';
import { LOGO_ICON } from '@fastgpt/global/common/system/constants';

import { LoginTypeEnum } from '@/constants/login';
import Divider from '@/components/core/module/Flow/components/modules/Divider';

interface LoginItemType {
  label: string;
  type: string;
  icon: string;
  redirectUrl?: string;
}

const FormLayout = ({ children }: React.PropsWithChildren) => {
  const router = useRouter();

  const pathname = usePathname();

  const loginType = pathname?.replace(/^\/login\/?/, '') || LoginTypeEnum.password;

  // @ts-expect-error ignore
  if (!Object.values(LoginTypeEnum).includes(loginType)) {
    return children;
  }

  // const redirectUri = `${location.origin}/login/provider`

  const loginList = [
    // {
    //   label: 'Github 登录',
    //   type: LoginTypeEnum.github,
    //   icon: 'common/gitFill',
    //   redirectUrl: `${redirectUri}`,
    // },
    // {
    //   label: 'Google 登录',
    //   type: LoginTypeEnum.google,
    //   icon: 'common/googleFill',
    //   redirectUrl: `${redirectUri}`,
    // },
    {
      label: '微信登录',
      type: LoginTypeEnum.wechat,
      icon: 'common/wechatFill'
    },
    {
      label: '密码登录',
      type: LoginTypeEnum.password,
      icon: 'support/account/passwordLogin'
    }
  ].filter((item) => item.type !== loginType) as LoginItemType[];

  return (
    <Flex flexDirection={'column'} h={'100%'}>
      <Flex alignItems={'center'}>
        <Flex
          w={['48px', '56px']}
          h={['48px', '56px']}
          bg={'myGray.25'}
          borderRadius={'xl'}
          borderWidth={'1.5px'}
          borderColor={'borderColor.base'}
          alignItems={'center'}
          justifyContent={'center'}
        >
          <Image src={LOGO_ICON} w={'24px'} alt={'icon'} />
        </Flex>
        <Box ml={3} fontSize={['2xl', '3xl']} fontWeight={'bold'}>
          SophonsAI
        </Box>
      </Flex>
      {children}
      <Box flex={1} />
      {loginList.length > 0 && (
        <>
          <Box position={'relative'}>
            <Divider />
            <AbsoluteCenter bg="white" px="4" color={'myGray.500'}>
              or
            </AbsoluteCenter>
          </Box>
          <Box my={8}>
            {loginList.map((item) => (
              <Box key={item.type} _notFirst={{ mt: 4 }}>
                <Button
                  variant={'whitePrimary'}
                  w={'100%'}
                  h={'42px'}
                  leftIcon={
                    <MyIcon
                      name={item.icon as any}
                      w={'20px'}
                      cursor={'pointer'}
                      color={'myGray.800'}
                    />
                  }
                  onClick={() => {
                    if (item.redirectUrl) {
                      // item.redirectUrl &&
                      // setLoginStore({
                      //   provider: item.provider,
                      //   lastRoute,
                      //   state: state.current
                      // });
                      // item.redirectUrl && router.replace(item.redirectUrl);
                    } else {
                      router.replace(
                        item.type === LoginTypeEnum.password ? '/login' : `/login/${item.type}`
                      );
                    }
                  }}
                >
                  {item.label}
                </Button>
              </Box>
            ))}
          </Box>
        </>
      )}
    </Flex>
  );
};

export default FormLayout;
