import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React, { useEffect, useState } from 'react';
import {
  Box,
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Td,
  Tbody,
  Progress,
  Flex,
  Button
} from '@chakra-ui/react';

import { useToast } from '@fastgpt/web/hooks/useToast';
import MyIcon from '@fastgpt/web/components/common/Icon';

import { TabEnum } from '../../../constants';
import { useImportStore, type FormType } from '../Provider';
import { useRequest } from '@/web/common/hooks/useRequest';
import { ImportSourceItemType } from '@/web/core/dataset/type';

const Upload = ({ showPreviewChunks }: { showPreviewChunks: boolean }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const router = useRouter();
  const { sources, processParamsForm } = useImportStore();

  type UploadItemState = ImportSourceItemType & {
    uploadedFileRate: number;
    uploadedChunksRate: number;
  };

  const [uploadList, setUploadList] = useState<UploadItemState[]>([]);

  const { handleSubmit } = processParamsForm;

  const { mutate: startUpload, isLoading } = useRequest({
    mutationFn: async (form: FormType) => {
      console.log(sources);
      console.log(form);
    },
    onSuccess(num) {
      if (showPreviewChunks) {
        toast({
          title: t('core.dataset.import.Import Success Tip', { num }),
          status: 'success'
        });
      } else {
        toast({
          title: t('core.dataset.import.Upload success'),
          status: 'success'
        });
      }
      // close import page
      // router.replace({
      //   query: {
      //     ...router.query,
      //     currentTab: TabEnum.collectionCard
      //   }
      // });
    },
    errorToast: t('common.file.Upload failed')
  });

  useEffect(() => {
    setUploadList(
      sources.map((item) => {
        return {
          ...item,
          uploadedFileRate: item.file ? 0 : -1,
          uploadedChunksRate: 0
        };
      })
    );
  }, []);

  return (
    <Box>
      <TableContainer>
        <Table variant={'simple'} fontSize={'sm'} draggable={false}>
          <Thead draggable={false}>
            <Tr bg={'myGray.100'} mb={2}>
              <Th borderLeftRadius={'md'} overflow={'hidden'} borderBottom={'none'} py={4}>
                {t('core.dataset.import.Source name')}
              </Th>
              {showPreviewChunks ? (
                <>
                  {/*<Th borderBottom={'none'} py={4}>*/}
                  {/*  {t('core.dataset.Chunk amount')}*/}
                  {/*</Th>*/}
                  <Th borderBottom={'none'} py={4}>
                    {t('core.dataset.import.Upload file progress')}
                  </Th>
                  <Th borderRightRadius={'md'} overflow={'hidden'} borderBottom={'none'} py={4}>
                    {t('core.dataset.import.Data file progress')}
                  </Th>
                </>
              ) : (
                <>
                  <Th borderBottom={'none'} py={4}>
                    {t('core.dataset.import.Upload status')}
                  </Th>
                </>
              )}
            </Tr>
          </Thead>
          <Tbody>
            {uploadList.map((item) => (
              <Tr key={item.id}>
                <Td display={'flex'} alignItems={'center'}>
                  <MyIcon name={item.icon as any} w={'16px'} mr={1} />
                  {item.sourceName}
                </Td>
                {showPreviewChunks ? (
                  <>
                    {/*<Td>{item.chunks.length}</Td>*/}
                    <Td>
                      {item.uploadedFileRate === -1 ? (
                        '-'
                      ) : (
                        <Flex alignItems={'center'} fontSize={'xs'}>
                          <Progress
                            value={item.uploadedFileRate}
                            h={'6px'}
                            w={'100%'}
                            maxW={'210px'}
                            size="sm"
                            borderRadius={'20px'}
                            colorScheme={'blue'}
                            bg="myGray.200"
                            hasStripe
                            isAnimated
                            mr={2}
                          />
                          {`${item.uploadedFileRate}%`}
                        </Flex>
                      )}
                    </Td>
                    <Td>
                      <Flex alignItems={'center'} fontSize={'xs'}>
                        <Progress
                          value={item.uploadedChunksRate}
                          h={'6px'}
                          w={'100%'}
                          maxW={'210px'}
                          size="sm"
                          borderRadius={'20px'}
                          colorScheme={'purple'}
                          bg="myGray.200"
                          hasStripe
                          isAnimated
                          mr={2}
                        />
                        {`${item.uploadedChunksRate}%`}
                      </Flex>
                    </Td>
                  </>
                ) : (
                  <>
                    <Td color={item.uploadedFileRate === 100 ? 'green.600' : 'myGray.600'}>
                      {item.uploadedFileRate === 100 ? t('common.Finish') : t('common.Waiting')}
                    </Td>
                  </>
                )}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      <Flex justifyContent={'flex-end'} mt={4}>
        <Button isLoading={isLoading} onClick={handleSubmit((data) => startUpload(data))}>
          {uploadList.length > 0
            ? `${t('core.dataset.import.Total files', { total: uploadList.length })} | `
            : ''}
          {t('core.dataset.import.Start upload')}
        </Button>
      </Flex>
    </Box>
  );
};

export default Upload;
