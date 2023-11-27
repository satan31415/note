import http from '../utils/http';

const VITE_GLOB_REQUEST_BASE_URL = import.meta.env.VITE_GLOB_REQUEST_BASE_URL;
/**
 * 测试 POST 请求
 * @param data 请求携带data
 * @param isloading 是否显示loading界面
 * @param ismsg 请求结束后是否显示正确、失败消息
 * @returns 实例
 */
export const postApiByLoading = (url: string, data: object, isloading: boolean, loadingText: string, msgText: string, ismsg: boolean, headers: Record<string, string> = {}) => {
  const requestUrl = getFullUrl(url);
  return http.request(
    {
      url: requestUrl,
      method: 'POST',
      data,
    },
    isloading,
    loadingText,
    ismsg,
    msgText,
    headers,
  );
};

export const postApi = (url: string, data: object, headers: Record<string, string> = {}) => {
  const requestUrl = getFullUrl(url);
  return http.request(
    {
      url: requestUrl,
      method: 'POST',
      data,
    },
    false,
    'null',
    false,
    'null',
    headers,
  );
};


const getFullUrl = (url: string): string => {
  let requestUrl = '';
  if (url.startsWith('https://') || url.startsWith('http://')) {
    requestUrl = url;
  } else {
    requestUrl = VITE_GLOB_REQUEST_BASE_URL + url;
  }
  return requestUrl;
};
