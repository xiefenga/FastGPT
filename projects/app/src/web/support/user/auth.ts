const tokenKey = '@sophonsai::token';

export const clearToken = () => {
  try {
    localStorage.removeItem(tokenKey);
  } catch {}
};

export const setToken = (token: string) => {
  if (typeof window === 'undefined') {
    return '';
  }
  localStorage.setItem(tokenKey, token);
};
export const getToken = () => {
  if (typeof window === 'undefined') {
    return '';
  }
  return localStorage.getItem(tokenKey) || '';
};
