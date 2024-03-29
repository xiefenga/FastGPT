import dayjs from 'dayjs';
import { debounce } from 'lodash';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Box,
  Flex,
  MenuButton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr
} from '@chakra-ui/react';

import { usePagination } from '@fastgpt/web/hooks/usePagination';
import { ParentTreePathItemType } from '@fastgpt/global/common/parentFolder/type';
import {
  DatasetCollectionTypeEnum,
  DatasetTypeEnum,
  DatasetTypeMap
} from '@fastgpt/global/core/dataset/constants';

import { TabEnum } from '..';
import MyMenu from '@/components/MyMenu';
import MyInput from '@/components/MyInput';
import EmptyTip from '@/components/EmptyTip';
import MyBox from '@/components/common/MyBox';
import MyTooltip from '@/components/MyTooltip';
import { ImportDataSourceEnum } from './Import';
import { useDrag } from '@/web/common/hooks/useDrag';
import { useToast } from '@fastgpt/web/hooks/useToast';
import ParentPath from '@/components/common/ParentPaths';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { useRequest } from '@/web/common/hooks/useRequest';
import { useConfirm } from '@/web/common/hooks/useConfirm';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import { getKnowledgeBaseFiles } from '@/web/core/knowledge-base/api';
import { KnowledgeBaseFileItemType } from '@/global/core/knowledge-base/type';
import SelectCollections from '@/web/core/dataset/components/SelectCollections';
import EditFolderModal, { useEditFolder } from '../../component/EditFolderModal';

