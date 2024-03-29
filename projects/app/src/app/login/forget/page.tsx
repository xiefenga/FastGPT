'use client'

import Link from 'next/link';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormControl, Box, Input, Button } from '@chakra-ui/react';

import { useToast } from '@fastgpt/web/hooks/useToast';

import { useSendCode } from '@/web/support/user/hooks/useSendCode';


interface RegisterType {
  username: string;
  code: string;
  password: string;
  password2: string;
}

const RegisterForm = () => {
  const { toast } = useToast();

  const { register, handleSubmit, getValues, trigger, formState: { errors } } = useForm<RegisterType>({
    mode: 'onBlur'
  });

  const { codeSending, sendCodeText, sendCode, codeCountDown } = useSendCode();

  const onclickSendCode = async () => {
    const check = await trigger('username');
    if (!check) {
      return;
    }
    // await sendCode({
    //   username: getValues('username'),
    //   type: 'findPassword'
    // });
  }

  const [requesting, setRequesting] = useState(false);

  const onclickFindPassword = async ({ username, code, password }: RegisterType) => {
      setRequesting(true);
      try {
        // const { token, user } = await postFindPassword({
        //   username,
        //   code,
        //   password
        // })
        // loginSuccess(user);
        toast({
          title: `密码已找回`,
          status: 'success'
        });
      } catch (error: any) {
        toast({
          title: error.message || '修改密码异常',
          status: 'error'
        });
      }
      setRequesting(false);
    }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.keyCode === 13 && !e.shiftKey && !requesting) {
      handleSubmit(onclickFindPassword)();
    }
  }

  return (
    <>
      <Box fontWeight={'bold'} fontSize={'2xl'} textAlign={'center'}>
        忘记密码
      </Box>
      <Box mt={'42px'} onKeyDown={onKeyDown}>
        <FormControl isInvalid={!!errors.username}>
          <Input
            bg={'myGray.50'}
            placeholder="手机号"
            {...register('username', {
              required: '手机号不能为空',
              pattern: {
                value: /^(?:(?:\+|00)86)?1[3-9]\d{9}$/,
                message: '手机号格式有误'
              }
            })}
          ></Input>
        </FormControl>
        <FormControl
          mt={6}
          isInvalid={!!errors.code}
          display={'flex'}
          alignItems={'center'}
          position={'relative'}
        >
          <Input
            bg={'myGray.50'}
            flex={1}
            maxLength={8}
            placeholder="验证码"
            {...register('code', { required: '验证码不能为空' })}
          ></Input>
          <Box
            position={'absolute'}
            right={3}
            zIndex={1}
            fontSize={'sm'}
            {...(codeCountDown > 0
              ? {
                color: 'myGray.500'
              }
              : {
                color: 'primary.700',
                cursor: 'pointer',
                onClick: onclickSendCode
              })}
          >
            {sendCodeText}
          </Box>
        </FormControl>
        <FormControl mt={6} isInvalid={!!errors.password}>
          <Input
            bg={'myGray.50'}
            type={'password'}
            placeholder="新密码(4~20位)"
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
          ></Input>
        </FormControl>

        <Button
          type="submit"
          mt={10}
          w={'100%'}
          size={['md', 'lg']}
          colorScheme="blue"
          isLoading={requesting}
          onClick={handleSubmit(onclickFindPassword)}
        >
          找回密码
        </Button>
        <Box
          float={'right'}
          fontSize="sm"
          mt={6}
          mb={'50px'}
          color={'primary.700'}
          cursor={'pointer'}
          _hover={{ textDecoration: 'underline' }}
        >
          <Link href={'/login'}>去登录</Link>
        </Box>
      </Box>
    </>
  );
};

export default RegisterForm;
