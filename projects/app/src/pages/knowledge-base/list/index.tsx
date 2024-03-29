import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { AddIcon } from '@chakra-ui/icons';
import { useTranslation } from 'next-i18next';
import React, { useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Flex, Grid, useDisclosure, Image, Button } from '@chakra-ui/react';

import { useToast } from '@fastgpt/web/hooks/useToast';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { getErrText } from '@fastgpt/global/common/error/utils';
import {
  DatasetTypeEnum,
  DatasetTypeMap,
  FolderIcon
} from '@fastgpt/global/core/dataset/constants';

import MyMenu from '@/components/MyMenu';
import Avatar from '@/components/Avatar';
import { useDrag } from '@/web/common/hooks/useDrag';
import PageContainer from '@/components/PageContainer';
import ParentPaths from '@/components/common/ParentPaths';
import { useRequest } from '@/web/common/hooks/useRequest';
import { serviceSideProps } from '@/web/common/utils/i18n';
import { useConfirm } from '@/web/common/hooks/useConfirm';
import { useEditTitle } from '@/web/common/hooks/useEditTitle';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import DatasetTypeTag from '@/components/core/dataset/DatasetTypeTag';
import EditFolderModal, { useEditFolder } from '../component/EditFolderModal';
import { useKnowledgeBaseStore } from '@/web/core/knowledge-base/store/knowledge-base';

const CreateModal = dynamic(() => import('./component/CreateModal'), { ssr: false });
const MoveModal = dynamic(() => import('./component/MoveModal'), { ssr: false });

