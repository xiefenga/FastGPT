import React from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { Box, Flex, Text, Image, Button } from '@chakra-ui/react';

import MyMenu from '@/components/MyMenu';
import { useChatStore } from '@/web/core/chat/storeChat';
import { useSystemStore } from '@/web/common/system/useSystemStore';

const ModelSeletor = () => {
  const { modelList, modelMap, initd } = useSystemStore();

  const { currentModel, setCurrentModel } = useChatStore();

  if (!initd || !currentModel) {
    return null;
  }

  const current = modelMap[currentModel];

  if (!current) {
    return null;
  }

  const menuList = modelList.map((model) => ({
    isActive: model.name === currentModel,
    label: (
      <Flex alignItems={'center'} gap={1}>
        <Image boxSize="20px" src={model.logo} alt={model.name} />
        <Text>{model.display_name}</Text>
      </Flex>
    ),
    onClick: () => {
      setCurrentModel(model.name);
    }
  }));

  return (
    <MyMenu
      width={140}
      trigger={'click'}
      menuList={menuList}
      Button={(open) => (
        <Button variant="ghost" w={140} gap={2}>
          <Flex cursor={'pointer'} alignItems={'center'} gap={1}>
            <Image boxSize="20px" src={current.logo} alt={currentModel} />
            <Text>{current.display_name}</Text>
          </Flex>
          {open ? <ChevronUpIcon fontSize={20} /> : <ChevronDownIcon fontSize={20} />}
        </Button>
      )}
    />
  );
};

export default ModelSeletor;
