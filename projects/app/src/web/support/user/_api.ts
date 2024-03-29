import type { PostLoginProps } from '@fastgpt/global/support/user/api';

import { POST } from '@/web/common/api/sophonsai';
import type { RequireAtLeastOne } from '@/types/tools';
import type { UserUpdateParams, UserResType, CreateUserParams } from '@/types/api/user'

// 退出登录
export const logout = () => POST('/user/logout');

export const registerUser = (data: CreateUserParams) => POST('/user/register/by_username', data)

// 用户名密码登录
export const loginByAccount = ({ password, username }: PostLoginProps) =>
  POST<{ token: string }>('/user/login/by_username', { password, user_name: username });

// 获取用户信息
export const queryUserInfo = () => POST<UserResType>('/user/query_userinfo');

// 修改用户信息
export const updateUserInfo = (data: RequireAtLeastOne<UserUpdateParams>) =>
  POST('/user/update_userinfo', data);
