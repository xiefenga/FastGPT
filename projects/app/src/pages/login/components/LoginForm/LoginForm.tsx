import { useForm } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import React, { useState, Dispatch, useCallback } from 'react';
import { FormControl, Flex, Input, Button, Box, Link } from '@chakra-ui/react';

import { useToast } from '@fastgpt/web/hooks/useToast';

import FormLayout from './components/FormLayout';
import { setToken } from '@/web/support/user/auth';
import { LoginPageTypeEnum } from '@/constants/user';
import type { UserResType } from '@/global/support/api/userRes';
import { loginByAccount, queryUserInfo } from '@/web/support/user/_api';

interface Props {
  setPageType: Dispatch<`${LoginPageTypeEnum}`>;
  loginSuccess: (e: UserResType) => void;
}

interface LoginFormType {
  username: string;
  password: string;
}

const LoginForm = ({ setPageType, loginSuccess }: Props) => {
  const { toast } = useToast();
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormType>();

  const [requesting, setRequesting] = useState(false);

  const onclickLogin = useCallback(
    async ({ username, password }: LoginFormType) => {
      setRequesting(true);
      try {
        const { token } = await loginByAccount({ username, password });
        setToken(token);
        const user = await queryUserInfo();
        loginSuccess(user);
        toast({
          title: '登录成功',
          status: 'success'
        });
      } catch (error: any) {
        toast({
          title: error.message || '登录异常',
          status: 'error'
        });
      }
      setRequesting(false);
    },
    [loginSuccess, toast]
  );

  const loginOptions = [
    t('support.user.login.Phone number'),
    t('support.user.login.Email'),
    t('support.user.login.Username')
  ];

  const placeholder = loginOptions.join('/');

  return (
    <FormLayout setPageType={setPageType} pageType={LoginPageTypeEnum.passwordLogin}>
      <Box
        mt={'42px'}
        onKeyDown={(e) => {
          if (e.keyCode === 13 && !e.shiftKey && !requesting) {
            handleSubmit(onclickLogin)();
          }
        }}
      >
        <FormControl isInvalid={!!errors.username}>
          <Input
            bg={'myGray.50'}
            placeholder={placeholder}
            {...register('username', {
              required: true
            })}
          ></Input>
        </FormControl>
        <FormControl mt={6} isInvalid={!!errors.password}>
          <Input
            bg={'myGray.50'}
            type={'password'}
            placeholder={t('support.user.login.Password')}
            {...register('password', {
              required: true,
              maxLength: {
                value: 60,
                message: '密码最多 60 位'
              }
            })}
          ></Input>
        </FormControl>
        <Flex alignItems={'center'} mt={7} fontSize={'sm'}>
          {t('support.user.login.Policy tip')}
          <Link ml={1} href={'/docs/agreement/terms/'} target={'_blank'} color={'primary.500'}>
            {t('support.user.login.Terms')}
          </Link>
          <Box mx={1}>{t('support.user.login.And')}</Box>
          <Link href={'/docs/agreement/privacy/'} target={'_blank'} color={'primary.500'}>
            {t('support.user.login.Privacy')}
          </Link>
        </Flex>

        <Button
          type="submit"
          my={6}
          w={'100%'}
          size={['md', 'lg']}
          colorScheme="blue"
          isLoading={requesting}
          onClick={handleSubmit(onclickLogin)}
        >
          {t('home.Login')}
        </Button>

        <Flex align={'center'} justifyContent={'flex-end'} color={'primary.700'}>
          <Box
            cursor={'pointer'}
            _hover={{ textDecoration: 'underline' }}
            onClick={() => setPageType('forgetPassword')}
            fontSize="sm"
          >
            {t('support.user.login.Forget Password')}
          </Box>
          <Box mx={3} h={'16px'} w={'1.5px'} bg={'myGray.250'}></Box>
          <Box
            cursor={'pointer'}
            _hover={{ textDecoration: 'underline' }}
            onClick={() => setPageType('register')}
            fontSize="sm"
          >
            {t('support.user.login.Register')}
          </Box>
          <Box mx={3} h={'16px'} w={'1.5px'} bg={'myGray.250'}></Box>
          <Box
            cursor={'pointer'}
            _hover={{ textDecoration: 'underline' }}
            onClick={() => setPageType('wechat')}
            fontSize="sm"
          >
            微信登录
          </Box>
        </Flex>
      </Box>
    </FormLayout>
  );
};

export default LoginForm;
