import axios from 'axios';
import type { Method, AxiosProgressEvent, AxiosRequestConfig } from 'axios';

import { TOKEN_ERROR_CODE } from '@fastgpt/global/common/error/errorCode';

import { clearToken, getToken } from '@/web/support/user/auth';

interface ConfigType {
  headers?: Record<string, string>;
  timeout?: number;
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
  cancelToken?: AbortController;
  maxQuantity?: number;
}

interface ResponseDataType<T = unknown> {
  code: number;
  message: string;
  data: T;
}

interface MaxQuantityMapItem {
  amount: number;
  sign: AbortController;
}

const maxQuantityMap: Record<string, MaxQuantityMapItem> = {};

interface RequestStartProps {
  url: string;
  maxQuantity?: number;
}

function requestStart({ url, maxQuantity }: RequestStartProps) {
  if (!maxQuantity) {
    return;
  }

  const item = maxQuantityMap[url];

  if (item) {
    if (item.amount >= maxQuantity && item.sign) {
      item.sign.abort();
      delete maxQuantityMap[url];
    }
  } else {
    maxQuantityMap[url] = {
      amount: 1,
      sign: new AbortController()
    };
  }
}

function requestFinish({ url }: { url: string }) {
  const item = maxQuantityMap[url];
  if (item) {
    item.amount--;
    if (item.amount <= 0) {
      delete maxQuantityMap[url];
    }
  }
}

/**
 * 响应数据检查
 */
function checkRes(data: ResponseDataType) {
  if (data.code < 200 || data.code >= 400) {
    return Promise.reject(data);
  }
  return data.data;
}

/**
 * 响应错误
 */
function responseError(error: any) {
  console.log('error->', '请求错误', error);

  if (!error) {
    return Promise.reject({ message: '未知错误' });
  }
  if (typeof error === 'string') {
    return Promise.reject({ message: error });
  }

  // 有报错响应
  if (error?.code in TOKEN_ERROR_CODE) {
    clearToken();

    window.location.replace(
      `/login?lastRoute=${encodeURIComponent(location.pathname + location.search)}`
    );

    return Promise.reject({ message: '无权操作' });
  }
  if (error?.response?.data) {
    return Promise.reject(error?.response?.data);
  }
  return Promise.reject(error);
}

/* 创建请求实例 */
const instance = axios.create({
  timeout: 60000, // 超时时间
  headers: {
    'content-type': 'application/json'
  }
});

/* 请求拦截 */
instance.interceptors.request.use(
  (config) => {
    if (config.headers) {
      config.headers['access-token'] = getToken();
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* 响应拦截 */
instance.interceptors.response.use(
  (response) => {
    if (response.headers.access_token) {
      response.data.data ??= {};
      response.data.data.token = response.headers.access_token;
    }
    return response;
  },
  (error) => Promise.reject(error)
);

function createRequest(method: Method) {
  return function request<T = unknown>(
    url: string,
    data: any = {},
    { cancelToken, maxQuantity, ...config }: ConfigType = {}
  ): Promise<T> {
    // requestStart({url, maxQuantity})

    const option: AxiosRequestConfig = {
      baseURL: '/sophonsai',
      url,
      method,
      data: ['POST', 'PUT'].includes(method) ? data : null,
      params: !['POST', 'PUT'].includes(method) ? data : null,
      signal: cancelToken?.signal,
      ...config // 用户自定义配置，可以覆盖前面的配置
    };

    return instance
      .request(option)
      .then((res) => res.data)
      .then((resp) => (typeof resp === 'object' && resp !== null ? checkRes(resp) : resp) as T)
      .catch((err) => responseError(err))
      .finally(() => requestFinish({ url }));
  };
}

export const GET = createRequest('GET');

export const POST = createRequest('POST');

export const PUT = createRequest('PUT');

export const DELETE = createRequest('DELETE');
