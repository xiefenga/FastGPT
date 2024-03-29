import { GET, POST, PUT, DELETE } from '@/web/common/api/sophonsai';

import { PagingData, type RequestPaging } from '@/types';
import { CreateKnowledgeBaseParams } from '@/global/core/knowledge-base/api.d';
import {
  KnowledgeBaseFileItemType,
  KnowledgeBaseItemType
} from '@/global/core/knowledge-base/type.d';

export const getKnowledgeBaseList = () => GET<string[]>('/knowledge_base/list_knowledge_bases');

export const deleteKnowledgeBase = (id: string) =>
  POST(`/knowledge_base/delete_knowledge_base`, { id });

export const createKnowledgeBase = (data: CreateKnowledgeBaseParams) =>
  POST(`/knowledge_base/create_knowledge_base`, data);

export const getKnowledgeBaseById = (id: string) =>
  GET<KnowledgeBaseItemType>(`/knowledge_base/get_knowledge_base_by_id`, { id });

export const getKnowledgeBaseFiles = (params: RequestPaging & {}) =>
  GET<PagingData<KnowledgeBaseFileItemType>>(`/knowledge_base/list_files`, { ...params });
