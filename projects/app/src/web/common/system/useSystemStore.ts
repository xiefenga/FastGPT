import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools, persist } from 'zustand/middleware';

import { OAuthEnum } from '@fastgpt/global/support/user/constant';
import { SubPlanType } from '@fastgpt/global/support/wallet/sub/type';
import { FastGPTFeConfigsType } from '@fastgpt/global/common/system/types';
import { AppSimpleEditConfigTemplateType } from '@fastgpt/global/core/app/type';
import type {
  AudioSpeechModelType,
  LLMModelItemType,
  ReRankModelItemType,
  VectorModelItemType,
  WhisperModelType
} from '@fastgpt/global/core/ai/model.d';

import { InitDateResponse } from '@/global/common/api/systemRes';
import { getModleList } from '@/web/common/system/_api';
import type { LLMResType } from '@/types/api/system';
import { useChatStore } from '@/web/core/chat/storeChat';

type LoginStoreType = { provider: `${OAuthEnum}`; lastRoute: string; state: string };

interface ModelItemType {
  name: string;
  logo: string;
  display_name: string;
}

type State = {
  initd: boolean;
  setInitd: () => void;
  lastRoute: string;
  setLastRoute: (e: string) => void;
  loginStore?: LoginStoreType;
  setLoginStore: (e: LoginStoreType) => void;
  loading: boolean;
  setLoading: (val: boolean) => null;
  screenWidth: number;
  setScreenWidth: (val: number) => void;
  isPc?: boolean;
  initIsPc(val: boolean): void;

  defaultModel: string;
  modelMap: LLMResType;
  modelList: ModelItemType[];
  loadModelList: () => Promise<void>;

  feConfigs: FastGPTFeConfigsType;
  subPlans?: SubPlanType;
  systemVersion: string;
  llmModelList: LLMModelItemType[];
  datasetModelList: LLMModelItemType[];
  vectorModelList: VectorModelItemType[];
  audioSpeechModelList: AudioSpeechModelType[];
  reRankModelList: ReRankModelItemType[];
  whisperModel?: WhisperModelType;
  simpleModeTemplates: AppSimpleEditConfigTemplateType[];
  initStaticData: (e: InitDateResponse) => void;
};

export const useSystemStore = create<State>()(
  devtools(
    persist(
      immer((set, get) => ({
        initd: false,
        defaultModel: '',
        modelMap: {},
        modelList: [],
        async loadModelList() {
          const list = await getModleList();
          const setCurrentModel = useChatStore.getState().setCurrentModel;
          set((state) => {
            state.modelMap = list;
            state.modelList = Object.entries(list).map(([name, { display_name, logo }]) => ({
              name,
              display_name,
              logo
            }));
            if (state.modelList.length) {
              state.defaultModel = state.modelList[0].name;
              setCurrentModel(state.defaultModel);
            }
          });
        },
        setInitd() {
          set((state) => {
            state.initd = true;
          });
        },
        lastRoute: '/app/list',
        setLastRoute(e) {
          set((state) => {
            state.lastRoute = e;
          });
        },
        loginStore: undefined,
        setLoginStore(e) {
          set((state) => {
            state.loginStore = e;
          });
        },
        loading: false,
        setLoading: (val: boolean) => {
          set((state) => {
            state.loading = val;
          });
          return null;
        },
        screenWidth: 600,
        setScreenWidth(val: number) {
          set((state) => {
            state.screenWidth = val;
            state.isPc = val >= 900;
          });
        },
        isPc: undefined,
        initIsPc(val: boolean) {
          if (get().isPc !== undefined) {
            return;
          }

          set((state) => {
            state.isPc = val;
          });
        },

        feConfigs: {},
        subPlans: undefined,
        systemVersion: '0.0.0',
        llmModelList: [],
        datasetModelList: [],
        vectorModelList: [],
        audioSpeechModelList: [],
        reRankModelList: [],
        whisperModel: undefined,
        simpleModeTemplates: [],
        initStaticData(res) {
          set((state) => {
            state.feConfigs = res.feConfigs || {};
            state.subPlans = res.subPlans;
            state.systemVersion = res.systemVersion;

            state.llmModelList = res.llmModels ?? state.llmModelList;
            state.datasetModelList = state.llmModelList.filter((item) => item.datasetProcess);
            state.vectorModelList = res.vectorModels ?? state.vectorModelList;
            state.audioSpeechModelList = res.audioSpeechModels ?? state.audioSpeechModelList;
            state.reRankModelList = res.reRankModels ?? state.reRankModelList;
            state.whisperModel = res.whisperModel;

            state.simpleModeTemplates = res.simpleModeTemplates;
          });
        }
      })),
      {
        name: 'globalStore',
        partialize: (state) => ({
          loginStore: state.loginStore
        })
      }
    )
  )
);
