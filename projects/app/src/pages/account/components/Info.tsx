import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import { useQuery } from '@tanstack/react-query';
import React, { useCallback, useMemo } from 'react';
import { Box, Flex, Button, useDisclosure, useTheme, Input, Link, Progress, Grid } from '@chakra-ui/react';

import { useToast } from '@fastgpt/web/hooks/useToast';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { formatTime2YMD } from '@fastgpt/global/common/string/time';
import { MongoImageTypeEnum } from '@fastgpt/global/common/file/image/constants';
import { standardSubLevelMap } from '@fastgpt/global/support/wallet/sub/constants';

import Avatar from '@/components/Avatar';
import { UserResType } from '@/types/api/user';
import MyTooltip from '@/components/MyTooltip';
import { UserUpdateParams } from '@/types/user';
import { useUserStore } from '@/web/support/user/useUserStore';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import { useSelectFile } from '@/web/common/file/hooks/useSelectFile';
import { compressImgFileAndUpload } from '@/web/common/file/controller';
import { AI_POINT_USAGE_CARD_ROUTE } from '@/web/support/wallet/sub/constants';
import StandardPlanContentList from '@/components/support/wallet/StandardPlanContentList';

const StandDetailModal = dynamic(() => import('./standardDetailModal'));
const PayModal = dynamic(() => import('./PayModal'));
const UpdatePswModal = dynamic(() => import('./UpdatePswModal'));
const OpenAIAccountModal = dynamic(() => import('./OpenAIAccountModal'));

const Account = () => {
  const { isPc } = useSystemStore();
  const { initUserInfo } = useUserStore();

  useQuery(['init'], initUserInfo);

  return (
    <Box py={[3, '28px']} px={['5vw', '64px']}>
      {isPc ? (
        <Flex justifyContent={'center'}>
          <Box flex={'0 0 330px'}>
            <MyInfo />
            <Box mt={9}>
              <Other />
            </Box>
          </Box>
          <Box ml={'45px'} flex={'1 0 0'} maxW={'600px'}>
            <PlanUsage />
          </Box>
        </Flex>
      ) : (
        <>
          <MyInfo />
          <PlanUsage />
          <Other />
        </>
      )}
    </Box>
  );
};

export default React.memo(Account);

