import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools, persist } from 'zustand/middleware';
import type { UserType } from '@sophonsai/extends/user/type.d';

interface $UserUpdateParams {}

type State = {
  userInfo: UserType | null;
  setUserInfo: (user: UserType | null) => void;
  updateUserInfo: (user: $UserUpdateParams) => Promise<void>;
};

export const useUserStore = create<State>()(
  devtools(
    persist(
      immer((set, get) => ({
        userInfo: null,
        setUserInfo(user: UserType | null) {
          set((state) => {
            state.userInfo = user ? user : null;
          });
        },
        async updateUserInfo(user: $UserUpdateParams) {}
      })),
      {
        name: 'userStore',
        partialize: (state) => ({})
      }
    )
  )
);
