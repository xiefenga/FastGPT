import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import { ModalBody, Box, Flex, Input, ModalFooter, Button } from '@chakra-ui/react';

import MyModal from '@/components/MyModal';
import { updateUserInfo } from '@/web/support/user/_api'
import { useRequest } from '@/web/common/hooks/useRequest';

type FormType = {
  password: string;
  confirmPassword: string;
};

const UpdatePswModal = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation();
  const { register, handleSubmit } = useForm<FormType>({
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  });

  const { mutate: onSubmit, isLoading } = useRequest({
    mutationFn: (data: FormType) => {
      if (data.password !== data.confirmPassword) {
        return Promise.reject(t('common.Password inconsistency'));
      }
      return updateUserInfo({ password: data.password })
    },
    onSuccess() {
      onClose();
    },
    successToast: t('user.Update password successful'),
    errorToast: t('user.Update password failed')
  });

  return (
    <MyModal
      isOpen
      onClose={onClose}
      iconSrc="/imgs/modal/password.svg"
      title={t('user.Update Password')}
    >
      <ModalBody>
        <Flex alignItems={'center'} mt={5}>
          <Box flex={'0 0 70px'}>新密码:</Box>
          <Input
            flex={1}
            type={'password'}
            placeholder={'请输入密码'}
            {...register('password', {
              required: true,
              maxLength: {
                value: 60,
                message: '密码最少 4 位最多 60 位'
              }
            })}
          ></Input>
        </Flex>
        <Flex alignItems={'center'} mt={5}>
          <Box flex={'0 0 70px'}>确认密码:</Box>
          <Input
            flex={1}
            type={'password'}
            placeholder={'请确认密码'}
            {...register('confirmPassword', {
              required: true,
              maxLength: {
                value: 60,
                message: '密码最少 4 位最多 60 位'
              }
            })}
          ></Input>
        </Flex>
      </ModalBody>
      <ModalFooter>
        <Button mr={3} variant={'whiteBase'} onClick={onClose}>
          取消
        </Button>
        <Button isLoading={isLoading} onClick={handleSubmit((data) => onSubmit(data))}>
          确认
        </Button>
      </ModalFooter>
    </MyModal>
  );
};

export default UpdatePswModal;
