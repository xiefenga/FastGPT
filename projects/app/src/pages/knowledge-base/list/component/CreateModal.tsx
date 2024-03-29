import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import React, { useCallback, useState } from 'react';
import { QuestionOutlineIcon } from '@chakra-ui/icons';
import { Box, Flex, Button, ModalFooter, ModalBody, Input, Textarea } from '@chakra-ui/react';

import { useToast } from '@fastgpt/web/hooks/useToast';
import { getErrText } from '@fastgpt/global/common/error/utils';
import { MongoImageTypeEnum } from '@fastgpt/global/common/file/image/constants';

import Avatar from '@/components/Avatar';
import MyModal from '@/components/MyModal';
import MyTooltip from '@/components/MyTooltip';
import MyRadio from '@/components/common/MyRadio';
import { useRequest } from '@/web/common/hooks/useRequest';
import MySelect from '@fastgpt/web/components/common/MySelect';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import { useSelectFile } from '@/web/common/file/hooks/useSelectFile';
import type { CreateDatasetParams } from '@/global/core/dataset/api.d';
import { CreateKnowledgeBaseParams } from '@/global/core/knowledge-base/api';

const CreateModal = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation();
  const [refresh, setRefresh] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { isPc } = useSystemStore();

  const vectorDatabaseType = ['faiss', 'milvus', 'zilliz', 'pg', 'es', 'milvus_kwargs', 'chromadb'];

  const embedModelList = [
    'ernie-tiny',
    'ernie-base',
    'text2vec-base',
    'text2vec',
    'text2vec-paraphrase',
    'text2vec-sentence',
    'text2vec-multilingual',
    'text2vec-bge-large-chinese',
    'm3e-small',
    'm3e-base'
  ];

  const { register, setValue, getValues, handleSubmit } = useForm<CreateKnowledgeBaseParams>({
    defaultValues: {
      avatar: '/icon/logo.svg',
      knowledge_base_name: '',
      desc: '',
      vector_store_type: vectorDatabaseType[0],
      embed_model: embedModelList[0]
    }
  });

  const { File, onOpen: onOpenSelectFile } = useSelectFile({
    fileType: '.jpg,.png',
    multiple: false
  });

  const onSelectFile = useCallback(
    async (e: File[]) => {
      const file = e[0];
      if (!file) {
        return;
      }
      try {
        // const src = await compressImgFileAndUpload({
        //   type: MongoImageTypeEnum.datasetAvatar,
        //   file,
        //   maxW: 300,
        //   maxH: 300,
        // })
        // setValue('avatar', src)
        // setRefresh((state) => !state)
      } catch (err: any) {
        toast({
          title: getErrText(err, t('common.avatar.Select Failed')),
          status: 'warning'
        });
      }
    },
    [setValue, t, toast]
  );

  /* create a new kb and router to it */
  const { mutate: onClickCreate, isLoading: creating } = useRequest({
    mutationFn: async (data: CreateDatasetParams) => {
      // const id = await postCreateDataset(data);
      // return id;
    },
    successToast: t('common.Create Success'),
    errorToast: t('common.Create Failed'),
    onSuccess(id) {
      // router.push(`/knowledge-base/detail?datasetId=${id}`);
    }
  });

  return (
    <MyModal
      iconSrc="/imgs/module/db.png"
      title="新建知识库"
      isOpen
      onClose={onClose}
      isCentered={!isPc}
      w={'450px'}
    >
      <ModalBody>
        {/*<>*/}
        {/*  <Box mb={1} color={'myGray.800'} fontWeight={'bold'}>*/}
        {/*    {t('core.dataset.Dataset Type')}*/}
        {/*  </Box>*/}
        {/*  <MyRadio*/}
        {/*    gridGap={2}*/}
        {/*    gridTemplateColumns={'repeat(1,1fr)'}*/}
        {/*    list={[*/}
        {/*      {*/}
        {/*        title: t('core.dataset.Common Dataset'),*/}
        {/*        value: DatasetTypeEnum.dataset,*/}
        {/*        icon: 'core/dataset/commonDataset',*/}
        {/*        desc: t('core.dataset.Common Dataset Desc'),*/}
        {/*      },*/}
        {/*      {*/}
        {/*        title: t('core.dataset.Website Dataset'),*/}
        {/*        value: DatasetTypeEnum.websiteDataset,*/}
        {/*        icon: 'core/dataset/websiteDataset',*/}
        {/*        desc: t('core.dataset.Website Dataset Desc'),*/}
        {/*      },*/}
        {/*    ]}*/}
        {/*    value={getValues('type')}*/}
        {/*    onChange={(e) => {*/}
        {/*      setValue('type', e as `${DatasetTypeEnum}`)*/}
        {/*      setRefresh(!refresh)*/}
        {/*    }}*/}
        {/*  />*/}
        {/*</>*/}
        <Box mt={5}>
          <Box color={'myGray.800'} fontWeight={'bold'}>
            知识库名称
          </Box>
          <Flex mt={1} alignItems={'center'}>
            <MyTooltip label={t('common.avatar.Select Avatar')}>
              <Avatar
                flexShrink={0}
                src={getValues('avatar')}
                w={['28px', '32px']}
                h={['28px', '32px']}
                cursor={'pointer'}
                borderRadius={'md'}
                onClick={onOpenSelectFile}
              />
            </MyTooltip>
            <Input
              ml={3}
              flex={1}
              autoFocus
              bg={'myWhite.600'}
              placeholder={t('common.Name')}
              maxLength={30}
              {...register('knowledge_base_name', {
                required: true
              })}
            />
          </Flex>
        </Box>
        <Box mt={5}>
          <Box color={'myGray.800'} fontWeight={'bold'}>
            知识库简介
          </Box>
          <Textarea
            mt={1}
            bg={'myWhite.600'}
            placeholder="知识库简介"
            {...register('desc', { required: true })}
          />
        </Box>
        <Flex mt={6} alignItems={'center'}>
          <Flex alignItems={'center'} flex={'0 0 100px'}>
            向量库类型
            <MyTooltip label="向量库类型简介">
              <QuestionOutlineIcon ml={1} />
            </MyTooltip>
          </Flex>
          <Box flex={1}>
            <MySelect
              w={'100%'}
              value={getValues('vector_store_type')}
              list={vectorDatabaseType.map((item) => ({
                label: item,
                value: item
              }))}
              onchange={(e) => {
                setValue('vector_store_type', e);
                setRefresh((state) => !state);
              }}
            />
          </Box>
        </Flex>
        <Flex mt={6} alignItems={'center'}>
          <Flex alignItems={'center'} flex={'0 0 130px'}>
            Embedding 模型
            <MyTooltip label="Embedding 模型简介">
              <QuestionOutlineIcon ml={1} />
            </MyTooltip>
          </Flex>
          <Box flex={1}>
            <MySelect
              w={'100%'}
              value={getValues('embed_model')}
              list={embedModelList.map((item) => ({
                label: item,
                value: item
              }))}
              onchange={(e) => {
                setValue('embed_model', e);
                setRefresh((state) => !state);
              }}
            />
          </Box>
        </Flex>
        {/*<Flex mt={6} alignItems={'center'}>*/}
        {/*  <Box flex={'0 0 100px'}>{t('core.ai.model.Dataset Agent Model')}</Box>*/}
        {/*  <Box flex={1}>*/}
        {/*    <MySelect*/}
        {/*      w={'100%'}*/}
        {/*      value={getValues('agentModel')}*/}
        {/*      list={datasetModelList.map((item) => ({*/}
        {/*        label: item.name,*/}
        {/*        value: item.model,*/}
        {/*      }))}*/}
        {/*      onchange={(e) => {*/}
        {/*        setValue('agentModel', e)*/}
        {/*        setRefresh((state) => !state)*/}
        {/*      }}*/}
        {/*    />*/}
        {/*  </Box>*/}
        {/*</Flex>*/}
      </ModalBody>

      <ModalFooter>
        <Button variant={'whiteBase'} mr={3} onClick={onClose}>
          {t('common.Close')}
        </Button>
        <Button isLoading={creating} onClick={handleSubmit((data) => onClickCreate(data))}>
          {t('common.Confirm Create')}
        </Button>
      </ModalFooter>

      <File onSelect={onSelectFile} />
    </MyModal>
  );
};

export default CreateModal;
