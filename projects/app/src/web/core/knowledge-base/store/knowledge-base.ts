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

interface KnowledgeBaseListItemType {
  id: string;
  name: string;
  icon: string;
  desc: string;
}

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
  knowledgeBases: KnowledgeBaseListItemType[];
  lodadKnowledgeBases: () => Promise<void>;
  setKnowledgeBases(val: KnowledgeBaseListItemType[]): void;
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
        knowledgeBases: [],
        async lodadKnowledgeBases() {
          const list = await getKnowledgeBaseList();
          set((state) => {
            state.knowledgeBases = list.map((item) => ({
              id: item,
              name: item,
              icon: '',
              desc: ''
            }));
          });
        },
        setKnowledgeBases(val) {
          set((state) => {
            state.knowledgeBases = val;
          });
        },
        knowledgeBaseDetail: defaultKnowledgeBaseDetail,
        async loadKnowledgeBaseDetail(id: string) {
          const result = await getKnowledgeBaseById(id);
          set((state) => {
            state.knowledgeBaseDetail = result;
          });
          return result;
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
