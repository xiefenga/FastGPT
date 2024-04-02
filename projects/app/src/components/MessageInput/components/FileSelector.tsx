import React from 'react';
import { Flex } from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';

import MyIcon from '@fastgpt/web/components/common/Icon';

import MyTooltip from '@/components/MyTooltip';
import { useSelectFile } from '@/web/common/file/hooks/useSelectFile';

interface FileSelectorProps {
  onSelectFile: (files: File[]) => void;
}

const FileSelector = ({ onSelectFile }: FileSelectorProps) => {
  const { t } = useTranslation();

  /* file selector and upload */
  const { File, onOpen: onOpenSelectFile } = useSelectFile({
    fileType: 'image/*',
    multiple: true,
    maxCount: 10
  });

  return (
    <Flex
      h={'22px'}
      alignItems={'center'}
      justifyContent={'center'}
      cursor={'pointer'}
      transform={'translateY(1px)'}
      onClick={() => onOpenSelectFile()}
    >
      <MyTooltip label={t('core.chat.Select Image')}>
        <MyIcon name={'core/chat/fileSelect'} w={'18px'} color={'myGray.600'} />
      </MyTooltip>
      <File onSelect={onSelectFile} />
    </Flex>
  );
};

export default FileSelector;
