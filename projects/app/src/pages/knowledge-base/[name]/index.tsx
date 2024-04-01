import React from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useQuery } from '@tanstack/react-query';
import { Box, Flex, IconButton, useTheme } from '@chakra-ui/react';

import { useToast } from '@fastgpt/web/hooks/useToast';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { DatasetTypeEnum } from '@fastgpt/global/core/dataset/constants';

import Tabs from '@/components/Tabs';
import Avatar from '@/components/Avatar';
import SideTabs from '@/components/SideTabs';
import MyBox from '@/components/common/MyBox';
import { TabEnum } from '../detail/constants';
import PageContainer from '@/components/PageContainer';
import CollectionCard from '../detail/components/CollectionCard';
import { serviceSideProps } from '@/web/common/utils/i18n';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import DatasetTypeTag from '@/components/core/dataset/DatasetTypeTag';
import { useKnowledgeBaseStore } from '@/web/core/knowledge-base/store/knowledge-base';
import { getErrText } from '@fastgpt/global/common/error/utils';

const DataCard = dynamic(() => import('../detail/components/DataCard'));
const Test = dynamic(() => import('../detail/components/Test'));
const Info = dynamic(() => import('../detail/components/Info'));
const Import = dynamic(() => import('../detail/components/Import'));

interface PageProps {
  name: string;
  currentTab: `${TabEnum}`;
}

const Detail = ({ name, currentTab }: PageProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { toast } = useToast();
  const router = useRouter();
  const { isPc } = useSystemStore();

  const { knowledgeBaseDetail, loadKnowledgeBaseDetail } = useKnowledgeBaseStore();

  const tabList = [
    {
      label: '文件',
      id: TabEnum.files,
      icon: 'common/overviewLight'
    },
    { label: t('core.dataset.test.Search Test'), id: TabEnum.test, icon: 'kbTest' },
    { label: t('common.Config'), id: TabEnum.info, icon: 'common/settingLight' }
  ];

  const setCurrentTab = (tab: `${TabEnum}`) => {
    router.replace({
      query: {
        name,
        currentTab: tab
      }
    });
  };

  useQuery([name], () => loadKnowledgeBaseDetail(name), {
    onError(err: any) {
      router.replace(`/knowledge-base`);
      toast({
        title: t(getErrText(err, t('common.Load Failed'))),
        status: 'error'
      });
    }
  });

  return (
    <>
      <Head>
        <title>{knowledgeBaseDetail.name}</title>
      </Head>
      <PageContainer>
        <MyBox display={'flex'} flexDirection={['column', 'row']} h={'100%'} pt={[4, 0]}>
          {isPc ? (
            <Flex
              flexDirection={'column'}
              py={4}
              h={'100%'}
              flex={'0 0 200px'}
              borderRight={theme.borders.base}
            >
              <Box px={4} borderBottom={'1px'} borderColor={'myGray.200'} pb={4} mb={4}>
                <Flex mb={4} alignItems={'center'}>
                  <Avatar src={knowledgeBaseDetail.icon} w={'34px'} borderRadius={'md'} />
                  <Box ml={2}>
                    <Box fontWeight={'bold'}>{knowledgeBaseDetail.name}</Box>
                  </Box>
                </Flex>
                <Flex alignItems={'center'} pl={2} justifyContent={'space-between'}>
                  <DatasetTypeTag type={DatasetTypeEnum.dataset} />
                </Flex>
              </Box>
              <SideTabs
                px={4}
                flex={1}
                mx={'auto'}
                w={'100%'}
                list={tabList}
                activeId={currentTab}
                onChange={(e: any) => {
                  setCurrentTab(e);
                }}
              />
              <Flex
                alignItems={'center'}
                cursor={'pointer'}
                py={2}
                px={3}
                borderRadius={'md'}
                _hover={{ bg: 'myGray.100' }}
                onClick={() => router.replace('/knowledge-base')}
              >
                <IconButton
                  mr={3}
                  icon={<MyIcon name={'common/backFill'} w={'18px'} color={'primary.500'} />}
                  bg={'white'}
                  boxShadow={'1px 1px 9px rgba(0,0,0,0.15)'}
                  size={'smSquare'}
                  borderRadius={'50%'}
                  aria-label={''}
                />
                {t('core.dataset.All Dataset')}
              </Flex>
            </Flex>
          ) : (
            <Box mb={3}>
              <Tabs
                m={'auto'}
                w={'260px'}
                size={isPc ? 'md' : 'sm'}
                list={tabList.map((item) => ({
                  id: item.id,
                  label: item.label
                }))}
                activeId={currentTab}
                onChange={(e: any) => setCurrentTab(e)}
              />
            </Box>
          )}

          <Box flex={'1 0 0'} pb={0}>
            {currentTab === TabEnum.files && <CollectionCard name={name} />}
            {currentTab === TabEnum.dataCard && <DataCard />}
            {currentTab === TabEnum.test && <Test datasetId={name} />}
            {currentTab === TabEnum.info && <Info />}
            {currentTab === TabEnum.import && <Import />}
          </Box>
        </MyBox>
      </PageContainer>
    </>
  );
};

export async function getServerSideProps(context: any) {
  const currentTab = context?.query?.currentTab || TabEnum.files;
  return {
    props: { currentTab, name: context.params.name, ...(await serviceSideProps(context)) }
  };
}

export default React.memo(Detail);
