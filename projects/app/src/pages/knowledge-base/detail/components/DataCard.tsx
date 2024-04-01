import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React, { useState, useRef, useMemo } from 'react';
import {
  Box,
  IconButton,
  Flex,
  Button,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  useDisclosure
} from '@chakra-ui/react';

import MyIcon from '@fastgpt/web/components/common/Icon';
import { useLoading } from '@fastgpt/web/hooks/useLoading';
import {
  DatasetCollectionTypeEnum,
  DatasetCollectionTypeMap,
  TrainingModeEnum,
  TrainingTypeMap
} from '@fastgpt/global/core/dataset/constants';

import { TabEnum } from '../constants';
import MyInput from '@/components/MyInput';
import MyTooltip from '@/components/MyTooltip';
import RawSourceBox from '@/components/core/dataset/RawSourceBox';
import { useSystemStore } from '@/web/common/system/useSystemStore';

const DataCard = () => {
  const BoxRef = useRef<HTMLDivElement>(null);
  const lastSearch = useRef('');
  const router = useRouter();
  const { isPc } = useSystemStore();

  const { Loading } = useLoading({ defaultLoading: false });
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState('');

  const { isOpen, onOpen, onClose } = useDisclosure();

  const metadataList = useMemo(() => {
    const webSelector = '';

    return [
      {
        label: t('core.dataset.collection.metadata.source'),
        value: t(DatasetCollectionTypeMap[DatasetCollectionTypeEnum.file]?.name)
      },
      {
        label: t('core.dataset.collection.metadata.source name'),
        value: '-'
      },
      {
        label: t('core.dataset.collection.metadata.source size'),
        value: '-'
      },
      {
        label: t('core.dataset.collection.metadata.Createtime'),
        value: '-'
      },
      {
        label: t('core.dataset.collection.metadata.Updatetime'),
        value: '-'
      },
      {
        label: t('core.dataset.collection.metadata.Raw text length'),
        value: '-'
      },
      {
        label: t('core.dataset.collection.metadata.Training Type'),
        value: t(TrainingTypeMap[TrainingModeEnum.chunk]?.label)
      },
      {
        label: t('core.dataset.collection.metadata.Chunk Size'),
        value: '-'
      },
      ...(webSelector
        ? [
            {
              label: t('core.dataset.collection.metadata.Web page selector'),
              value: webSelector
            }
          ]
        : [])
    ];
  }, [t]);

  return (
    <Box position={'relative'} py={[1, 5]} h={'100%'}>
      <Flex ref={BoxRef} flexDirection={'column'} h={'100%'}>
        <Flex alignItems={'center'} px={5}>
          <IconButton
            mr={3}
            icon={<MyIcon name={'common/backFill'} w={['14px', '18px']} color={'primary.500'} />}
            variant={'whitePrimary'}
            size={'smSquare'}
            borderRadius={'50%'}
            aria-label={''}
            onClick={() => {
              router.back();
            }}
          />
          <Flex className="textEllipsis" flex={'1 0 0'} mr={[3, 5]} alignItems={'center'}>
            <Box lineHeight={1.2}>
              <RawSourceBox
                sourceName={'12344321'}
                sourceId={''}
                fontSize={['md', 'lg']}
                color={'black'}
                textDecoration={'none'}
              />
              <Box fontSize={'sm'} color={'myGray.500'}>
                {t('core.dataset.collection.id')}:{' '}
                <Box as={'span'} userSelect={'all'}>
                  243124213
                </Box>
              </Box>
            </Box>
          </Flex>
          {isPc && (
            <MyTooltip label={t('core.dataset.collection.metadata.Read Metadata')}>
              <IconButton
                variant={'whiteBase'}
                size={['sm', 'md']}
                icon={<MyIcon name={'menu'} w={'18px'} />}
                aria-label={''}
                onClick={onOpen}
              />
            </MyTooltip>
          )}
        </Flex>
        <Flex my={3} alignItems={'center'} px={5}>
          <Box>
            <Box as={'span'} fontSize={['md', 'lg']}>
              {t('core.dataset.data.Total Amount', { total: 0 })}
            </Box>
          </Box>
          <Box flex={1} mr={1} />
          <MyInput
            leftIcon={
              <MyIcon
                name="common/searchLight"
                position={'absolute'}
                w={'14px'}
                color={'myGray.500'}
              />
            }
            w={['200px', '300px']}
            placeholder={t('core.dataset.data.Search data placeholder')}
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
            }}
            onBlur={() => {
              if (searchText === lastSearch.current) {
                return;
              }
            }}
            onKeyDown={(e) => {
              if (searchText === lastSearch.current) {
                return;
              }
              if (e.key === 'Enter') {
              }
            }}
          />
        </Flex>
        <Box flex={'1 0 0'} overflow={'auto'} px={5}></Box>
      </Flex>

      {/* metadata drawer */}
      <Drawer isOpen={isOpen} placement="right" size={'md'} onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>{t('core.dataset.collection.metadata.metadata')}</DrawerHeader>

          <DrawerBody>
            {metadataList.map((item) => (
              <Flex key={item.label} alignItems={'center'} mb={5} wordBreak={'break-all'}>
                <Box color={'myGray.500'} flex={'0 0 100px'}>
                  {item.label}
                </Box>
                <Box>{item.value}</Box>
              </Flex>
            ))}
            <Button
              variant={'whitePrimary'}
              // onClick={() => collection.sourceId && getFileAndOpen(collection.sourceId)}
            >
              {t('core.dataset.collection.metadata.read source')}
            </Button>
          </DrawerBody>

          <DrawerFooter>
            <Button variant={'whitePrimary'} onClick={onClose}>
              {t('common.Close')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      <Loading fixed={false} />
    </Box>
  );
};

export default React.memo(DataCard);
