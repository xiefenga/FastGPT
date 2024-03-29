import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { devtools, persist } from 'zustand/middleware'

import { queryUserInfo, updateUserInfo } from '@/web/support/user/_api'
import type { UserResType, UserUpdateParams } from '@/types/api/user'
import type { RequireAtLeastOne } from '@/types/tools'

type State = {
  userInfo: UserResType | null;
  initUserInfo: () => Promise<UserResType>;
  setUserInfo: (user: UserResType | null) => void;
  updateUserInfo: (user: RequireAtLeastOne<UserUpdateParams>) => Promise<void>;
};

export const useUserStore = create<State>()(
  devtools(
    persist(
      immer((set, get) => ({
        userInfo: null,
        async initUserInfo() {
          const res = await queryUserInfo()
          get().setUserInfo(res)
          return res
        },
        setUserInfo(user) {
          set((state) => {
            state.userInfo = user ? user : null
          })
        },
        async updateUserInfo(user) {
          await updateUserInfo(user)
          set((state) => {
            if (!state.userInfo) {
              return
            }
            state.userInfo = {
              ...state.userInfo,
              ...user,
            }
          })
        },
      })),
      {
        name: 'userStore',
        partialize: (state) => ({}),
      },
    ),
  ),
)
