import { GET, POST } from '@/web/common/api/sophonsai';

import { CreateKnowledgeBaseParams } from '@/global/core/knowledge-base/api.d';
import { KnowledgeBaseItemType } from '@/global/core/knowledge-base/type.d';
import {
  DownloadKnowledgeBaseParams,
  KnowledgeBaseFileItemRes,
  KnowledgeBaseItemRes
} from '@/types/api/knowledge-base';

// 获取知识库列表
export const getKnowledgeBaseList = () =>
  GET<KnowledgeBaseItemRes[]>('/knowledge_base/list_detail_knowledge_bases');

// 删除知识库
export const deleteKnowledgeBase = (id: string) =>
  POST(`/knowledge_base/delete_knowledge_base`, `"${id}"`);

export const createKnowledgeBase = ({
  vector_store_type,
  knowledge_base_name,
  embed_model
}: CreateKnowledgeBaseParams) =>
  POST(`/knowledge_base/create_knowledge_base`, {
    vector_store_type,
    knowledge_base_name,
    embed_model
  });

export const getKnowledgeBaseById = (id: string) =>
  GET<KnowledgeBaseItemType>(`/knowledge_base/get_knowledge_base_by_id`, { id });

//
// RequestPaging & {}
export const getKnowledgeBaseFiles = (params: { knowledge_base_name: string }) =>
  GET<KnowledgeBaseFileItemRes[]>(`/knowledge_base/list_files_detail`, { ...params });

// 下载知识库中文件
export const downloadKnowledgeBaseFile = (params: DownloadKnowledgeBaseParams) =>
  GET<string>('/knowledge_base/download_doc', params);

// 上传文件到知识库，并/或进行向量化
export const UpdateDocs2KnowledgeBase = (formData: FormData) => {
  return POST('/knowledge_base/upload_docs', formData, {
    headers: {
      'content-type': 'multipart/form-data'
    }
  });
};
