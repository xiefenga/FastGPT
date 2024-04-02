import { theme } from '@fastgpt/web/styles/theme';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import type { Preview, StoryFn } from '@storybook/react';

import i18n from './i18next';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      retry: false,
      cacheTime: 10
    }
  }
});

export const decorators = [
  (Story: StoryFn) => (
    <ChakraProvider theme={theme}>
      <Story />
    </ChakraProvider>
  ),
  (Story: StoryFn) => (
    <QueryClientProvider client={queryClient}>
      <Story />
    </QueryClientProvider>
  )
];

const preview: Preview = {
  globals: {
    locale: 'zh',
    locales: {
      en: { icon: '🇺🇸', title: 'English', right: 'EN' },
      zh: { icon: '🇨🇳', title: '简体中文', right: 'ZH' }
    }
  },
  parameters: {
    i18n,
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    }
  }
};

export default preview;
