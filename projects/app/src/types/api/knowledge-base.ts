// ------------------ request ------------------

export interface DownloadKnowledgeBaseParams {
  knowledge_base_name: string;
  file_name: string;
  preview: boolean;
}

// ------------------ response ------------------

export interface KnowledgeBaseItemRes {
  id: number;
  kb_name: string;
  kb_info: string;
  vs_type: string;
  embed_model: string;
  file_count: number;
  create_time: string;
}

export interface KnowledgeBaseFileItemRes {
  create_time: string;
  custom_docs: boolean;
  docs_count: number;
  document_loader_name: string;
  file_ext: string;
  file_mtime: number;
  file_name: string;
  file_size: number;
  file_version: number;
  id: number;
  kb_name: string;
  text_splitter_name: string;
}
