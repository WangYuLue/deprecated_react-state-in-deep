const { produce } = require('immer'); 

// step01: 设置原始数据
const data = {
  a: {
    a1: 1,
    a2: 2
  },
  b: {
    b1: 1,
    b2: {
      c: {
        d: {
          e: 1
        }
      }
    }
  }
};

const data_cp = produce(data, (draft)=>{
  draft.b.b2.c.d.e = 2;
});


console.log(JSON.stringify(data_cp, null, 2));