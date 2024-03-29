import Script from 'next/script';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React, { useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import { Box, Flex, useTheme } from '@chakra-ui/react';

import Tabs from '@/components/Tabs';
import UserInfo from './components/Info';
import SideTabs from '@/components/SideTabs';
import { logout } from '@/web/support/user/_api';
import { clearToken } from '@/web/support/user/auth';
import PageContainer from '@/components/PageContainer';
import { useConfirm } from '@/web/common/hooks/useConfirm';
import { useUserStore } from '@/web/support/user/useUserStore';
import { serviceSideProps } from '@/web/common/utils/i18n';
import { useSystemStore } from '@/web/common/system/useSystemStore';

const Promotion = dynamic(() => import('./components/Promotion'));
const UsageTable = dynamic(() => import('./components/UsageTable'));
const BillTable = dynamic(() => import('./components/BillTable'));
const InformTable = dynamic(() => import('./components/InformTable'));
const ApiKeyTable = dynamic(() => import('./components/ApiKeyTable'));

enum TabEnum {
  'info' = 'info',
  'promotion' = 'promotion',
  'usage' = 'usage',
  'bill' = 'bill',
  'inform' = 'inform',
  'apikey' = 'apikey',
  'loginout' = 'loginout'
}

interface AccountProps {
  currentTab: `${TabEnum}`;
}

const Account: React.FC<AccountProps> = ({ currentTab }) => {
  const { t } = useTranslation();
  const { setUserInfo } = useUserStore();
  const { isPc } = useSystemStore();

  const tabList = [
    {
      icon: 'support/user/userLight',
      label: t('user.Personal Information'),
      id: TabEnum.info
    },
    {
      icon: 'support/usage/usageRecordLight',
      label: t('user.Usage Record'),
      id: TabEnum.usage
    },
    {
      icon: 'support/bill/payRecordLight',
      label: t('support.wallet.Bills'),
      id: TabEnum.bill
    },
    {
      icon: 'support/account/promotionLight',
      label: t('user.Promotion Record'),
      id: TabEnum.promotion
    },
    {
      icon: 'support/outlink/apikeyLight',
      label: t('user.apikey.key'),
      id: TabEnum.apikey
    },
    {
      icon: 'support/user/informLight',
      label: t('user.Notice'),
      id: TabEnum.inform
    },
    {
      icon: 'support/account/loginoutLight',
      label: t('user.Sign Out'),
      id: TabEnum.loginout
    }
  ];

  const { openConfirm, ConfirmModal } = useConfirm({
    content: '确认退出登录？'
  });

  const router = useRouter();
  const theme = useTheme();

  const setCurrentTab = useCallback(
    (tab: string) => {
      if (tab === TabEnum.loginout) {
        openConfirm(() => {
          logout()
            .finally(() => {
              clearToken();
              setUserInfo(null);
            })
            .then(() => router.replace('/login'));
        })();
      } else {
        router.replace({
          query: {
            currentTab: tab
          }
        });
      }
    },
    [openConfirm, router, setUserInfo]
  );

  return (
    <>
      <Script src="/js/qrcode.min.js" strategy="lazyOnload"></Script>
      <PageContainer>
        <Flex flexDirection={['column', 'row']} h={'100%'} pt={[4, 0]}>
          {isPc ? (
            <Flex
              flexDirection={'column'}
              p={4}
              h={'100%'}
              flex={'0 0 200px'}
              borderRight={theme.borders.base}
            >
              <SideTabs
                flex={1}
                mx={'auto'}
                mt={2}
                w={'100%'}
                list={tabList}
                activeId={currentTab}
                onChange={setCurrentTab}
              />
            </Flex>
          ) : (
            <Box mb={3}>
              <Tabs
                m={'auto'}
                size={isPc ? 'md' : 'sm'}
                list={tabList.map((item) => ({
                  id: item.id,
                  label: item.label
                }))}
                activeId={currentTab}
                onChange={setCurrentTab}
              />
            </Box>
          )}

          <Box flex={'1 0 0'} h={'100%'} pb={[4, 0]}>
            {currentTab === TabEnum.info && <UserInfo />}
            {currentTab === TabEnum.promotion && <Promotion />}
            {currentTab === TabEnum.usage && <UsageTable />}
            {currentTab === TabEnum.bill && <BillTable />}
            {currentTab === TabEnum.inform && <InformTable />}
            {currentTab === TabEnum.apikey && <ApiKeyTable />}
          </Box>
        </Flex>
        <ConfirmModal />
      </PageContainer>
    </>
  );
};

export async function getServerSideProps(content: any) {
  return {
    props: {
      currentTab: content?.query?.currentTab || TabEnum.info,
      ...(await serviceSideProps(content))
    }
  };
}

export default Account;
