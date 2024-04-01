import Head from 'next/head';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useQuery } from '@tanstack/react-query';
import React, { useCallback, useRef } from 'react';
import { Box, Drawer, DrawerContent, DrawerOverlay, Flex, useDisclosure } from '@chakra-ui/react';

import { useToast } from '@fastgpt/web/hooks/useToast';
import { useLoading } from '@fastgpt/web/hooks/useLoading';
import { getErrText } from '@fastgpt/global/common/error/utils';
import { GPTMessages2Chats } from '@fastgpt/global/core/chat/adapt';
import { getChatTitleFromChatMessage } from '@fastgpt/global/core/chat/utils';
import {
  ChatItemValueTypeEnum,
  ChatRoleEnum,
  ChatStatusEnum
} from '@fastgpt/global/core/chat/constants';

import ChatBox from '@/components/ChatBox';
import SideBar from '@/components/SideBar';
import ChatHeader from './components/ChatHeader';
import { streamFetch } from '@/web/common/api/_fetch';
import PageContainer from '@/components/PageContainer';
import { getChatMessages } from '@/web/core/chat/api';
import { useChatStore } from '@/web/core/chat/storeChat';
import { serviceSideProps } from '@/web/common/utils/i18n';
import { useUserStore } from '@/web/support/user/useUserStore';
import ChatHistorySlider from './components/ChatHistorySlider';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import type { ComponentRef, StartChatFnProps } from '@/components/ChatBox/type.d';
import { AIChatItemType, UserChatItemType } from '@fastgpt/global/core/chat/type';

interface PageProps {
  chatId: string;
}

