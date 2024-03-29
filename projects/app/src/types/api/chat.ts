export interface ChatHistoryItemType {
  id: string;
  title: string;
  create_time: string;
  update_time: string;
  model_name: string;
  chat_type: string;
  msg_num: number;
}

export interface ChatMessageItemType {
  id: string;
  query: string;
  response: string;
  create_time: string;
  model_name: string;
  chat_type: string;
}
