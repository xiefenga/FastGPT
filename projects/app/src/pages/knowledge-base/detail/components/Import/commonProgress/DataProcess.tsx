import { useTranslation } from 'next-i18next';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Button,
  Checkbox
} from '@chakra-ui/react';

import MyIcon from '@fastgpt/web/components/common/Icon';
import LeftRadio from '@fastgpt/web/components/common/Radio/LeftRadio';

// import Tag from '@/components/Tag'
// import Preview from '../components/Preview'
import { useImportStore } from '../Provider';
import MyTooltip from '@/components/MyTooltip';
import { ImportProcessWayEnum } from '@/web/core/dataset/constants';

interface DataProcessProps {
  goToNext: () => void;
}

function DataProcess({ goToNext }: DataProcessProps) {
  const { t } = useTranslation();
  const {
    processParamsForm,
    sources,
    minChunkSize,
    maxChunkSize,

    minChunkOverlapSize,
    maxChunkOverlapSize,

    totalChunkChars,
    totalChunks,
    showRePreview,
    splitSources2Chunks
  } = useImportStore();
  const { getValues, setValue, register } = processParamsForm;
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    splitSources2Chunks();
  }, []);

  return (
    <Box h={'100%'} display={['block', 'flex']} gap={5}>
      <Box flex={'1 0 0'} maxW={'600px'}>
        <Flex fontWeight={'bold'} alignItems={'center'}>
          <MyIcon name={'common/settingLight'} w={'20px'} />
          <Box fontSize={'lg'}>{t('core.dataset.import.Data process params')}</Box>
        </Flex>
        <Flex mt={5}>
          <Box color={'myGray.600'} flex={'0 0 100px'}>
            {t('core.dataset.import.Process way')}
          </Box>
          <LeftRadio
            list={[
              {
                title: t('core.dataset.import.Custom process'),
                desc: t('core.dataset.import.Custom process desc'),
                value: ImportProcessWayEnum.custom,
                children: (
                  <Box mt={5}>
                    <Box>
                      <Flex alignItems={'center'}>
                        <Box>单段文本最大长度</Box>
                        <MyTooltip
                          forceShow
                          label={t('core.dataset.import.Ideal chunk length Tips')}
                        >
                          <MyIcon
                            name={'common/questionLight'}
                            ml={1}
                            w={'14px'}
                            color={'myGray.500'}
                          />
                        </MyTooltip>
                      </Flex>
                      <Box
                        mt={1}
                        css={{
                          '& > span': {
                            display: 'block'
                          }
                        }}
                      >
                        <MyTooltip
                          label={t('core.dataset.import.Chunk Range', {
                            min: minChunkSize,
                            max: maxChunkSize
                          })}
                        >
                          <NumberInput
                            size={'sm'}
                            step={100}
                            min={minChunkSize}
                            max={maxChunkSize}
                            onChange={(e) => {
                              setValue('chunk_size', parseInt(e));
                            }}
                          >
                            <NumberInputField
                              min={minChunkSize}
                              max={maxChunkSize}
                              {...register('chunk_size', {
                                min: minChunkSize,
                                max: maxChunkSize,
                                valueAsNumber: true
                              })}
                            />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </MyTooltip>
                      </Box>
                    </Box>
                    <Box mt={3}>
                      <Flex alignItems={'center'}>
                        <Box>相邻文本重合长度</Box>
                        <MyTooltip
                          forceShow
                          label={t('core.dataset.import.Ideal chunk length Tips')}
                        >
                          <MyIcon
                            name={'common/questionLight'}
                            ml={1}
                            w={'14px'}
                            color={'myGray.500'}
                          />
                        </MyTooltip>
                      </Flex>
                      <Box
                        mt={1}
                        css={{
                          '& > span': {
                            display: 'block'
                          }
                        }}
                      >
                        <MyTooltip
                          label={t('core.dataset.import.Chunk Range', {
                            min: minChunkOverlapSize,
                            max: maxChunkOverlapSize
                          })}
                        >
                          <NumberInput
                            size={'sm'}
                            step={100}
                            min={minChunkOverlapSize}
                            max={maxChunkOverlapSize}
                            onChange={(e) => {
                              setValue('chunk_overlap', parseInt(e));
                            }}
                          >
                            <NumberInputField
                              min={minChunkOverlapSize}
                              max={maxChunkOverlapSize}
                              {...register('chunk_overlap', {
                                min: minChunkOverlapSize,
                                max: maxChunkOverlapSize,
                                valueAsNumber: true
                              })}
                            />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </MyTooltip>
                      </Box>
                    </Box>
                    <Box mt={3}>
                      <Checkbox
                        size="lg"
                        colorScheme="green"
                        onChange={(e) => {
                          setValue('zh_title_enhance', e.target.checked);
                        }}
                      >
                        <Box fontSize={14}>开启中文标题加强</Box>
                      </Checkbox>
                    </Box>
                  </Box>
                )
              }
            ]}
            px={3}
            py={3}
            defaultBg="white"
            activeBg="white"
            value={ImportProcessWayEnum.custom}
            w={'100%'}
            onChange={(e) => {}}
          />
        </Flex>
        <Flex mt={5} alignItems={'center'} pl={'100px'} gap={3}>
          {/*<Tag colorSchema={'gray'} py={'6px'} borderRadius={'md'} px={3}>*/}
          {/*  {t('core.dataset.Total chunks', {total: totalChunks})}*/}
          {/*</Tag>*/}
          {/*<Tag colorSchema={'gray'} py={'6px'} borderRadius={'md'} px={3}>*/}
          {/*  {t('core.Total chars', {total: totalChunkChars})}*/}
          {/*</Tag>*/}
        </Flex>
        <Flex mt={5} gap={3} justifyContent={'flex-end'}>
          {showRePreview && (
            <Button variant={'primaryOutline'} onClick={splitSources2Chunks}>
              {t('core.dataset.import.Re Preview')}
            </Button>
          )}
          <Button
            onClick={() => {
              if (showRePreview) {
                splitSources2Chunks();
              }
              goToNext();
            }}
          >
            {t('common.Next Step')}
          </Button>
        </Flex>
      </Box>
      {/*<Preview sources={sources} />*/}
    </Box>
  );
}

export default React.memo(DataProcess);