const Chat: React.FC<PageProps> = ({ chatId }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { toast } = useToast();

  const ChatBoxRef = useRef<ComponentRef>(null);
  const forbidRefresh = useRef(false);

  const {
    histories,
    loadHistories,
    pushHistory,
    updateHistory,
    delOneHistory,
    clearHistories,
    chatData,
    setChatData,
    delOneHistoryItem,
    currentModel,
    setCurrentModel
  } = useChatStore();
  const { userInfo } = useUserStore();

  const { isPc, defaultModel } = useSystemStore();
  const { Loading, setIsLoading } = useLoading();
  const { isOpen: isOpenSlider, onClose: onCloseSlider, onOpen: onOpenSlider } = useDisclosure();

  const startChat = useCallback(
    async ({ messages, controller, generatingMessage }: StartChatFnProps) => {
      const prompts = messages.slice(-2);
      let completionChatId = chatId ? chatId : uuidv4();

      const newTitle = getChatTitleFromChatMessage(GPTMessages2Chats(prompts)[0]);

      const { responseText, responseData } = await streamFetch({
        data: {
          query: prompts[0].content,
          conversation_id: completionChatId,
          history_len: -1,
          history: messages.slice(0, -2).map(({ role, content }) => ({ role, content })),
          model_name: currentModel,
          temperature: 0.7,
          max_tokens: 0,
          prompt_name: 'default',
          user_id: 'PC-default-user'
        },
        onMessage: generatingMessage,
        abortCtrl: controller
      });

      // new chat
      if (completionChatId !== chatId) {
        pushHistory({
          id: completionChatId,
          title: newTitle,
          model: currentModel
        });

        if (controller.signal.reason !== 'leave') {
          forbidRefresh.current = true;
          await router.replace({
            query: { chatId: completionChatId }
          });
        }
      }
      // update chat window
      setChatData((state) => ({
        ...state,
        title: newTitle,
        history: ChatBoxRef.current?.getChatHistories() || state.history
      }));

      return { responseText, responseData, isNewChat: forbidRefresh.current };
    },
    [chatId, pushHistory, currentModel, router, setChatData]
  );

  // get chat app info
  const loadChatInfo = useCallback(
    async (chatId: string) => {
      try {
        const messages = await getChatMessages(chatId);
        if (messages.length === 0) {
          throw new Error('聊天不存在');
        }
        const chatDataHistory = messages
          .map((message) => {
            return [
              {
                obj: ChatRoleEnum.Human,
                value: [
                  {
                    type: ChatItemValueTypeEnum.text,
                    text: {
                      content: message.query
                    }
                  }
                ]
              } satisfies UserChatItemType,
              {
                model: message.model_name,
                obj: ChatRoleEnum.AI,
                value: [
                  {
                    type: ChatItemValueTypeEnum.text,
                    text: {
                      content: message.response
                    }
                  }
                ]
              } satisfies AIChatItemType
            ];
          })
          .flat();
        setChatData((state) => ({ ...state, history: chatDataHistory }));
        const history = chatDataHistory.map((item) => ({ ...item, status: ChatStatusEnum.finish }));

        // have records.
        ChatBoxRef.current?.resetHistory(history);
        if (history.length > 0) {
          setTimeout(() => {
            ChatBoxRef.current?.scrollToBottom('auto');
          }, 500);
        }
      } catch (e: any) {
        toast({
          title: getErrText(e, t('core.chat.Failed to initialize chat')),
          status: 'error'
        });
        await router.replace({});
      }
      setIsLoading(false);
      return null;
    },
    [setIsLoading, setChatData, toast, t, router]
  );

  // 初始化聊天框
  useQuery(['init', { chatId, histories }], () => {
    console.log('chatId', chatId);
    if (forbidRefresh.current) {
      forbidRefresh.current = false;
      return null;
    }

    if (!chatId) {
      setCurrentModel(defaultModel);
      ChatBoxRef.current?.resetHistory([]);
      setChatData((state) => ({
        ...state,
        title: '新对话',
        history: []
      }));
      return null;
    }

    const currentChatInfo = histories.find((history) => history.id === chatId);

    if (!currentChatInfo) {
      return null;
    }

    setChatData((state) => ({
      ...state,
      title: currentChatInfo.title
    }));

    setCurrentModel(currentChatInfo.model);

    return loadChatInfo(chatId);
  });

  useQuery(['loadHistories'], () => loadHistories().then(() => null));

  return (
    <Flex h={'100%'}>
      <Head>
        <title>{chatData.app.name}</title>
      </Head>

      <PageContainer flex={'1 0 0'} w={0} position={'relative'}>
        <Flex h={'100%'} flexDirection={['column', 'row']} bg={'white'}>
          {/* pc always show history. */}
          {((children: React.ReactNode) => {
            return isPc ? (
              <SideBar>{children}</SideBar>
            ) : (
              <Drawer
                isOpen={isOpenSlider}
                placement="left"
                autoFocus={false}
                size={'xs'}
                onClose={onCloseSlider}
              >
                <DrawerOverlay backgroundColor={'rgba(255,255,255,0.5)'} />
                <DrawerContent maxWidth={'250px'}>{children}</DrawerContent>
              </Drawer>
            );
          })(
            <ChatHistorySlider
              confirmClearText={t('core.chat.Confirm to clear history')}
              appName={chatData.app.name}
              appAvatar={chatData.app.avatar}
              activeChatId={chatId}
              history={histories.map(({ id, title }) => ({ id, title }))}
              onChangeChat={(chatId) => {
                router.replace({
                  query: chatId ? { chatId } : {}
                });
                if (!isPc) {
                  onCloseSlider();
                }
              }}
              onDelHistory={(e) => delOneHistory({ ...e })}
              onClearHistory={() => {
                clearHistories({});
                router.replace({
                  query: {}
                });
              }}
              onSetHistoryTop={(e) => {
                updateHistory({ ...e });
              }}
              onSetCustomTitle={async (e) => {
                await updateHistory({
                  chatId: e.chatId,
                  title: e.title,
                  customTitle: e.title
                });
              }}
            />
          )}
          {/* chat container */}
          <Flex
            flex={'1 0 0'}
            h={[0, '100%']}
            w={['100%', 0]}
            position={'relative'}
            flexDirection={'column'}
          >
            {/* header */}
            <ChatHeader
              showHistory
              chatName={chatData.title}
              history={chatData.history}
              onOpenSlider={onOpenSlider}
            />

            {/* chat box */}
            <Box flex={1}>
              <ChatBox
                ref={ChatBoxRef}
                showEmptyIntro
                chatId={chatId}
                feedbackType={'user'}
                onStartChat={startChat}
                userAvatar={userInfo?.avatar}
                appAvatar={chatData.app.avatar}
                onDelMessage={(e) => delOneHistoryItem({ ...e, chatId })}
              />
            </Box>
          </Flex>
        </Flex>
        <Loading fixed={false} />
      </PageContainer>
    </Flex>
  );
};

export async function getServerSideProps(context: any) {
  return {
    props: {
      chatId: context?.query?.chatId || '',
      ...(await serviceSideProps(context))
    }
  };
}

export default Chat;
