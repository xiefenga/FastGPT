export interface KnowledgeBaseItemType {
  id: string;
  name: string;
  icon: string;
  desc: string;
  vector_store: string; // 向量库
  embed_model: string; // Embedding 模型
  // type: `${KnowledgeBaseTypeEnum}` // 知识库类型，便于扩展
}

export interface KnowledgeBaseFileItemType {
  id: string;
  name: string;
  dataAmount: number;
  updateTime: Date;
}
