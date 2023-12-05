```javascript
// 魔法数字：在代码中直接出现的数字，称为魔法数字
// 1. 难以理解
// 2. 难以修改
// 3. 难以搜索
// 4. 难以记忆
// 5. 难以检查错误
// 6. 难以阅读
// 7. 难以维护
// 8. 难以重用
// 9. 难以推广
// 10. 难以优化

// 比如以下代码：
// if(status === 1 || status === 2){
//
// }else if(status  === 3){
//
// }else if(status === 4){
//
// }else{
//
// }

// 很快，所有人都会忘记这些数字的含义，这就是魔法数字的问题，所以我们要用常量、变量、枚举替代魔法数字

// 以下为常量代替

export const STATUS = {
    // 实名认证的成人
    adultRealName: 1,
    // 实名认证的儿童
    childRealName: 2,
    // 未实名认证的成人
    adultNotRealName: 3,
    // 未实名认证的儿童
    childNotRealName: 4,
    // 未实名认证的婴儿
    babyNotRealName: 5,
}

// 使用：import { STATUS } from '@/utils/constants'
if([STATUS.adultRealName, STATUS.childRealName].includes(status)){

}else if(status === STATUS.childNotRealName){

}
```
