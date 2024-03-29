import { delay } from '@fastgpt/global/common/system/utils';
import type { FastGPTFeConfigsType } from '@fastgpt/global/common/system/types/index.d';

import { useSystemStore } from './useSystemStore';

export const clientInitData = async (
  retry = 3
): Promise<{
  feConfigs: FastGPTFeConfigsType;
}> => {
  try {
    const res = {
      feConfigs: {
        show_emptyChat: true,
        show_git: true,
        docUrl: 'https://doc.fastgpt.in',
        openAPIDocUrl: 'https://doc.fastgpt.in/docs/development/openapi',
        systemTitle: 'FastGPT',
        concatMd:
          '* 项目开源地址: [FastGPT GitHub](https://github.com/labring/FastGPT)\n* 交流群: ![](https://doc.fastgpt.in/wechat-fastgpt.webp)',
        limit: { exportDatasetLimitMinutes: 0, websiteSyncLimitMinuted: 0 },
        scripts: [],
        favicon: '/favicon.ico',
        uploadFileMaxSize: 500,
        isPlus: false
      },
      llmModels: [
        {
          model: 'gpt-3.5-turbo',
          name: 'gpt-3.5-turbo',
          maxContext: 16000,
          maxResponse: 4000,
          quoteMaxToken: 13000,
          maxTemperature: 1.2,
          charsPointsPrice: 0,
          censor: false,
          vision: false,
          datasetProcess: false,
          usedInClassify: true,
          usedInExtractFields: true,
          usedInToolCall: true,
          usedInQueryExtension: true,
          toolChoice: true,
          functionCall: false,
          customCQPrompt: '',
          customExtractPrompt: '',
          defaultSystemChatPrompt: '',
          defaultConfig: {}
        },
        {
          model: 'gpt-3.5-turbo-16k',
          name: 'gpt-3.5-turbo-16k',
          maxContext: 16000,
          maxResponse: 16000,
          quoteMaxToken: 13000,
          maxTemperature: 1.2,
          charsPointsPrice: 0,
          censor: false,
          vision: false,
          datasetProcess: true,
          usedInClassify: true,
          usedInExtractFields: true,
          usedInToolCall: true,
          usedInQueryExtension: true,
          toolChoice: true,
          functionCall: false,
          customCQPrompt: '',
          customExtractPrompt: '',
          defaultSystemChatPrompt: '',
          defaultConfig: {}
        },
        {
          model: 'gpt-4-0125-preview',
          name: 'gpt-4-turbo',
          maxContext: 125000,
          maxResponse: 4000,
          quoteMaxToken: 100000,
          maxTemperature: 1.2,
          charsPointsPrice: 0,
          censor: false,
          vision: false,
          datasetProcess: false,
          usedInClassify: true,
          usedInExtractFields: true,
          usedInToolCall: true,
          usedInQueryExtension: true,
          toolChoice: true,
          functionCall: false,
          customCQPrompt: '',
          customExtractPrompt: '',
          defaultSystemChatPrompt: '',
          defaultConfig: {}
        },
        {
          model: 'gpt-4-vision-preview',
          name: 'gpt-4-vision',
          maxContext: 128000,
          maxResponse: 4000,
          quoteMaxToken: 100000,
          maxTemperature: 1.2,
          charsPointsPrice: 0,
          censor: false,
          vision: true,
          datasetProcess: false,
          usedInClassify: false,
          usedInExtractFields: false,
          usedInToolCall: false,
          usedInQueryExtension: false,
          toolChoice: true,
          functionCall: false,
          customCQPrompt: '',
          customExtractPrompt: '',
          defaultSystemChatPrompt: '',
          defaultConfig: {}
        }
      ],
      vectorModels: [
        {
          model: 'text-embedding-ada-002',
          name: 'Embedding-2',
          charsPointsPrice: 0,
          defaultToken: 700,
          maxToken: 3000,
          weight: 100
        }
      ],
      reRankModels: [],
      whisperModel: { model: 'whisper-1', name: 'Whisper1', charsPointsPrice: 0 },
      audioSpeechModels: [
        {
          model: 'tts-1',
          name: 'OpenAI TTS1',
          charsPointsPrice: 0,
          voices: [
            { label: 'Alloy', value: 'alloy', bufferId: 'openai-Alloy' },
            { label: 'Echo', value: 'echo', bufferId: 'openai-Echo' },
            { label: 'Fable', value: 'fable', bufferId: 'openai-Fable' },
            { label: 'Onyx', value: 'onyx', bufferId: 'openai-Onyx' },
            { label: 'Nova', value: 'nova', bufferId: 'openai-Nova' },
            { label: 'Shimmer', value: 'shimmer', bufferId: 'openai-Shimmer' }
          ]
        }
      ],
      systemVersion: '4.7',
      simpleModeTemplates: []
    };
    useSystemStore.getState().initStaticData(res);

    return {
      feConfigs: res.feConfigs || {}
    };
  } catch (error) {
    if (retry > 0) {
      await delay(500);
      return clientInitData(retry - 1);
    }
    return Promise.reject(error);
  }
};
