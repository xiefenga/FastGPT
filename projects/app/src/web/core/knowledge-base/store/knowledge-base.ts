import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools, persist } from 'zustand/middleware';

import type { DatasetItemType, DatasetListItemType } from '@fastgpt/global/core/dataset/type.d';
import {
  getAllDataset,
  getDatasets,
  getDatasetById,
  putDatasetById,
  postWebsiteSync
} from '@/web/core/dataset/api';
import { defaultDatasetDetail } from '@/constants/dataset';
import type { DatasetUpdateBody } from '@fastgpt/global/core/dataset/api.d';
import { DatasetStatusEnum, DatasetTypeEnum } from '@fastgpt/global/core/dataset/constants';
import { postCreateTrainingUsage } from '@/web/support/wallet/usage/api';
import { checkTeamWebSyncLimit } from '@/web/support/user/team/api';
import { getKnowledgeBaseById, getKnowledgeBaseList } from '@/web/core/knowledge-base/api';
import { KnowledgeBaseItemType } from '@/global/core/knowledge-base/type.d';

const defaultKnowledgeBaseDetail: KnowledgeBaseItemType = {
  id: '',
  name: '',
  icon: '/icon/logo.svg',
  desc: '',
  vector_store: '',
  embed_model: ''
};

type State = {
  /* --------  knowledge base --------*/
  loaded: boolean;
  knowledgeBases: KnowledgeBaseItemType[];
  lodadKnowledgeBases: () => Promise<void>;
  setKnowledgeBases(val: KnowledgeBaseItemType[]): void;
  knowledgeBaseDetail: KnowledgeBaseItemType;
  loadKnowledgeBaseDetail: (id: string) => Promise<KnowledgeBaseItemType>;

  allDatasets: DatasetListItemType[];
  loadAllDatasets: () => Promise<DatasetListItemType[]>;
  myDatasets: DatasetListItemType[];
  loadDatasets: (parentId?: string) => Promise<any>;
  setDatasets(val: DatasetListItemType[]): void;
  datasetDetail: DatasetItemType;
  loadDatasetDetail: (id: string, init?: boolean) => Promise<DatasetItemType>;
  updateDataset: (data: DatasetUpdateBody) => Promise<any>;
  startWebsiteSync: () => Promise<any>;
};

export const useKnowledgeBaseStore = create<State>()(
  devtools(
    persist(
      immer((set, get) => ({
        loaded: false,
        knowledgeBases: [],
        async lodadKnowledgeBases() {
          const list = await getKnowledgeBaseList();
          set((state) => {
            state.knowledgeBases = list.map((item) => ({
              id: item.id.toString(),
              name: item.kb_name,
              icon: '',
              desc: item.kb_info,
              vector_store: item.vs_type,
              embed_model: item.embed_model
            }));
            state.loaded = true;
          });
        },
        setKnowledgeBases(val) {
          set((state) => {
            state.knowledgeBases = val;
          });
        },
        knowledgeBaseDetail: defaultKnowledgeBaseDetail,
        async loadKnowledgeBaseDetail(name: string) {
          const { loaded, knowledgeBases, lodadKnowledgeBases, loadKnowledgeBaseDetail } = get();
          if (loaded) {
            const detail = knowledgeBases.find((item) => item.name === name);
            if (!detail) {
              throw new Error('该知识库不存在');
            }
            set((state) => {
              state.knowledgeBaseDetail = detail;
            });
            return detail;
          }
          await lodadKnowledgeBases();
          return loadKnowledgeBaseDetail(name);
        },

        allDatasets: [],
        async loadAllDatasets() {
          const res = await getAllDataset();
          set((state) => {
            state.allDatasets = res;
          });
          return res;
        },
        myDatasets: [],
        async loadDatasets(parentId = '') {
          const res = await getDatasets({ parentId });
          set((state) => {
            state.myDatasets = res;
          });
          return res;
        },
        setDatasets(val) {
          set((state) => {
            state.myDatasets = val;
          });
        },
        datasetDetail: defaultDatasetDetail,
        async loadDatasetDetail(id: string, init = false) {
          if (!id || (id === get().datasetDetail._id && !init)) {
            return get().datasetDetail;
          }

          const data = await getDatasetById(id);

          set((state) => {
            state.datasetDetail = data;
          });

          return data;
        },
        async updateDataset(data) {
          await putDatasetById(data);

          if (get().datasetDetail._id === data.id) {
            set((state) => {
              state.datasetDetail = {
                ...get().datasetDetail,
                ...data
              };
            });
          }
          set((state) => {
            state.myDatasets = state.myDatasets = state.myDatasets.map((item) =>
              item._id === data.id
                ? {
                    ...item,
                    ...data
                  }
                : item
            );
          });
        },
        async startWebsiteSync() {
          await checkTeamWebSyncLimit();

          const billId = await postCreateTrainingUsage({
            name: 'core.dataset.training.Website Sync',
            datasetId: get().datasetDetail._id
          });

          return postWebsiteSync({ datasetId: get().datasetDetail._id, billId }).then(() => {
            get().updateDataset({
              id: get().datasetDetail._id,
              status: DatasetStatusEnum.syncing
            });
          });
        }
      })),
      {
        name: 'datasetStore',
        partialize: (state) => ({})
      }
    )
  )
);
