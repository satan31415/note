import axios from 'axios'
import { ElMessage } from 'element-plus'

const instance = axios.create({
  baseURL: '/',
  timeout: 5000,
})
// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 在发送请求之前做一些处理
    return config
  },
  (error) => {
    // 处理请求错误
    return Promise.reject(error)
  }
)
// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    // 对响应数据做一些处理
    if (response.status === 200 && response.data && response.data.success === true) {
      return response.data
    }
    if (response.status === 200 && response.data && response.data.success === false) {
      ElMessage.error({
        message: response.data.message,
        type: 'error',
      })
      return Promise.reject(response)
    }
  },
  (error) => {
    // 处理响应错误
    console.error('响应拦截器错误', error)
    /* 服务器错误, 请求不通时的错误 */
    ElMessage.error({
      message: '服务器错误, 请联系管理员',
      type: 'error',
    })
    return Promise.reject(error)
  }
)
export default instance
