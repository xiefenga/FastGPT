import { throttle } from 'lodash';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo } from 'react';
import { Box, useColorMode, Flex } from '@chakra-ui/react';

import { useLoading } from '@fastgpt/web/hooks/useLoading';

import Auth from './auth';
import Navbar from './navbar';
import NavbarPhone from './navbarPhone';
import { useUserStore } from '@/web/support/user/useUserStore';
import { useSystemStore } from '@/web/common/system/useSystemStore';

const UpdateInviteModal = dynamic(
  () => import('@/components/support/user/team/UpdateInviteModal'),
  { ssr: false }
);

const pcUnShowLayoutRoute: Record<string, boolean> = {
  '/': true,
  '/login': true,
  '/login/provider': true,
  '/login/fastlogin': true,
  '/tools/price': true,
  '/price': true
};

const phoneUnShowLayoutRoute: Record<string, boolean> = {
  '/': true,
  '/login': true,
  '/login/provider': true,
  '/login/fastlogin': true,
  '/tools/price': true,
  '/price': true
};

const Layout = ({ children }: { children: JSX.Element }) => {
  const router = useRouter();
  const { colorMode, setColorMode } = useColorMode();
  const { Loading } = useLoading();
  const { loading, setScreenWidth, isPc } = useSystemStore();
  const { userInfo } = useUserStore();

  const isChatPage = useMemo(
    () => router.pathname === '/chat' && Object.values(router.query).join('').length !== 0,
    [router.pathname, router.query]
  );

  useEffect(() => {
    if (colorMode === 'dark' && router.pathname !== '/chat') {
      setColorMode('light');
    }
  }, [colorMode, router.pathname, setColorMode]);

  useEffect(() => {
    const resize = throttle(() => {
      setScreenWidth(document.documentElement.clientWidth);
    }, 300);

    window.addEventListener('resize', resize);

    resize();

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, [setScreenWidth]);

  const isHideNavbar = pcUnShowLayoutRoute[router.pathname];

  return (
    <>
      <Box h={'100%'} bg={'myGray.100'}>
        {isPc === true && (
          <>
            {isHideNavbar ? (
              <Auth>{children}</Auth>
            ) : (
              <>
                <Box h={'100%'} position={'fixed'} left={0} top={0} w={'64px'}>
                  <Navbar unread={100} />
                </Box>
                <Box h={'100%'} ml={'70px'} overflow={'overlay'}>
                  <Auth>{children}</Auth>
                </Box>
              </>
            )}
          </>
        )}
        {isPc === false && (
          <>
            <Box h={'100%'} display={['block', 'none']}>
              {phoneUnShowLayoutRoute[router.pathname] || isChatPage ? (
                <Auth>{children}</Auth>
              ) : (
                <Flex h={'100%'} flexDirection={'column'}>
                  <Box flex={'1 0 0'} h={0}>
                    <Auth>{children}</Auth>
                  </Box>
                  <Box h={'50px'} borderTop={'1px solid rgba(0,0,0,0.1)'}>
                    <NavbarPhone unread={100} />
                  </Box>
                </Flex>
              )}
            </Box>
          </>
        )}
        {!!userInfo && <UpdateInviteModal />}
      </Box>
      <Loading loading={loading} zIndex={999999} />
    </>
  );
};

export default Layout;