const MyInfo = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { userInfo, updateUserInfo } = useUserStore();
  const { reset } = useForm<UserUpdateParams>({
    defaultValues: userInfo as UserResType
  });
  const { isPc } = useSystemStore();

  const { toast } = useToast();

  const { isOpen: isOpenPayModal, onClose: onClosePayModal, onOpen: onOpenPayModal } = useDisclosure();

  const {
    isOpen: isOpenUpdatePsw,
    onClose: onCloseUpdatePsw,
    onOpen: onOpenUpdatePsw
  } = useDisclosure();

  const { File, onOpen: onOpenSelectFile } = useSelectFile({
    fileType: '.jpg,.png',
    multiple: false
  });

  const onclickSave = useCallback(
    async (data: UserResType) => {
      await updateUserInfo({
        avatar: data.avatar
      });
      reset(data);
      toast({
        title: '更新数据成功',
        status: 'success'
      });
    },
    [reset, toast, updateUserInfo]
  );

  const onSelectFile = useCallback(
    async (e: File[]) => {
      const file = e[0];
      if (!file || !userInfo) {
        return;
      }
      try {
        const src = await compressImgFileAndUpload({
          type: MongoImageTypeEnum.userAvatar,
          file,
          maxW: 300,
          maxH: 300
        });

        await onclickSave({
          ...userInfo,
          avatar: src
        });
      } catch (err: any) {
        toast({
          title: typeof err === 'string' ? err : t('common.error.Select avatar failed'),
          status: 'warning'
        });
      }
    },
    [onclickSave, t, toast, userInfo]
  );

  const changeUserInfo = async (userInfo: Parameters<typeof updateUserInfo>[0]) => {
    try {
      await updateUserInfo(userInfo)
      toast({
        title: '修改成功',
        status: 'success'
      });
    } catch (error: any) {
      toast({
        title:  error.message || '修改失败',
        status: 'error'
      });
    }
  }

  return (
    <Box>
      {/* user info */}
      {isPc && (
        <Flex alignItems={'center'} fontSize={'xl'} h={'30px'}>
          <MyIcon mr={2} name={'support/user/userLight'} w={'20px'} />
          {t('support.user.User self info')}
        </Flex>
      )}

      <Box mt={[0, 6]}>
        {isPc ? (
          <Flex alignItems={'center'} cursor={'pointer'}>
            <Box flex={'0 0 80px'}>{t('support.user.Avatar')}:&nbsp;</Box>
            <MyTooltip label={t('common.avatar.Select Avatar')}>
              <Box
                w={['44px', '56px']}
                h={['44px', '56px']}
                borderRadius={'50%'}
                border={theme.borders.base}
                overflow={'hidden'}
                p={'2px'}
                boxShadow={'0 0 5px rgba(0,0,0,0.1)'}
                mb={2}
                onClick={onOpenSelectFile}
              >
                <Avatar src={userInfo?.avatar} borderRadius={'50%'} w={'100%'} h={'100%'} />
              </Box>
            </MyTooltip>
          </Flex>
        ) : (
          <Flex
            flexDirection={'column'}
            alignItems={'center'}
            cursor={'pointer'}
            onClick={onOpenSelectFile}
          >
            <MyTooltip label={'更换头像'}>
              <Box
                w={['44px', '54px']}
                h={['44px', '54px']}
                borderRadius={'50%'}
                border={theme.borders.base}
                overflow={'hidden'}
                p={'2px'}
                boxShadow={'0 0 5px rgba(0,0,0,0.1)'}
                mb={2}
              >
                <Avatar src={userInfo?.avatar} borderRadius={'50%'} w={'100%'} h={'100%'} />
              </Box>
            </MyTooltip>

            <Flex alignItems={'center'} fontSize={'sm'} color={'myGray.600'}>
              <MyIcon mr={1} name={'edit'} w={'14px'} />
              {t('user.Replace')}
            </Flex>
          </Flex>
        )}
        <Flex mt={[0, 4]} alignItems={'center'}>
          <Box flex={'0 0 80px'}>{t('user.Member Name')}:&nbsp;</Box>
          <Input
            flex={'1 0 0'}
            defaultValue={userInfo?.nick_name}
            title={t('user.Edit name')}
            borderColor={'transparent'}
            transform={'translateX(-11px)'}
            maxLength={20}
            onBlur={async (e) => {
              const val = e.target.value
              if (val !== userInfo?.nick_name) {
                await changeUserInfo({ nick_name: val })
              }
            }}
          />
        </Flex>
        <Flex alignItems={'center'} mt={6}>
          <Box flex={'0 0 80px'}>{t('user.Account')}:&nbsp;</Box>
          <Input
            flex={'1 0 0'}
            defaultValue={userInfo?.user_name}
            title={t('user.Edit name')}
            borderColor={'transparent'}
            transform={'translateX(-11px)'}
            maxLength={20}
            onBlur={async (e) => {
              const val = e.target.value
              if (val !== userInfo?.user_name) {
                await changeUserInfo({ user_name: val })
              }
            }}
          />
        </Flex>
        <Flex alignItems={'center'} mt={6}>
          <Box flex={'0 0 80px'}>手机号:</Box>
          <Input
            flex={'1 0 0'}
            defaultValue={userInfo?.phone}
            title={'手机号'}
            borderColor={'transparent'}
            transform={'translateX(-11px)'}
            maxLength={20}
            onBlur={async (e) => {
              const val = e.target.value
              if (val !== userInfo?.phone) {
                await changeUserInfo({ phone: val })
              }
            }}
          />
        </Flex>
        <Flex mt={6} alignItems={'center'}>
          <Box flex={'0 0 80px'}>{t('user.Password')}:&nbsp;</Box>
          <Box flex={1}>{'*'.repeat(8)}</Box>
          <Button size={'sm'} variant={'whitePrimary'} onClick={onOpenUpdatePsw}>
            {t('user.Change')}
          </Button>
        </Flex>
      </Box>
      {isOpenPayModal && <PayModal onClose={onClosePayModal} />}
      {isOpenUpdatePsw && <UpdatePswModal onClose={onCloseUpdatePsw} />}
      <File onSelect={onSelectFile} />
    </Box>
  );
};
const PlanUsage = () => {
  const { isPc } = useSystemStore();
  const router = useRouter();
  const { t } = useTranslation();
  const { userInfo, initUserInfo } = useUserStore();
  const { reset } = useForm<UserUpdateParams>({
    defaultValues: userInfo as UserResType
  });

  const teamPlanStatus: any = useMemo(
    () => ({
      standard: {
        _id: '',
        teamId: '',
        type: `month`,
        status: 'active',
        startTime: new Date(),
        expiredTime: new Date(),
        price: 100,

        currentMode: `month`,
        nextMode: `month`,
        currentSubLevel: `team`,
        nextSubLevel: `free`,

        pointPrice: 100,
        totalPoints: 100,
        surplusPoints: 100,

        currentExtraDatasetSize: 100
      },
      standardConstants: {
        price: 100, // read price / month
        pointPrice: 100, // read price/ one thousand
        totalPoints: 100, // n
        maxTeamMember: 100,
        maxAppAmount: 100, // max app or plugin amount
        maxDatasetAmount: 100,
        chatHistoryStoreDuration: 100, // n day
        maxDatasetSize: 100,
        trainingWeight: 4, // 1~4
        permissionCustomApiKey: true,
        permissionCustomCopyright: true, // feature
        permissionWebsiteSync: true,
        permissionReRank: true
      },

      totalPoints: 100,
      usedPoints: 100,
      // standard + extra
      datasetMaxSize: 100,
      usedDatasetSize: 100
    }),
    []
  );

  const {
    isOpen: isOpenStandardModal,
    onClose: onCloseStandardModal,
    onOpen: onOpenStandardModal
  } = useDisclosure();

  const planName = useMemo(() => {
    if (!teamPlanStatus?.standard?.currentSubLevel) {
      return '';
    }
    // @ts-ignore
    return standardSubLevelMap[teamPlanStatus.standard.currentSubLevel].label;
  }, [teamPlanStatus?.standard?.currentSubLevel]);
  const standardPlan = teamPlanStatus?.standard;

  useQuery(['init'], initUserInfo, {
    onSuccess(res) {
      reset(res);
    }
  });

  const datasetUsageMap = useMemo(() => {
    if (!teamPlanStatus) {
      return {
        colorScheme: 'green',
        value: 0,
        maxSize: t('common.Unlimited'),
        usedSize: 0
      };
    }
    const rate = teamPlanStatus.usedDatasetSize / teamPlanStatus.datasetMaxSize;

    const colorScheme = (() => {
      if (rate < 0.5) {
        return 'green';
      }
      if (rate < 0.8) {
        return 'yellow';
      }
      return 'red';
    })();

    return {
      colorScheme,
      value: rate * 100,
      maxSize: teamPlanStatus.datasetMaxSize || t('common.Unlimited'),
      usedSize: teamPlanStatus.usedDatasetSize
    };
  }, [teamPlanStatus, t]);
  const aiPointsUsageMap = useMemo(() => {
    if (!teamPlanStatus) {
      return {
        colorScheme: 'green',
        value: 0,
        maxSize: t('common.Unlimited'),
        usedSize: 0
      };
    }

    const rate = teamPlanStatus.usedPoints / teamPlanStatus.totalPoints;

    const colorScheme = (() => {
      if (rate < 0.5) {
        return 'green';
      }
      if (rate < 0.8) {
        return 'yellow';
      }
      return 'red';
    })();

    return {
      colorScheme,
      value: rate * 100,
      max: teamPlanStatus.totalPoints ? teamPlanStatus.totalPoints : t('common.Unlimited'),
      used: teamPlanStatus.usedPoints ? Math.round(teamPlanStatus.usedPoints) : 0
    };
  }, [teamPlanStatus, t]);

  return standardPlan ? (
    <Box mt={[6, 0]}>
      <Flex fontSize={'xl'} h={'30px'}>
        <Flex alignItems={'center'}>
          <MyIcon mr={2} name={'support/account/plans'} w={'20px'} />
          {t('support.wallet.subscription.Team plan and usage')}
        </Flex>
        <Button ml={4} size={'sm'} onClick={() => router.push(AI_POINT_USAGE_CARD_ROUTE)}>
          {t('support.user.Price')}
        </Button>
        <Button ml={4} variant={'whitePrimary'} size={'sm'} onClick={onOpenStandardModal}>
          {t('support.wallet.Standard Plan Detail')}
        </Button>
      </Flex>
      <Box
        mt={[3, 6]}
        bg={'white'}
        borderWidth={'1px'}
        borderColor={'borderColor.low'}
        borderRadius={'md'}
      >
        <Flex px={[5, 10]} py={[3, 6]}>
          <Box flex={'1 0 0'}>
            <Box color={'myGray.600'} fontSize="sm">
              {t('support.wallet.subscription.Current plan')}
            </Box>
            <Box fontWeight={'bold'} fontSize="xl">
              {t(planName)}
            </Box>
            <Flex mt="3" color={'#485264'} fontSize="sm">
              <Box>{t('common.Expired Time')}:</Box>
              <Box ml={2}>{formatTime2YMD(standardPlan?.expiredTime)}</Box>
            </Flex>
          </Box>
          <Button onClick={() => router.push('/price')}>
            {t('support.wallet.subscription.Upgrade plan')}
          </Button>
        </Flex>
        <Box py={3} borderTopWidth={'1px'} borderTopColor={'borderColor.base'}>
          <Box py={[0, 3]} px={[5, 10]} overflow={'auto'}>
            <StandardPlanContentList
              level={standardPlan?.currentSubLevel}
              mode={standardPlan.currentMode}
            />
          </Box>
        </Box>
      </Box>
      <Box
        mt={6}
        bg={'white'}
        borderWidth={'1px'}
        borderColor={'borderColor.low'}
        borderRadius={'md'}
        px={[5, 10]}
        py={[4, 7]}
      >
        <Box width={'100%'}>
          <Flex alignItems={'center'}>
            <Flex alignItems={'center'}>
              <Box fontWeight={'bold'}>{t('support.user.team.Dataset usage')}</Box>
              <Box color={'myGray.600'} ml={2}>
                {datasetUsageMap.usedSize}/{datasetUsageMap.maxSize}
              </Box>
            </Flex>
          </Flex>
          <Box mt={3}>
            <Progress
              size={'sm'}
              value={datasetUsageMap.value}
              colorScheme={datasetUsageMap.colorScheme}
              borderRadius={'md'}
              isAnimated
              hasStripe
              borderWidth={'1px'}
              borderColor={'borderColor.low'}
            />
          </Box>
        </Box>
        <Box mt="9" width={'100%'}>
          <Flex alignItems={'center'}>
            <Flex alignItems={'center'}>
              <Box fontWeight={'bold'}>{t('support.wallet.subscription.AI points')}</Box>
              <Box color={'myGray.600'} ml={2}>
                {aiPointsUsageMap.used}/{aiPointsUsageMap.max}
              </Box>
            </Flex>
          </Flex>
          <Box mt={3}>
            <Progress
              size={'sm'}
              value={aiPointsUsageMap.value}
              colorScheme={aiPointsUsageMap.colorScheme}
              borderRadius={'md'}
              isAnimated
              hasStripe
              borderWidth={'1px'}
              borderColor={'borderColor.low'}
            />
          </Box>
        </Box>
        <Flex></Flex>
      </Box>
      {isOpenStandardModal && <StandDetailModal onClose={onCloseStandardModal} />}
    </Box>
  ) : null;
};

