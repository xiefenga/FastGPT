'use client'
import Link from 'next/link'
import { useForm } from 'react-hook-form';
import React, { useState, useCallback } from 'react';
import { FormControl, Box, Input, Button } from '@chakra-ui/react';

import { useToast } from '@fastgpt/web/hooks/useToast';

import { registerUser } from '@/web/support/user/_api'
import { useRouter } from 'next/navigation'

interface RegisterType {
  user_name: string
  nick_name: string
  phone: string
  password: string
  password2: string
  // code: string
}

const RegisterForm = () => {
  const { toast } = useToast();

  const router = useRouter();

  const { register, handleSubmit, getValues, trigger, formState: { errors } } = useForm<RegisterType>({
    mode: 'onBlur'
  });

  const onClickSendCode = async () => {

  }

  const [requesting, setRequesting] = useState(false);

  const onClickRegister = useCallback(
    async ({ user_name, nick_name, phone, password }: RegisterType) => {
      setRequesting(true);
      try {
        await registerUser({ user_name, nick_name, phone, password })
        toast({ title: `注册成功`, status: 'success' });
        setTimeout(() => {
          router.push('/login')
        }, 500)
      } catch (error: any) {
        toast({
          title: error.message || '注册异常',
          status: 'error'
        });
      }
      setRequesting(false);
    },
    [toast, router]
  );

  return (
    <>
      <Box fontWeight={'bold'} fontSize={'2xl'} textAlign={'center'}>
        注册账号
      </Box>
      <Box
        mt={'42px'}
        onKeyDown={(e) => {
          if (e.keyCode === 13 && !e.shiftKey && !requesting) {
            handleSubmit(onClickRegister)();
          }
        }}
      >
        <FormControl isInvalid={!!errors.user_name}>
          <Input
            bg={'myGray.50'}
            placeholder="账号"
            {...register('user_name', { required: '账号不能为空' })}
          />
        </FormControl>
        <FormControl isInvalid={!!errors.nick_name} mt={6}>
          <Input
            bg={'myGray.50'}
            placeholder="昵称"
            {...register('nick_name', { required: '昵称不能为空' })}
          />
        </FormControl>
        <FormControl isInvalid={!!errors.phone} mt={6}>
          <Input
            bg={'myGray.50'}
            placeholder="手机号"
            {...register('phone', {
              required: '手机号不能为空',
              pattern: {
                value: /^(?:(?:\+|00)86)?1[3-9]\d{9}$/,
                message: '手机号格式有误'
              }
            })}
          />
        </FormControl>
        {/*<FormControl*/}
        {/*  mt={6}*/}
        {/*  isInvalid={!!errors.code}*/}
        {/*  display={'flex'}*/}
        {/*  alignItems={'center'}*/}
        {/*  position={'relative'}*/}
        {/*>*/}
        {/*  <Input*/}
        {/*    bg={'myGray.50'}*/}
        {/*    flex={1}*/}
        {/*    maxLength={8}*/}
        {/*    placeholder="验证码"*/}
        {/*    {...register('code', { required: '验证码不能为空' })}*/}
        {/*  />*/}
        {/*  <Box*/}
        {/*    position={'absolute'}*/}
        {/*    right={3}*/}
        {/*    zIndex={1}*/}
        {/*    fontSize={'sm'}*/}
        {/*    {...(codeCountDown > 0*/}
        {/*      ? {*/}
        {/*        color: 'myGray.500'*/}
        {/*      }*/}
        {/*      : {*/}
        {/*        color: 'primary.700',*/}
        {/*        cursor: 'pointer',*/}
        {/*        onClick: onClickSendCode*/}
        {/*      })}*/}
        {/*  >*/}
        {/*    {sendCodeText}*/}
        {/*  </Box>*/}
        {/*</FormControl>*/}
        <FormControl mt={6} isInvalid={!!errors.password}>
          <Input
            bg={'myGray.50'}
            type={'password'}
            placeholder="密码(4~20位)"
            {...register('password', {
              required: '密码不能为空',
              minLength: {
                value: 4,
                message: '密码最少 4 位最多 20 位'
              },
              maxLength: {
                value: 20,
                message: '密码最少 4 位最多 20 位'
              }
            })}
          ></Input>
        </FormControl>
        <FormControl mt={6} isInvalid={!!errors.password2}>
          <Input
            bg={'myGray.50'}
            type={'password'}
            placeholder="确认密码"
            {...register('password2', {
              validate: (val) => (getValues('password') === val ? true : '两次密码不一致')
            })}
          />
        </FormControl>
        <Button
          type="submit"
          mt={6}
          w={'100%'}
          size={['md', 'lg']}
          colorScheme="blue"
          isLoading={requesting}
          onClick={handleSubmit(onClickRegister)}
        >
          确认注册
        </Button>
        <Box
          float={'right'}
          fontSize="sm"
          mt={10}
          mb={'50px'}
          color={'primary.700'}
          cursor={'pointer'}
          _hover={{ textDecoration: 'underline' }}
        >
          <Link replace href={'/login'}>已有账号，去登录</Link>
        </Box>
      </Box>
    </>
  );
};

export default RegisterForm;
