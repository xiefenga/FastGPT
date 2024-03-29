import type { PostLoginProps } from '@fastgpt/global/support/user/api';

import { POST } from '@/web/common/api/sophonsai';
import type { RequireAtLeastOne } from '@/types/tools';
import type { UserUpdateParams, UserResType } from '@/types/api/user';

export const logout = () => POST('/user/logout');

// 用户名密码登录
export const loginByAccount = ({ password, username }: PostLoginProps) =>
  POST<{ token: string }>('/user/login/by_username', { password, user_name: username });

// 获取用户信息
export const queryUserInfo = () => POST<UserResType>('/user/query_userinfo');

//
export const updateUserInfo = (data: RequireAtLeastOne<UserUpdateParams>) =>
  POST('/user/update_userinfo', data);
