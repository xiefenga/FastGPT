export interface UserResType {
  user_id: string;
  user_name: string;
  password: string;
  nick_name: string;
  avatar: string;
  wechat_openid: string;
  phone: string;
  access_token: string;
  create_time: string;
  update_time: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost: number;
  cost_unit: string;
  msg_num: number;
  usage_detail: string;
}

export interface LoginResType {
  user: UserResType;
  token: string;
}

export interface CreateUserParams {
  user_name: string
  password: string
  nick_name: string
  phone: string
}

export interface UserUpdateParams {
  user_name: string;
  password: string;
  nick_name: string;
  phone: string;
  avatar: string;
}
