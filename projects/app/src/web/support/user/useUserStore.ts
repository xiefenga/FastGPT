import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools, persist } from 'zustand/middleware';

import type { UserUpdateParams } from '@/types/user';
import { UserResType } from '@/global/support/api/userRes';
import { queryUserInfo } from '@/web/support/user/_api';

type State = {
  userInfo: UserResType | null;
  initUserInfo: () => Promise<UserResType>;
  setUserInfo: (user: UserResType | null) => void;
  updateUserInfo: (user: UserUpdateParams) => Promise<void>;
};

export const useUserStore = create<State>()(
  devtools(
    persist(
      immer((set, get) => ({
        userInfo: null,
        async initUserInfo() {
          const res = await queryUserInfo();
          get().setUserInfo(res);
          return res;
        },
        setUserInfo(user) {
          set((state) => {
            state.userInfo = user ? user : null;
          });
        },
        async updateUserInfo(user: UserUpdateParams) {
          const oldInfo = get().userInfo ? { ...get().userInfo } : null;
          set((state) => {
            if (!state.userInfo) {
              return;
            }
            state.userInfo = {
              ...state.userInfo,
              ...user
            };
          });
          // try {
          //   await putUserInfo(user);
          // } catch (error) {
          //   set((state) => {
          //     state.userInfo = oldInfo;
          //   });
          //   return Promise.reject(error);
          // }
        }
      })),
      {
        name: 'userStore',
        partialize: (state) => ({})
      }
    )
  )
);
