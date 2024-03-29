import { InitChatResponse } from './api';

export const defaultChatData: InitChatResponse = {
  chatId: '',
  appId: '',
  app: {
    name: '智子跳动',
    avatar: '/icon/logo.png',
    intro: '',
    canUse: false
  },
  title: '新对话',
  variables: {},
  history: []
};
