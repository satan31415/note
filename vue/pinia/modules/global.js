import { defineStore } from 'pinia'

export const GlobalStore = defineStore({
  id: 'GlobalStore',
  state: () => ({
    userinfo: {},
  }),
  actions: {
    // setUserInfo
    async setUserInfo(userinfo) {
      this.userinfo = userinfo
    },
  },
  persist: {
    key: 'GlobalStore',
    storage: localStorage,
    // 指定需要持久化的state
    path: ['userinfo']
  }
})
