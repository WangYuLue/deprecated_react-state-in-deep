const {produce} = require('immer')

const state = {
  done: false,
  val: 'string',
}

// 所有具有副作用的操作，都可以放入 produce 函数的第二个参数内进行
// 最终返回的结果并不影响原来的数据
const newState = produce(state, (draft) => {
  draft.done = true
})

console.log(state.done)    // false
console.log(newState.done) // true