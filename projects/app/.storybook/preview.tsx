import type { Preview, StoryFn } from '@storybook/react';
import { theme } from '@fastgpt/web/styles/theme';
import { ChakraProvider } from '@chakra-ui/react';

export const decorators = [
  (Story: StoryFn) => (
    <ChakraProvider theme={theme}>
      <Story />
    </ChakraProvider>
  )
];

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    }
  }
};

export default preview;
