import dynamic from 'next/dynamic';
import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { Box, Button, Flex, IconButton } from '@chakra-ui/react';

import Provider from './Provider';
import { TabEnum } from '../../constants';
import { useMyStep } from '@fastgpt/web/hooks/useStep';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { useDatasetStore } from '@/web/core/dataset/store/dataset';
import { ImportDataComponentProps } from '@/web/core/dataset/type';

const FileLocal = dynamic(() => import('./diffSource/FileLocal'));
const FileLink = dynamic(() => import('./diffSource/FileLink'));
const FileCustomText = dynamic(() => import('./diffSource/FileCustomText'));
const TableLocal = dynamic(() => import('./diffSource/TableLocal'));

export enum ImportDataSourceEnum {
  fileLocal = 'fileLocal',
  fileLink = 'fileLink',
  fileCustom = 'fileCustom',
  tableLocal = 'tableLocal'
}

const ImportComponentMap: Record<
  `${ImportDataSourceEnum}`,
  React.ComponentType<ImportDataComponentProps>
> = {
  [ImportDataSourceEnum.fileLocal]: FileLocal,
  [ImportDataSourceEnum.fileLink]: FileLink,
  [ImportDataSourceEnum.fileCustom]: FileCustomText,
  [ImportDataSourceEnum.tableLocal]: TableLocal
};

const ImportDataset = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { datasetDetail } = useDatasetStore();

  const { source = ImportDataSourceEnum.fileLocal, parentId } = (router.query || {}) as {
    source: `${ImportDataSourceEnum}`;
    parentId?: string;
  };

  const modeSteps: Record<`${ImportDataSourceEnum}`, { title: string }[]> = {
    [ImportDataSourceEnum.fileLocal]: [
      {
        title: t('core.dataset.import.Select file')
      },
      {
        title: t('core.dataset.import.Data Preprocessing')
      },
      {
        title: t('core.dataset.import.Upload data')
      }
    ],
    [ImportDataSourceEnum.fileLink]: [
      {
        title: t('core.dataset.import.Select file')
      },
      {
        title: t('core.dataset.import.Data Preprocessing')
      },
      {
        title: t('core.dataset.import.Upload data')
      }
    ],
    [ImportDataSourceEnum.fileCustom]: [
      {
        title: t('core.dataset.import.Select file')
      },
      {
        title: t('core.dataset.import.Data Preprocessing')
      },
      {
        title: t('core.dataset.import.Upload data')
      }
    ],
    [ImportDataSourceEnum.tableLocal]: [
      {
        title: t('core.dataset.import.Select file')
      },
      {
        title: t('core.dataset.import.Data Preprocessing')
      },
      {
        title: t('core.dataset.import.Upload data')
      }
    ]
  };
  const steps = modeSteps[source];

  const { activeStep, goToNext, goToPrevious, MyStep } = useMyStep({
    defaultStep: 0,
    steps
  });

  const ImportComponent = useMemo(() => ImportComponentMap[source], [source]);

  if (!ImportComponent) {
    return null;
  }

  const BackButton = () => {
    return activeStep === 0 ? (
      <Flex alignItems={'center'}>
        <IconButton
          icon={<MyIcon name={'common/backFill'} w={'14px'} />}
          aria-label={''}
          size={'smSquare'}
          w={'26px'}
          h={'26px'}
          borderRadius={'50%'}
          variant={'whiteBase'}
          mr={2}
          onClick={() =>
            router.replace({
              query: {
                ...router.query,
                currentTab: TabEnum.files
              }
            })
          }
        />
        {t('common.Exit')}
      </Flex>
    ) : (
      <Flex>
        <Button
          variant={'whiteBase'}
          leftIcon={<MyIcon name={'common/backFill'} w={'14px'} />}
          onClick={goToPrevious}
        >
          {t('common.Last Step')}
        </Button>
      </Flex>
    );
  };

  return (
    <Flex flexDirection={'column'} bg={'white'} h={'100%'} px={[2, 9]} py={[2, 5]}>
      <BackButton />

      {/* step */}
      <Box
        mt={4}
        mb={5}
        px={3}
        py={[2, 4]}
        bg={'myGray.50'}
        borderWidth={'1px'}
        borderColor={'borderColor.low'}
        borderRadius={'md'}
      >
        <Box maxW={['100%', '900px']} mx={'auto'}>
          <MyStep />
        </Box>
      </Box>
      <Provider dataset={datasetDetail} parentId={parentId}>
        <Box flex={'1 0 0'} overflow={'auto'} position={'relative'}>
          <ImportComponent activeStep={activeStep} goToNext={goToNext} />
        </Box>
      </Provider>
    </Flex>
  );
};

export default React.memo(ImportDataset);
