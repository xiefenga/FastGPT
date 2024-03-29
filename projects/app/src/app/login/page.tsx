'use client'

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import React, { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'
import { FormControl, Flex, Input, Button, Box } from '@chakra-ui/react';

import { useToast } from '@fastgpt/web/hooks/useToast';
import { getErrText } from '@fastgpt/global/common/error/utils'

import { setToken } from '@/web/support/user/auth';
import { loginByAccount } from '@/web/support/user/_api';

interface LoginFormType {
  username: string;
  password: string;
}

const LoginForm = () => {
  const { toast } = useToast();

  const router = useRouter()

  const searchParams = useSearchParams()

  const lastRoute = searchParams?.get('lastRoute') ?? '/chat'

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormType>();

  const [requesting, setRequesting] = useState(false);

  const onClickLogin = async ({ username, password }: LoginFormType) => {
      setRequesting(true);
      try {
        const { token } = await loginByAccount({ username, password });
        setToken(token);
        // app 路由和 page 路由跳转会刷新整个页面，暂时不用设置用户
        // const user = await queryUserInfo();
        toast({ title: '登录成功', status: 'success' });
        setTimeout(() => {
          router.push(`${lastRoute}`)
        }, 500)
      } catch (error: any) {
        toast({
          title: getErrText(error, '登录异常'),
          status: 'error'
        });
      }
      setRequesting(false);
    }

  const onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.keyCode === 13 && !e.shiftKey && !requesting) {
      handleSubmit(onClickLogin)();
    }
  }

  return (
    <>
      <Box mt={'42px'} onKeyDown={onKeyDown}>
        <FormControl isInvalid={!!errors.username}>
          <Input
            bg={'myGray.50'}
            placeholder={'用户名'}
            {...register('username', { required: true })}
          />
        </FormControl>
        <FormControl mt={6} isInvalid={!!errors.password}>
          <Input
            bg={'myGray.50'}
            type={'password'}
            placeholder={'密码'}
            {...register('password', {
              required: true,
              maxLength: {
                value: 60,
                message: '密码最多 60 位'
              }
            })}
          />
        </FormControl>
        <Flex alignItems={'center'} mt={7} fontSize={'sm'}>
          <Box mr={1}>使用即代表你同意我们的</Box>
          <Link href={'/docs/agreement/terms/'} target={'_blank'} color={'primary.500'}>
            服务协议
          </Link>
          <Box mx={1}>和</Box>
          <Link href={'/docs/agreement/privacy/'} target={'_blank'} color={'primary.500'}>
            隐私政策
          </Link>
        </Flex>
        <Button
          type="submit"
          my={6}
          w={'100%'}
          size={['md', 'lg']}
          colorScheme="blue"
          isLoading={requesting}
          onClick={handleSubmit(onClickLogin)}
        >
         登录
        </Button>
        <Flex align={'center'} justifyContent={'flex-end'} color={'primary.700'}>
          <Box
            fontSize="sm"
            cursor={'pointer'}
            _hover={{ textDecoration: 'underline' }}
          >
            <Link replace href={'/login/forget'}>忘记密码</Link>
          </Box>
          <Box mx={3} h={'16px'} w={'1.5px'} bg={'myGray.250'}></Box>
          <Box
            fontSize="sm"
            cursor={'pointer'}
            _hover={{ textDecoration: 'underline' }}
          >
            <Link replace href={'/login/register'}>注册账号</Link>
          </Box>
        </Flex>
      </Box>
    </>
  );
};

export default LoginForm;
