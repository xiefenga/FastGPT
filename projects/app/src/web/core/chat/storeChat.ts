import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools, persist } from 'zustand/middleware';

import { getChatHistories } from '@/web/core/chat/_api';
import { ChatItemType } from '@fastgpt/global/core/chat/type';
import { defaultChatData } from '@/global/core/chat/constants';
import { ChatHistoryItemType, ChatMessageItemType } from '@/types/api/chat';
import { useSystemStore } from '@/web/common/system/useSystemStore';

export interface ChatItemData {
  id: string;
  query: string;
  response: string;
  model_name: string;
}

// import { delChatHistoryById, getChatHistories, clearChatHistoryByAppId, delChatRecordById, putChatHistory } from '@/web/core/chat/api';

/* ------- 类型临时定义 ------- */
// import type { ChatHistoryItemType } from '@fastgpt/global/core/chat/type.d';
export type HistoryItemType = {
  id: string;
  title: string;
  model: string;
};

// import type { GetHistoriesProps, ClearHistoriesProps, DelHistoryProps, UpdateHistoryProps, DeleteChatItemProps } from '@/global/core/chat/api';
interface $ClearHistoriesProps {}
interface $DelHistoryProps {
  chatId: string;
}
interface $UpdateHistoryProps {
  chatId: string;
  customTitle?: string;
}
interface $DeleteChatItemProps {
  chatId: string;
  contentId?: string;
}
// import type { InitChatResponse } from '@/global/core/chat/api';
interface $InitChatResponse {
  chatId?: string;
  userAvatar?: string;
  title: string;
  history: ChatItemType[];
  // app 固定 智子跳动
  app: {
    name: string;
    avatar: string;
  };
}

type State = {
  /* ---------- history ------------- */
  histories: HistoryItemType[];
  loadHistories: () => Promise<void>;
  delOneHistory(data: $DelHistoryProps): Promise<void>;
  clearHistories(data: $ClearHistoriesProps): Promise<void>;
  pushHistory: (history: HistoryItemType) => void;
  updateHistory: (e: $UpdateHistoryProps & { updateTime?: Date; title?: string }) => Promise<any>;

  /* ---------- chat ------------- */
  currentModel: string;
  setCurrentModel: (model: string) => void;
  chatData: $InitChatResponse;
  setChatData: (e: $InitChatResponse | ((e: $InitChatResponse) => $InitChatResponse)) => void;
  lastChatAppId: string;
  setLastChatAppId: (id: string) => void;
  lastChatId: string;
  setLastChatId: (id: string) => void;
  delOneHistoryItem: (e: $DeleteChatItemProps) => Promise<any>;
};

export const useChatStore = create<State>()(
  devtools(
    persist(
      immer((set, get) => ({
        lastChatAppId: '',
        setLastChatAppId(id: string) {
          set((state) => {
            state.lastChatAppId = id;
          });
        },
        lastChatId: '',
        setLastChatId(id: string) {
          set((state) => {
            state.lastChatId = id;
          });
        },
        /* ---------- history ------------- */
        histories: [],
        async loadHistories() {
          const data = await getChatHistories();
          set((state) => {
            state.histories = data.map(({ id, title, model_name: model }) => ({
              id,
              title,
              model
            }));
          });
        },
        async delOneHistory(props) {
          // set((state) => {
          //   state.histories = state.histories.filter((item) => item.chatId !== props.chatId);
          // });
          // await delChatHistoryById(props);
        },
        async clearHistories(data) {
          // set((state) => {
          //   state.histories = [];
          // });
          // await clearChatHistoryByAppId(data);
        },
        pushHistory(history) {
          set((state) => {
            state.histories = [history, ...state.histories];
          });
        },
        async updateHistory(props) {
          // const { chatId, customTitle, top, title, updateTime } = props;
          // const index = get().histories.findIndex((item) => item.chatId === chatId);
          //
          // if (index > -1) {
          //   const newHistory = {
          //     ...get().histories[index],
          //     ...(title && { title }),
          //     ...(updateTime && { updateTime }),
          //     ...(customTitle !== undefined && { customTitle }),
          //     ...(top !== undefined && { top })
          //   };
          //
          //   if (customTitle !== undefined || top !== undefined) {
          //     try {
          //       putChatHistory(props);
          //     } catch (error) { }
          //   }
          //
          //   set((state) => {
          //     const newHistories = (() => {
          //       return [
          //         newHistory,
          //         ...get().histories.slice(0, index),
          //         ...get().histories.slice(index + 1)
          //       ];
          //     })();
          //
          //     state.histories = newHistories;
          //   });
          // }
        },

        /* ---------- chat ------------- */
        currentModel: '',
        setCurrentModel(model: string) {
          set((state) => {
            state.currentModel = model;
          });
        },
        chatData: defaultChatData,
        setChatData(e = defaultChatData) {
          if (typeof e === 'function') {
            set((state) => {
              state.chatData = e(state.chatData);
            });
          } else {
            set((state) => {
              state.chatData = e;
            });
          }
        },
        async delOneHistoryItem(props) {
          // const { chatId, contentId } = props;
          // if (!chatId || !contentId) return;
          //
          // try {
          //   get().setChatData((state) => ({
          //     ...state,
          //     history: state.history.filter((item) => item.dataId !== contentId)
          //   }));
          //   await delChatRecordById(props);
          // } catch (err) {
          //   console.log(err);
          // }
        }
      })),
      {
        name: 'chatStore',
        partialize: (state) => ({
          lastChatAppId: state.lastChatAppId,
          lastChatId: state.lastChatId
        })
      }
    ),
    {
      name: 'chat_store',
      enabled: true
    }
  )
);
