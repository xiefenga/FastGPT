import React from 'react';
import { Box, Flex, Image, Spinner } from '@chakra-ui/react';

import MyIcon from '@fastgpt/web/components/common/Icon';
import { ChatFileTypeEnum } from '@fastgpt/global/core/chat/constants';

import type { FieldArrayWithId } from 'react-hook-form';
import type { ChatBoxInputFormType } from '@/components/ChatBox/type';

interface FilePreviewProps {
  fileList: FieldArrayWithId<ChatBoxInputFormType, 'files', 'id'>[];
  removeFile: (index: number) => void;
}

const FilePreview = ({ fileList, removeFile }: FilePreviewProps) => {
  return (
    <Flex wrap={'wrap'} px={[2, 4]} userSelect={'none'}>
      {fileList.map((item, index) => (
        <Box
          key={item.id}
          border={'1px solid rgba(0,0,0,0.12)'}
          mr={2}
          mb={2}
          rounded={'md'}
          position={'relative'}
          _hover={{
            '.close-icon': { display: item.url ? 'block' : 'none' }
          }}
        >
          {/* uploading */}
          {!item.url && (
            <Flex
              position={'absolute'}
              alignItems={'center'}
              justifyContent={'center'}
              rounded={'md'}
              color={'primary.500'}
              top={0}
              left={0}
              bottom={0}
              right={0}
              bg={'rgba(255,255,255,0.8)'}
            >
              <Spinner />
            </Flex>
          )}
          <MyIcon
            name={'closeSolid'}
            w={'16px'}
            h={'16px'}
            color={'myGray.700'}
            cursor={'pointer'}
            _hover={{ color: 'primary.500' }}
            position={'absolute'}
            bg={'white'}
            right={'-8px'}
            top={'-8px'}
            onClick={() => {
              removeFile(index);
            }}
            className="close-icon"
            display={['', 'none']}
          />
          {item.type === ChatFileTypeEnum.image && (
            <Image
              alt={'img'}
              src={item.icon}
              w={['50px', '70px']}
              h={['50px', '70px']}
              borderRadius={'md'}
              objectFit={'contain'}
            />
          )}
        </Box>
      ))}
    </Flex>
  );
};

export default FilePreview;
