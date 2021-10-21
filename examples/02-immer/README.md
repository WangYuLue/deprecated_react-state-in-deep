# immer

> 可能是目前市面上最优雅的 immutable js库

## 数据不可变

JS 的 object 是引用类型，改变 object 内部的 key 并不会改变对象的引用。而类似 react 等 UI 库需要通过判断对象是否变化来触发 render，所以它们非常推崇数据不可变。

举个例子：

```js
// step01: 设置原始数据
const data = {
  a: {
    a1: 1,
    a2: 2
  },
  b: {
    b1: 1,
    b2: 2
  }
};

// step02: 设置原始数据的值的变化
const data_cp = data;
data_cp.a.a1 = 10;

// step03: 这时候 data_cp 和 data 还是全等的；
//         并且对 data_cp 的修改会改变原始 data 中的值        
console.log(data_cp === data); // true

// step04: 如果想断开和原始值的关系，可以深克隆一下，再赋值

const data_cp1 = JSON.parse(JSON.stringify(data));
data_cp1.a.a1 = 20;

// step05: 这时候 data_cp1 和 data 就不会相等，并且修改值也不会相互影响
//         但是深刻隆的代价很大，很多无需变化的属性也会更新变化，例如： data_cp1.b === data.b 为 false; 
//         放在类似 react 这样的库中，这会导致很多组件无意义的重复渲染（react 的 memo 可以通过浅比较避免重复渲染，从而提高性能；但是深克隆后，没有改变的属性的值浅比较也一定为 false）

console.log(data_cp1 === data); // false
console.log(data_cp1.b === data.b); //false

// step06: 如果不想深克隆那么暴力，而是细粒度的按需跟新，可以用扩展运算符

const data_cp2 = {
  ...data,
  a: {
    ...data.a,
    a1: 30
  }
};

// step07: 这时候 data_cp1 和 data 不是全等的， 而 data_cp2.b 和 data.b 是全等的
//         这样的话，在类似 react 这样的库中，可以做到只渲染数据变化的组件
console.log(data_cp2 === data);
console.log(data_cp2.b === data.b);
```

所以在数据不可变中，我们需要尽量做到细粒度按需更新，这样才能最大的提高性能。

![](./images/01.gif)

上面我们是通过扩展运算符来实现对象的细粒度更新的，如果对象的层级过深，就会像下面这样：

```js
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

const data_cp = {
  ...data,
  b: {
    ...data.b,
    b2: {
      ...data.b.b2,
      c: {
        ...data.b.b2.c,
        d: {
          ...data.b.b2.c.d,
          e: 2
        }
      }
    }
  }
};
```

可以看到上面的写法非常繁琐，有点回调地狱的感觉，而且非常容易出错。有没有什么好的方式达到数据不可变呢？这就请到了今天的主角 —— **immer**

使用 immer，上面的写法可以变成这样：

```js
const { produce } = require('immer'); 

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
```

通过上面的例子我们能发现，所有具有副作用的逻辑都可以放进 produce 的第二个参数的函数内部进行处理。在这个函数内部对原来的数据进行任何操作，都不会对原对象产生任何影响。

Immer 最大的好处就在这里，几乎没有学习成本，可以立刻上手。

## 使用姿势

### produce

前面的例子中就是用的这种方式。

再举一个例子：

```js
let currentState = {
  a: [],
  p: {
    x: 1
  }
}

let nextState = produce(currentState, (draft) => {
  draft.a.push(2);
})

currentState.a === nextState.a; // false
currentState.p === nextState.p; // true
```

### producer

利用高阶函数的特点，提前生成一个生产者 producer，查看下面的例子：

```js
let producer = produce((draft) => {
  draft.x = 2
});
let nextState = producer(currentState);
```

## 与 react 的结合

### 优化 setState

先定义一个 state 对象：

```js
state = {
  members: [
    {
      name: 'ronffy',
      age: 30
    }
  ]
}
```

再定义一个需求：**members 成员中的第1个成员，年龄增加1岁**

传统的方法会这样做：

```js
const { members } = this.state;
this.setState({
  members: [
    {
      ...members[0],
      age: members[0].age + 1,
    },
    ...members.slice(1),
  ]
})
```

或者这样做：

```js
this.setState(state => {
  const { members } = state;
  return {
    members: [
      {
        ...members[0],
        age: members[0].age + 1,
      },
      ...members.slice(1)
    ]
  }
})
```

利用 immer 可以优化如下：

```js
this.setState(produce(draft => {
  draft.members[0].age++;
}))
```

### 优化 redux 的 reducer

接着上面的场景，如果放在 redux 里做更新，写法可能如下：

```js
const reducer = (state, action) => {
  switch (action.type) {
    case 'ADD_AGE':
      const { members } = state;
      return {
        ...state,
        members: [
          {
            ...members[0],
            age: members[0].age + 1,
          },
          ...members.slice(1),
        ]
      }
    default:
      return state
  }
}
```

使用 immer 后，可以如下优化：

```js
const reducer = (state, action) => produce(state, draft => {
  switch (action.type) {
    case 'ADD_AGE':
      draft.members[0].age++;
  }
})
```

再结合 immer 高阶函数的特点，还可以再优化如下：

```js
const reducer = produce((draft, action) => {
  switch (action.type) {
    case 'ADD_AGE':
      draft.members[0].age++;
  }
})
```

### 在 react hooks 中使用 immer

参考 官方文档 [React & Immer](https://immerjs.github.io/immer/example-setstate)

## 其他注意点

### immer 返回的对象数据不可变

immer 返回的对象默认是不可变对象（即：修改该对象内部的属性也无法修改成功），从而避免人为意外地直接修改。

如果不想要这个行为，可以设置 `setAutoFreeze(false)` 来取消，详情参考文档 [Auto freezing](https://immerjs.github.io/immer/freezing)

## 参考文章

- [immer docs](https://immerjs.github.io/immer/)
- [immer.js:也许更适合你的immutable js库](https://zhuanlan.zhihu.com/p/122187278)
- [immer.js 实战讲解文档](https://segmentfault.com/a/1190000017270785)
- [immer —— 提高React开发效率的神器](https://zhuanlan.zhihu.com/p/146773995)
