import copy from './modules/copy'
import debounce from './modules/debounce'
import throttle from './modules/throttle'
import longpress from './modules/longpress'

const directivesList = {
  copy,
  debounce,
  throttle,
  longpress,
}

const directives = {
  install(app) {
    Object.keys(directivesList).forEach((key) => {
      // 注册所有自定义指令
      app.directive(key, directivesList[key])
    })
  },
}

export default directives