const Kb = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const router = useRouter();
  const { parentId } = router.query as { parentId: string };
  const { setLoading } = useSystemStore();

  const DeleteTipsMap = useRef({
    [DatasetTypeEnum.folder]: t('dataset.deleteFolderTips'),
    [DatasetTypeEnum.dataset]: t('core.dataset.Delete Confirm'),
    [DatasetTypeEnum.websiteDataset]: t('core.dataset.Delete Confirm')
  });

  const { openConfirm, ConfirmModal } = useConfirm({
    type: 'delete'
  });
  const { knowledgeBases, lodadKnowledgeBases, setKnowledgeBases } = useKnowledgeBaseStore();

  const { onOpenModal: onOpenTitleModal, EditModal: EditTitleModal } = useEditTitle({
    title: t('Rename')
  });
  const { moveDataId, setMoveDataId, dragStartId, setDragStartId, dragTargetId, setDragTargetId } =
    useDrag();

  const {
    isOpen: isOpenCreateModal,
    onOpen: onOpenCreateModal,
    onClose: onCloseCreateModal
  } = useDisclosure();
  const { editFolderData, setEditFolderData } = useEditFolder();

  /* 点击删除 */
  const { mutate: onClickDelKnowledgeBase } = useRequest({
    mutationFn: async (id: string) => {
      setLoading(true);
      // 删除知识库
      return id;
    },
    onSuccess(id: string) {
      setKnowledgeBases(knowledgeBases.filter((item) => item.id !== id));
    },
    onSettled() {
      setLoading(false);
    },
    successToast: t('common.Delete Success'),
    errorToast: t('dataset.Delete Dataset Error')
  });

  const { refetch, isFetching } = useQuery(
    ['loadDataset', parentId],
    () => {
      return Promise.all([lodadKnowledgeBases()]);
    },
    {
      onError(err) {
        toast({
          status: 'error',
          title: t(getErrText(err))
        });
      }
    }
  );

  const formatKnowledgeBaseList = useMemo(
    () =>
      knowledgeBases.map((item) => {
        return {
          ...item,
          label: item.name,
          icon: DatasetTypeMap[DatasetTypeEnum.dataset].icon
        };
      }),
    [knowledgeBases]
  );

  return (
    <PageContainer isLoading={isFetching} insertProps={{ px: [5, '48px'] }}>
      <Flex pt={[4, '30px']} alignItems={'center'} justifyContent={'space-between'}>
        {/* url path */}
        <ParentPaths
          paths={[]}
          FirstPathDom={
            <Flex flex={1} alignItems={'center'}>
              <Image src={'/imgs/module/db.png'} alt={''} mr={2} h={'24px'} />
              <Box className="textlg" letterSpacing={1} fontSize={'24px'} fontWeight={'bold'}>
                {t('core.dataset.My Dataset')}
              </Box>
            </Flex>
          }
          onClick={() => {}}
        />
        {/* create icon */}
        <MyMenu
          offset={[-30, 5]}
          width={120}
          Button={
            <Button variant={'primaryOutline'} px={0}>
              <Flex alignItems={'center'} px={'20px'}>
                <AddIcon mr={2} />
                <Box>{t('common.Create New')}</Box>
              </Flex>
            </Button>
          }
          menuList={[
            {
              label: (
                <Flex>
                  <MyIcon name={FolderIcon} w={'20px'} mr={1} />
                  {t('Folder')}
                </Flex>
              ),
              onClick: () => setEditFolderData({})
            },
            {
              label: (
                <Flex>
                  <Image src={'/imgs/module/db.png'} alt={''} w={'20px'} mr={1} />
                  {t('core.dataset.Dataset')}
                </Flex>
              ),
              onClick: onOpenCreateModal
            }
          ]}
        />
      </Flex>
      <Grid
        py={5}
        gridGap={5}
        userSelect={'none'}
        gridTemplateColumns={['1fr', 'repeat(2,1fr)', 'repeat(3,1fr)', 'repeat(4,1fr)']}
      >
        {formatKnowledgeBaseList.map((knowledgeBase) => (
          <Box
            display={'flex'}
            flexDirection={'column'}
            key={knowledgeBase.id}
            py={3}
            px={5}
            cursor={'pointer'}
            borderWidth={1.5}
            borderColor={dragTargetId === knowledgeBase.id ? 'primary.600' : 'borderColor.low'}
            bg={'white'}
            borderRadius={'md'}
            minH={'130px'}
            position={'relative'}
            // data-drag-id={knowledgeBase.type === DatasetTypeEnum.folder ? knowledgeBase.id : undefined}
            draggable
            onDragStart={() => {
              setDragStartId(knowledgeBase.id);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              const targetId = e.currentTarget.getAttribute('data-drag-id');
              if (!targetId) {
                return;
              }
              DatasetTypeEnum.folder && setDragTargetId(targetId);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragTargetId(undefined);
            }}
            onDrop={async (e) => {
              e.preventDefault();
              if (!dragTargetId || !dragStartId || dragTargetId === dragStartId) {
                return;
              }
              // update parentId
              try {
                // 更新目录层级
                await refetch();
              } catch (error) {}
              setDragTargetId(undefined);
            }}
            _hover={{
              borderColor: 'primary.300',
              boxShadow: '1.5',
              '& .delete': {
                display: 'block'
              }
            }}
            onClick={() => {
              router.push(`/knowledge-base/detail?id=${knowledgeBase.id}`);
            }}
          >
            <Box
              position={'absolute'}
              top={3}
              right={3}
              borderRadius={'md'}
              _hover={{
                color: 'primary.500',
                '& .icon': {
                  bg: 'myGray.100'
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <MyMenu
                width={120}
                Button={
                  <Box w={'22px'} h={'22px'}>
                    <MyIcon
                      className="icon"
                      name={'more'}
                      h={'16px'}
                      w={'16px'}
                      px={1}
                      py={1}
                      borderRadius={'md'}
                      cursor={'pointer'}
                    />
                  </Box>
                }
                menuList={[
                  {
                    label: (
                      <Flex alignItems={'center'}>
                        <MyIcon name={'edit'} w={'14px'} mr={2} />
                        {t('Rename')}
                      </Flex>
                    ),
                    onClick: () =>
                      onOpenTitleModal({
                        defaultVal: knowledgeBase.name,
                        onSuccess: (val) => {
                          if (val === knowledgeBase.name || !val) {
                            return;
                          }
                          // updateDataset({ id: knowledgeBase.id, name: val });
                        }
                      })
                  },
                  {
                    label: (
                      <Flex alignItems={'center'}>
                        <MyIcon name={'delete'} w={'14px'} mr={2} />
                        {t('common.Delete')}
                      </Flex>
                    ),
                    onClick: () => {
                      openConfirm(
                        () => onClickDelKnowledgeBase(knowledgeBase.id),
                        undefined,
                        DeleteTipsMap.current[DatasetTypeEnum.dataset]
                      )();
                    }
                  }
                ]}
              />
            </Box>
            <Flex alignItems={'center'} h={'38px'}>
              <Avatar src={knowledgeBase.icon} borderRadius={'md'} w={'28px'} />
              <Box mx={3} className="textEllipsis3">
                {knowledgeBase.name}
              </Box>
            </Flex>
            <Box
              flex={1}
              className={'textEllipsis3'}
              py={1}
              wordBreak={'break-all'}
              fontSize={'sm'}
              color={'myGray.500'}
            >
              {knowledgeBase.desc || t('core.dataset.Intro Placeholder')}
            </Box>
            <Flex justifyContent={'end'} alignItems={'center'} fontSize={'sm'}>
              <DatasetTypeTag type={DatasetTypeEnum.dataset} py={1} px={2} />
            </Flex>
          </Box>
        ))}
      </Grid>
      {knowledgeBases.length === 0 && (
        <Flex mt={'35vh'} flexDirection={'column'} alignItems={'center'}>
          <MyIcon name="empty" w={'48px'} h={'48px'} color={'transparent'} />
          <Box mt={2} color={'myGray.500'}>
            {t('core.dataset.Empty Dataset Tips')}
          </Box>
        </Flex>
      )}
      <ConfirmModal />
      <EditTitleModal />
      {isOpenCreateModal && <CreateModal onClose={onCloseCreateModal} />}
      {!!editFolderData && (
        <EditFolderModal
          onClose={() => setEditFolderData(undefined)}
          editCallback={async (name) => {
            try {
              // await postCreateDataset({
              //   parentId,
              //   name,
              //   type: DatasetTypeEnum.folder,
              //   avatar: FolderImgUrl,
              //   intro: ''
              // });
              await refetch();
            } catch (error) {
              return Promise.reject(error);
            }
          }}
          isEdit={false}
        />
      )}
      {!!moveDataId && (
        <MoveModal
          moveDataId={moveDataId}
          onClose={() => setMoveDataId('')}
          onSuccess={() => {
            refetch();
            setMoveDataId('');
          }}
        />
      )}
    </PageContainer>
  );
};

export async function getServerSideProps(content: any) {
  return {
    props: {
      ...(await serviceSideProps(content))
    }
  };
}

export default Kb;
