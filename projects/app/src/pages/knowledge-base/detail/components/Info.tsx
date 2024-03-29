import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import { DeleteIcon } from '@chakra-ui/icons';
import React, { useState, useMemo } from 'react';
import { Box, Flex, Button, IconButton, Input, Textarea } from '@chakra-ui/react';

import Avatar from '@/components/Avatar';
import MyTooltip from '@/components/MyTooltip';
import { useConfirm } from '@/web/common/hooks/useConfirm';
import { useRequest } from '@/web/common/hooks/useRequest';
import { useSelectFile } from '@/web/common/file/hooks/useSelectFile';
import { compressImgFileAndUpload } from '@/web/common/file/controller';
import { KnowledgeBaseItemType } from '@/global/core/knowledge-base/type.d';
import { useKnowledgeBaseStore } from '@/web/core/knowledge-base/store/knowledge-base';

const Info = () => {
  const { t } = useTranslation();

  const { knowledgeBaseDetail } = useKnowledgeBaseStore();

  const { getValues, setValue, register, handleSubmit } = useForm<KnowledgeBaseItemType>({
    defaultValues: knowledgeBaseDetail
  });

  const router = useRouter();

  const [refresh, setRefresh] = useState(false);

  const { openConfirm, ConfirmModal } = useConfirm({
    content: t('core.dataset.Delete Confirm'),
    type: 'delete'
  });

  const { File, onOpen: onOpenSelectFile } = useSelectFile({
    fileType: '.jpg,.png',
    multiple: false
  });

  /* 点击删除 */
  const { mutate: onclickDelete, isLoading: isDeleting } = useRequest({
    mutationFn: () => {
      return Promise.resolve(null);
    },
    onSuccess() {
      router.replace(`/knowledge-base/list`);
    },
    successToast: t('common.Delete Success'),
    errorToast: t('common.Delete Failed')
  });

  const { mutate: onclickSave, isLoading: isSaving } = useRequest({
    mutationFn: () => {
      return Promise.resolve(null);
    },
    onSuccess() {},
    successToast: t('common.Update Success'),
    errorToast: t('common.Update Failed')
  });

  const { mutate: onSelectFile, isLoading: isSelecting } = useRequest({
    mutationFn: (e: File[]) => {
      const file = e[0];
      if (!file) {
        return Promise.resolve(null);
      }
      return Promise.resolve(null);
      // return compressImgFileAndUpload({
      //   type: MongoImageTypeEnum.datasetAvatar,
      //   file,
      //   maxW: 300,
      //   maxH: 300
      // });
    },
    onSuccess(src: string | null) {
      if (src) {
        setValue('icon', src);
        setRefresh((state) => !state);
      }
    },
    errorToast: t('common.avatar.Select Failed')
  });

  const btnLoading = useMemo(() => isDeleting || isSaving, [isDeleting, isSaving]);

  return (
    <Box py={5} px={[5, 10]}>
      <Flex mt={5} w={'100%'} alignItems={'center'}>
        <Box flex={['0 0 90px', '0 0 160px']} w={0}>
          {t('core.dataset.Dataset ID')}
        </Box>
        <Box flex={1}>{knowledgeBaseDetail.id}</Box>
      </Flex>

      <Flex mt={5} w={'100%'} alignItems={'center'}>
        <Box flex={['0 0 90px', '0 0 160px']} w={0}>
          {t('core.dataset.Avatar')}
        </Box>
        <Box flex={[1, '0 0 300px']}>
          <MyTooltip label={t('common.avatar.Select Avatar')}>
            <Avatar
              m={'auto'}
              src={getValues('icon')}
              w={['32px', '40px']}
              h={['32px', '40px']}
              cursor={'pointer'}
              onClick={onOpenSelectFile}
            />
          </MyTooltip>
        </Box>
      </Flex>
      <Flex mt={8} w={'100%'} alignItems={'center'}>
        <Box flex={['0 0 90px', '0 0 160px']} w={0}>
          {t('core.dataset.Name')}
        </Box>
        <Input flex={[1, '0 0 300px']} maxLength={30} {...register('name')} />
      </Flex>
      <Flex mt={8} alignItems={'center'} w={'100%'}>
        <Box flex={['0 0 90px', '0 0 160px']}>{t('common.Intro')}</Box>
        <Textarea flex={[1, '0 0 300px']} {...register('desc')} placeholder={t('common.Intro')} />
      </Flex>
      <Flex mt={8} w={'100%'} alignItems={'center'}>
        <Box flex={['0 0 90px', '0 0 160px']} w={0}>
          向量库类型
        </Box>
        <Box flex={[1, '0 0 300px']}>{getValues('vector_store')}</Box>
      </Flex>
      <Flex mt={6} alignItems={'center'}>
        <Box flex={['0 0 90px', '0 0 160px']} w={0}>
          Embedding 模型
        </Box>
        <Box flex={[1, '0 0 300px']}>{getValues('embed_model')}</Box>
      </Flex>
      <Flex mt={10} w={'100%'} alignItems={'flex-end'}>
        <Box flex={['0 0 90px', '0 0 160px']} w={0}></Box>
        <Button
          isLoading={btnLoading}
          mr={4}
          w={'100px'}
          onClick={handleSubmit((data) => onclickSave(data))}
        >
          {t('common.Save')}
        </Button>
        <IconButton
          isLoading={btnLoading}
          icon={<DeleteIcon />}
          aria-label={''}
          variant={'whiteDanger'}
          size={'mdSquare'}
          onClick={openConfirm(onclickDelete)}
        />
      </Flex>
      <File onSelect={onSelectFile} />
      <ConfirmModal />
    </Box>
  );
};

export default React.memo(Info);
