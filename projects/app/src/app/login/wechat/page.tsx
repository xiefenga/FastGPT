'use client';
import React from 'react';
import { Box, Center } from '@chakra-ui/react';

import { useToast } from '@fastgpt/web/hooks/useToast';
import MyIcon from '@fastgpt/web/components/common/Icon';
// import Loading from '@fastgpt/web/components/common/MyLoading';

const WechatForm = () => {
  const { toast } = useToast();

  // const { data: wechatInfo } = useQuery(['getWXLoginQR'], getWXLoginQR, {
  //   onError(err) {
  //     toast({
  //       status: 'warning',
  //       title: getErrText(err, '获取二维码失败')
  //     });
  //   }
  // });

  // useQuery(['getWXLoginResult', wechatInfo?.code], () => getWXLoginResult(wechatInfo?.code || ''), {
  //   refetchInterval: 3 * 1000,
  //   enabled: !!wechatInfo?.code,
  //   onSuccess() {
  //     // loginSuccess(data);
  //   }
  // });

  return (
    <Box>
      <Box w={'full'} textAlign={'center'} fontWeight={700} pt={5}>
        微信扫码登录
      </Box>
      <Box p={5} display={'flex'} w={'full'} justifyContent={'center'}>
        <Center w={300} h={300} position={'relative'}>
          <MyIcon name="comingSoon" w={300} />
        </Center>
        {/*{wechatInfo?.codeUrl ? (*/}
        {/*  <Image w="300px" src={wechatInfo?.codeUrl} alt="qrcode" />*/}
        {/*) : (*/}
        {/*  <Center w={300} h={300} position={'relative'}>*/}
        {/*    <Loading fixed={false} />*/}
        {/*  </Center>*/}
        {/*)}*/}
      </Box>
    </Box>
  );
};

export default WechatForm;
