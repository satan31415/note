import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { hideLoading, showLoading } from './loading';
import router from '../router/index';
import { electronStoreSetInvokeToMainWindow } from './ipc-util';

// 接口类型和方法
interface BaseType {
  baseURL: string;

  getConfigParams(): any;

  interceptors(
    instance: AxiosInstance,
    url: string | number | undefined,
    isloading: boolean,
    ismsg: boolean,
    msg_txt: string
  ): any;

  request(
    options: AxiosRequestConfig,
    isloading: boolean,
    loading_txt: string,
    ismsg: boolean,
    msg_txt: string
  ): any;
}

interface AxiosRequestType {
  baseURL?: string;
  url?: string | undefined;
  data?: any;
  params?: any;
  method?: string;
  headers?: any;
  timeout?: number;
  value?: any;
  cancelToken?: any;
}

let timer: any = null;
let timerHideLoading: any = null;
class AxiosHttpRequest implements BaseType {
  baseURL: string;
  timeout: number;

  //withCredentials: boolean;
  constructor() {
    this.baseURL = import.meta.env.VITE_GLOB_REQUEST_BASE_URL;
    this.timeout = 15000;
    //this.withCredentials = true;
  }

  // 配置参数
  getConfigParams() {
    const config = {
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {},
    };
    return config;
  }

  // 拦截设置
  interceptors(
    instance: AxiosInstance,
    url: string | number | undefined,
    isloading: boolean,
    ismsg: boolean,
    msg_txt: string,
  ) {
    // 请求拦截
    instance.interceptors.request.use(
      (config: AxiosRequestType) => {
        if (config.method === 'put') {
          config.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
        } else {
          config.headers['Content-Type'] = 'application/json;charset=utf-8';
        }
        // get请求映射params参数
        if (config.method === 'get' && config.params) {
          let url = config.url + '?';
          for (const propName of Object.keys(config.params)) {
            const value = config.params[propName];
            const part = encodeURIComponent(propName) + '=';
            if (value !== null && typeof value !== 'undefined') {
              if (typeof value === 'object') {
                for (const key of Object.keys(value)) {
                  const params = propName + '[' + key + ']';
                  const subPart = encodeURIComponent(params) + '=';
                  url += subPart + encodeURIComponent(value[key]) + '&';
                }
              } else {
                url += part + encodeURIComponent(value) + '&';
              }
            }
          }
          url = url.slice(0, -1);
          config.params = {};
          config.url = url;
        }
        return config;
      },
      (error: any) => {
        return Promise.reject(error);
      },
    );

    // 响应拦截
    instance.interceptors.response.use(
      (res: any) => {
        if (isloading) {
          hideLoading();
        } else {
          if (timer) {
            hideLoading();
            clearTimeout(timer);
            timer = null;
          }
          if (timerHideLoading) {
            clearTimeout(timerHideLoading);
            timerHideLoading = null;
          }
        }

        // console.log('正确响应拦截', JSON.stringify(res, null, 2));

        // 返回 http 状态码
        const responseHttpStatus = res.status;

        // 获取错误信息
        let msg = res.data['msg'] || '';

        if (res.data['code'] !== 200) {
          // 我们自己定义报文中编码的值
          ElMessage.error({
            message: msg,
            duration: 5 * 1000,
            offset: 50,
          });
          return Promise.reject(res.data);
        }

        if (ismsg) {
          ElMessage({
            message: msg_txt === 'null' ? '请求成功！' : msg_txt,
            grouping: true,
            type: 'success',
            offset: 50,
          });
        }
        return Promise.resolve(res.data);
      },
      async (error: any) => {
        if (isloading) {
          hideLoading();
        } else {
          if (timer) {
            hideLoading();
            clearTimeout(timer);
            timer = null;
          }
          if (timerHideLoading) {
            clearTimeout(timerHideLoading);
            timerHideLoading = null;
          }
        }


        // 非 2xx 范围的状态码都会触发该函数。
        // error 和 error.response 是不一样的类型，要注意
        // console.log('错误响应拦截：' + JSON.stringify(error.response, null, 2));
        let httpStatus = error.response.status;

        if (httpStatus === 401 || httpStatus === 403) {
          // 跳转到登录
          await electronStoreSetInvokeToMainWindow('loginAccessToken', '');
          await router.push('/login');
          return;
        }

        let { message } = error;
        if (message == 'Network Error') {
          message = '后端接口连接异常，请稍后重试。';
        } else if (message.includes('timeout')) {
          message = '系统接口请求超时，请稍后重试。';
        } else {
          message = error.response.data['msg'];
        }
        ElMessage.error({
          message,
          duration: 5 * 1000,
          offset: 50,
        });

        return Promise.reject(error.response);
      },
    );
  }

  /**
   * 外部调用方法
   * @param options axios请求参数
   * @param isloading 是否显示loading界面
   * @param loading_txt loding界面显示文本
   * @param ismsg 是否显示消息
   * @param msg_txt 请求成功消息文本
   * @returns 实例
   */
  request(
    options: AxiosRequestConfig,
    isloading: boolean,
    loading_txt: string,
    ismsg: boolean,
    msg_txt: string,
    headers: Record<string, string> = {},
  ) {
    const instance = axios.create();
    if (isloading) {
      showLoading(loading_txt === 'null' ? '加载中......' : loading_txt);
    } else {
      if (!timer) {
        // 网络请求超过 3 秒还未响应则显示 loading 效果
        timer = setTimeout(() => {
          showLoading('加载中......');
        }, 3000);
      }
      if (timer) {
        // 为了避免加载中的提示一直存在，设定自动关闭
        timerHideLoading = setTimeout(() => {
          hideLoading();
          clearTimeout(timer);
          timer = null;
        }, 10000);
      }
    }
    options = Object.assign(this.getConfigParams(), options);

    // 在 options 对象中添加 headers
    options.headers = {
      ...options.headers,
      ...headers,
    };

    this.interceptors(instance, options.url, isloading, ismsg, msg_txt);
    return instance(options);
  }
}

// 实例化请求类
const http = new AxiosHttpRequest();

export default http;