const CollectionCard = () => {
  const BoxRef = useRef<HTMLDivElement>(null);
  const lastSearch = useRef('');
  const router = useRouter();
  const { toast } = useToast();
  const { id } = router.query as { id: string };
  const { t } = useTranslation();
  const { isPc } = useSystemStore();
  const [searchText, setSearchText] = useState('');

  const { openConfirm: openDeleteConfirm, ConfirmModal: ConfirmDeleteModal } = useConfirm({
    content: t('dataset.Confirm to delete the file')
  });

  const { editFolderData, setEditFolderData } = useEditFolder();
  const [moveCollectionData, setMoveCollectionData] = useState<{ collectionId: string }>();

  const {
    data: files,
    Pagination,
    total,
    getData,
    isLoading: isGetting,
    pageNum,
    pageSize
  } = usePagination<KnowledgeBaseFileItemType>({
    api: getKnowledgeBaseFiles,
    pageSize: 20,
    params: { id, searchText },
    onChange() {
      if (BoxRef.current) {
        BoxRef.current.scrollTop = 0;
      }
    }
  });

  const { dragStartId, setDragStartId, dragTargetId, setDragTargetId } = useDrag();

  // change search
  const debounceRefetch = useCallback(
    debounce(() => {
      getData(1);
      lastSearch.current = searchText;
    }, 300),
    []
  );
  // add file icon
  const formatFiles = useMemo(
    () =>
      files.map((file) => {
        // const icon = getCollectionIcon(file.type, file.name)
        const icon = 'file/fill/markdown';
        const status = {
          statusText: t('core.dataset.collection.status.active'),
          color: 'green.600',
          bg: 'green.50',
          borderColor: 'green.300'
        };
        return { ...file, icon, ...status };
      }),
    [files, t]
  );

  const { mutate: onCreateCollection, isLoading: isCreating } = useRequest({
    mutationFn: async () => {},
    onSuccess() {
      getData(pageNum);
    },
    successToast: t('common.Create Success'),
    errorToast: t('common.Create Failed')
  });

  const paths: ParentTreePathItemType[] = [];

  const isLoading = useMemo(
    () => isCreating || (isGetting && files.length === 0),
    [files.length, isCreating, isGetting]
  );

  return (
    <MyBox isLoading={isLoading} h={'100%'} py={[2, 4]}>
      <Flex ref={BoxRef} flexDirection={'column'} py={[1, 3]} h={'100%'}>
        {/* header */}
        <Flex px={[2, 6]} alignItems={'flex-start'} h={'35px'}>
          <Box flex={1}>
            <ParentPath
              paths={paths.map((path, i) => ({
                parentId: path.parentId,
                parentName: i === paths.length - 1 ? `${path.parentName}` : path.parentName
              }))}
              FirstPathDom={
                <Box fontWeight={'bold'} fontSize={['sm', 'lg']}>
                  {t(DatasetTypeMap[DatasetTypeEnum.dataset].collectionLabel)}({total})
                </Box>
              }
              onClick={(e) => {
                router.replace({
                  query: {
                    ...router.query,
                    parentId: e
                  }
                });
              }}
            />
          </Box>
          {isPc && (
            <Flex alignItems={'center'} mr={4}>
              <MyInput
                bg={'myGray.50'}
                w={['100%', '250px']}
                size={'sm'}
                h={'36px'}
                placeholder={t('common.Search') || ''}
                value={searchText}
                leftIcon={
                  <MyIcon
                    name="common/searchLight"
                    position={'absolute'}
                    w={'16px'}
                    color={'myGray.500'}
                  />
                }
                onChange={(e) => {
                  setSearchText(e.target.value);
                  debounceRefetch();
                }}
                onBlur={() => {
                  if (searchText === lastSearch.current) {
                    return;
                  }
                  getData(1);
                }}
                onKeyDown={(e) => {
                  if (searchText === lastSearch.current) {
                    return;
                  }
                  if (e.key === 'Enter') {
                    getData(1);
                  }
                }}
              />
            </Flex>
          )}

          {/* 新增文件 */}
          <MyMenu
            offset={[0, 5]}
            Button={
              <MenuButton
                _hover={{
                  color: 'primary.500'
                }}
                fontSize={['sm', 'md']}
              >
                <Flex
                  alignItems={'center'}
                  px={5}
                  py={2}
                  borderRadius={'md'}
                  cursor={'pointer'}
                  bg={'primary.500'}
                  overflow={'hidden'}
                  color={'white'}
                  h={['28px', '35px']}
                >
                  <MyIcon name={'common/importLight'} mr={2} w={'14px'} />
                  <Box>{t('dataset.collections.Create And Import')}</Box>
                </Flex>
              </MenuButton>
            }
            menuList={[
              {
                label: (
                  <Flex>
                    <MyIcon name={'common/folderFill'} w={'20px'} mr={2} />
                    {t('Folder')}
                  </Flex>
                ),
                onClick: () => setEditFolderData({})
              },
              {
                label: (
                  <Flex>
                    <MyIcon name={'core/dataset/fileCollection'} mr={2} w={'20px'} />
                    本地文件
                  </Flex>
                ),
                onClick: () => {
                  router.replace({
                    query: {
                      ...router.query,
                      currentTab: TabEnum.import,
                      source: ImportDataSourceEnum.fileLocal
                    }
                  });
                }
              }
            ]}
          />
        </Flex>

        {/* 文件列表 */}
        <TableContainer
          px={[2, 6]}
          mt={[0, 3]}
          flex={'1 0 0'}
          overflowY={'auto'}
          position={'relative'}
        >
          <Table variant={'simple'} fontSize={'sm'} draggable={false}>
            <Thead draggable={false}>
              <Tr bg={'myGray.100'} mb={2}>
                <Th borderLeftRadius={'md'} overflow={'hidden'} borderBottom={'none'} py={4}>
                  #
                </Th>
                <Th borderBottom={'none'} py={4}>
                  {t('common.Name')}
                </Th>
                <Th borderBottom={'none'} py={4}>
                  {t('dataset.collections.Data Amount')}
                </Th>
                <Th borderBottom={'none'} py={4}>
                  {t('core.dataset.Sync Time')}
                </Th>
                <Th borderRightRadius={'md'} overflow={'hidden'} borderBottom={'none'} py={4} />
              </Tr>
            </Thead>
            <Tbody>
              {formatFiles.map((file, index) => (
                <Tr
                  key={file.id}
                  _hover={{ bg: 'myWhite.600' }}
                  cursor={'pointer'}
                  data-drag-id={undefined}
                  bg={dragTargetId === file.id ? 'primary.100' : ''}
                  userSelect={'none'}
                  onDragStart={() => {
                    setDragStartId(file.id);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    const targetId = e.currentTarget.getAttribute('data-drag-id');
                    if (!targetId) {
                      return;
                    }
                    DatasetCollectionTypeEnum.folder && setDragTargetId(targetId);
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
                      getData(pageNum);
                    } catch (error) {}
                    setDragTargetId(undefined);
                  }}
                  onClick={() => {
                    router.replace({
                      query: {
                        ...router.query,
                        collectionId: file.id,
                        currentTab: TabEnum.dataCard
                      }
                    });
                  }}
                >
                  <Td w={'50px'}>{index + 1}</Td>
                  <Td minW={'150px'} maxW={['200px', '300px']} draggable>
                    <Flex alignItems={'center'}>
                      <MyIcon name={file.icon as any} w={'16px'} mr={2} />
                      <MyTooltip label={t('common.folder.Drag Tip')} shouldWrapChildren={false}>
                        <Box fontWeight={'bold'} className="textEllipsis">
                          {file.name}
                        </Box>
                      </MyTooltip>
                    </Flex>
                  </Td>
                  <Td fontSize={'md'}>{file.dataAmount || '-'}</Td>
                  <Td>{dayjs(file.updateTime).format('YYYY/MM/DD HH:mm')}</Td>
                  <Td onClick={(e) => e.stopPropagation()}>
                    <MyMenu
                      width={100}
                      // offset={[-70, 5]}
                      Button={
                        <MenuButton
                          w={'22px'}
                          h={'22px'}
                          borderRadius={'md'}
                          _hover={{
                            color: 'primary.500',
                            '& .icon': {
                              bg: 'myGray.200'
                            }
                          }}
                        >
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
                        </MenuButton>
                      }
                      menuList={[
                        {
                          label: (
                            <Flex alignItems={'center'}>
                              <MyIcon name={'save'} w={'14px'} mr={2} />
                              下载文件
                            </Flex>
                          ),
                          onClick: () => {}
                        },
                        {
                          label: (
                            <Flex alignItems={'center'}>
                              <MyIcon name={'edit'} w={'14px'} mr={2} />
                              重新添加到向量库
                            </Flex>
                          ),
                          onClick: () => {}
                        },
                        {
                          label: (
                            <Flex alignItems={'center'}>
                              <MyIcon name={'delete'} w={'14px'} mr={2} />
                              从向量库删除
                            </Flex>
                          ),
                          onClick: () => {}
                        },
                        {
                          label: (
                            <Flex alignItems={'center'}>
                              <MyIcon name={'delete'} w={'14px'} mr={2} />
                              从知识库删除
                            </Flex>
                          ),
                          onClick: () => {}
                        }
                      ]}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          {total > pageSize && (
            <Flex mt={2} justifyContent={'center'}>
              <Pagination />
            </Flex>
          )}
          {total === 0 && <EmptyTip text={t('core.dataset.collection.Empty Tip')} />}
        </TableContainer>

        <ConfirmDeleteModal />

        {!!editFolderData && (
          <EditFolderModal
            onClose={() => setEditFolderData(undefined)}
            editCallback={async (name) => {
              try {
                if (editFolderData.id) {
                  getData(pageNum);
                } else {
                  onCreateCollection({
                    name,
                    type: DatasetCollectionTypeEnum.folder
                  });
                }
              } catch (error) {
                return Promise.reject(error);
              }
            }}
            isEdit={!!editFolderData.id}
            name={editFolderData.name}
          />
        )}
        {!!moveCollectionData && (
          <SelectCollections
            datasetId={id}
            type="folder"
            defaultSelectedId={[moveCollectionData.collectionId]}
            onClose={() => setMoveCollectionData(undefined)}
            onSuccess={async ({}) => {
              getData(pageNum);
              setMoveCollectionData(undefined);
              toast({
                status: 'success',
                title: t('common.folder.Move Success')
              });
            }}
          />
        )}
      </Flex>
    </MyBox>
  );
};

export default React.memo(CollectionCard);
