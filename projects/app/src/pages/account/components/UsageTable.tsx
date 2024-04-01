import dayjs from 'dayjs';
import { addDays } from 'date-fns';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';
import React, { useMemo, useState } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Flex,
  Box,
  Button
} from '@chakra-ui/react';

import MyIcon from '@fastgpt/web/components/common/Icon';
import { useLoading } from '@fastgpt/web/hooks/useLoading';
import MySelect from '@fastgpt/web/components/common/MySelect';
import { usePagination } from '@fastgpt/web/hooks/usePagination';
import { formatNumber } from '@fastgpt/global/common/math/tools';
import type { UsageItemType } from '@fastgpt/global/support/wallet/usage/type';
import { UsageSourceEnum, UsageSourceMap } from '@fastgpt/global/support/wallet/usage/constants';
import DateRangePicker, {
  type DateRangeType
} from '@fastgpt/web/components/common/DateRangePicker';

import { useSystemStore } from '@/web/common/system/useSystemStore';

const UsageDetail = dynamic(() => import('./UsageDetail'));

const UsageTable = () => {
  const { t } = useTranslation();
  const { Loading } = useLoading();

  const [dateRange, setDateRange] = useState<DateRangeType>({
    from: addDays(new Date(), -7),
    to: new Date()
  });

  const [usageSource, setUsageSource] = useState<`${UsageSourceEnum}` | ''>('');
  const { isPc } = useSystemStore();
  const [usageDetail, setUsageDetail] = useState<UsageItemType>();

  const sourceList = useMemo(
    () => [
      { label: t('common.All'), value: '' },
      ...Object.entries(UsageSourceMap).map(([key, value]) => ({
        label: t(value.label),
        value: key
      }))
    ],
    [t]
  );

  const {
    data: usages,
    isLoading,
    Pagination,
    getData
  } = usePagination<UsageItemType>({
    api: () => [],
    pageSize: isPc ? 20 : 10,
    params: {
      dateStart: dateRange.from || new Date(),
      dateEnd: addDays(dateRange.to || new Date(), 1),
      source: usageSource
    },
    defaultRequest: false
  });

  // useEffect(() => {
  //   getData(1);
  // }, [usageSource, selectTmbId]);

  return (
    <Flex flexDirection={'column'} py={[0, 5]} h={'100%'} position={'relative'}>
      <Flex
        flexDir={['column', 'row']}
        gap={2}
        w={'100%'}
        px={[3, 8]}
        alignItems={['flex-end', 'center']}
      >
        <Box flex={'1'} />
        <Flex alignItems={'center'} gap={3}>
          <DateRangePicker
            defaultDate={dateRange}
            position="bottom"
            onChange={setDateRange}
            onSuccess={() => getData(1)}
          />
          <Pagination />
        </Flex>
      </Flex>
      <TableContainer px={[3, 8]} position={'relative'} flex={'1 0 0'} h={0} overflowY={'auto'}>
        <Table>
          <Thead>
            <Tr>
              <Th>{t('user.Time')}</Th>
              <Th>
                <MySelect
                  list={sourceList}
                  value={usageSource}
                  size={'sm'}
                  w={'130px'}
                  onchange={(e) => setUsageSource(e)}
                />
              </Th>
              <Th>{t('user.Application Name')}</Th>
              <Th>{t('support.wallet.usage.Total points')}</Th>
            </Tr>
          </Thead>
          <Tbody fontSize={'sm'}>
            {usages.map((item: any) => (
              <Tr key={item.id}>
                <Td>{dayjs(item.time).format('YYYY/MM/DD HH:mm:ss')}</Td>
                {/* @ts-ignore */}
                <Td>{t(UsageSourceMap[item.source]?.label) || '-'}</Td>
                <Td>{t(item.appName) || '-'}</Td>
                <Td>{formatNumber(item.totalPoints) || 0}</Td>
                <Td>
                  <Button size={'sm'} variant={'whitePrimary'} onClick={() => setUsageDetail(item)}>
                    详情
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      {!isLoading && usages.length === 0 && (
        <Flex flex={'1 0 0'} flexDirection={'column'} alignItems={'center'}>
          <MyIcon name="empty" w={'48px'} h={'48px'} color={'transparent'} />
          <Box mt={2} color={'myGray.500'}>
            无使用记录~
          </Box>
        </Flex>
      )}

      <Loading loading={isLoading} fixed={false} />
      {!!usageDetail && (
        <UsageDetail usage={usageDetail} onClose={() => setUsageDetail(undefined)} />
      )}
    </Flex>
  );
};

export default React.memo(UsageTable);