const Other = () => {
  const theme = useTheme();
  const { systemVersion } = useSystemStore();
  const { t } = useTranslation();
  const { userInfo, updateUserInfo } = useUserStore();
  const { reset } = useForm<UserUpdateParams>({
    defaultValues: userInfo as UserResType
  });

  const { isOpen: isOpenOpenai, onClose: onCloseOpenai, onOpen: onOpenOpenai } = useDisclosure();

  return (
    <Box>
      <Grid gridGap={4} mt={3}>
        <Link
          bg={'white'}
          href={'/docs/intro'}
          target="_blank"
          display={'flex'}
          py={3}
          px={6}
          border={theme.borders.sm}
          borderWidth={'1.5px'}
          borderRadius={'md'}
          alignItems={'center'}
          userSelect={'none'}
          textDecoration={'none !important'}
        >
          <MyIcon name={'common/courseLight'} w={'18px'} color={'myGray.600'} />
          <Box ml={2} flex={1}>
            {t('system.Help Document')}
          </Box>
          <Box w={'8px'} h={'8px'} borderRadius={'50%'} bg={'#67c13b'} />
          <Box fontSize={'md'} ml={2}>
            V{systemVersion}
          </Box>
        </Link>
        <Link
          href={''}
          target="_blank"
          display={'flex'}
          py={3}
          px={6}
          bg={'white'}
          border={theme.borders.sm}
          borderWidth={'1.5px'}
          borderRadius={'md'}
          alignItems={'center'}
          userSelect={'none'}
          textDecoration={'none !important'}
        >
          <MyIcon name={'core/app/aiLight'} w={'18px'} />
          <Box ml={2} flex={1}>
            {t('common.system.Help Chatbot')}
          </Box>
        </Link>

        <Flex
          bg={'white'}
          py={4}
          px={6}
          border={theme.borders.sm}
          borderWidth={'1.5px'}
          borderRadius={'md'}
          alignItems={'center'}
          cursor={'pointer'}
          userSelect={'none'}
          onClick={onOpenOpenai}
        >
          <MyIcon name={'common/openai'} w={'18px'} color={'myGray.600'} />
          <Box ml={2} flex={1}>
            OpenAI/OneAPI 账号
          </Box>
          <Box w={'9px'} h={'9px'} borderRadius={'50%'} bg={'#67c13b'} />
        </Flex>
      </Grid>

      {isOpenOpenai && (
        <OpenAIAccountModal
          defaultData={{ key: '', baseUrl: '' }}
          onSuccess={() => Promise.resolve()}
          onClose={onCloseOpenai}
        />
      )}
    </Box>
  );
};
