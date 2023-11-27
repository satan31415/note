import { defineStore } from 'pinia';

interface IndexState {
  MyCustomObject: {
    [MyCustomObjectAttribute1: string]: any;
  };
  UserID: string;
}

export const STORE_Index_Page = defineStore({
  id: 'indexPage',
  state: (): IndexState => {
    return {
      MyCustomObject: {},
      UserID: '',
    };
  },
  actions: {
    Set_MyCustomObject(data: {}) {
      this.MyCustomObject = data;
    },
    Set_UserID(data: string) {
      this.UserID = data;
    },
  },
});
