/**
 * @summary 探讨 useMemo, memo 的使用场景
 * 
 * @description 作用：通过浅层对比，来阻止不必要的渲染
 * 
 * @content  1、父组件重新 render 时，也会尝试重新 render 子组件； （step-01）
 *           2、如果子组件没有 memo，会跟着父组件 render； （step-02）
 *           3、如果子组件有 memo，且 props 浅对比没有变化，则不会跟着父组件 render； （step-03, step-04, step-05）
 *           4、JSX 中的匿名函数在每次 父组件 render 时重新生成，这是即使 memo，浅对比也会不一样，这时候 子组件也会重新 render； （step-06）
 *           5、由于 memo 是浅对比，所以当一个对象作为 prop 传入子组件时，如果对象的引用没有变化，即使父组件 render,也不会触发 子组件render； （step-07）
 */

/* eslint-disable react/display-name */


import * as React from 'react';
import { render } from 'react-dom';

const { useState, useMemo, memo, useCallback } = React;

interface IProps {
  log: (str:string)=>void;
}

const App  = () => {
  console.log('==== App render ====');

  // step-01：改变状态，触发整个页面渲染
  const [count, setCount] = useState(0);

  return (
    <div>
      <div>{count}</div>
      <button onClick = {()=> setCount(count+1)}>add</button>
      <Child1/>
      <Child2/>
      <Child3/>
      <Child4/>
      <Child5/>
    </div>
  );
};

// step-02：Child1 没有 memo，所以父组件渲染的时候也会跟着渲染
const Child1 = () => {
  console.log('Child1 render');
  return (
    <div>
      <Child1_1 />
    </div>
  );
};

const Child1_1 = () => {
  console.log('Child1_1 render');
  return (
    <div>
      Child1_1
    </div>
  );
};

// tep-03：Child2 有 memo，这时候如果props参数没有变，不会会跟着父组件渲染
const Child2 = memo(() => {
  console.log('Child2 render');
  return (
    <div>
      <Child2_1 />
    </div>
  );
});

const Child2_1 = () => {
  console.log('Child2_1 render');
  return (
    <div>
      Child2_1
    </div>
  );
};


const Child3 = () => {
  console.log('Child3 render');

  const log = (str:string)=>{
    console.log(`log -> ${str}`);
  };

  return (
    <div>
      <Child3_1 log={log}/>
      {/* 
        step-04：Child3_2 有 memo，
        但是 props 中的 log 方法会随着 Child3 的渲染每次都会重新生成，
        所以也会跟着父组件渲染 
      */}
      <Child3_2 log={log}/>
    </div>
  );
};

const Child3_1 = (prop: IProps) => {
  prop.log('Child3_1 render');
  return (
    <div>
      Child3_1
    </div>
  );
};

const Child3_2 = memo((prop: IProps) => {
  prop.log('Child3_2 render');
  return (
    <div>
      Child3_2
    </div>
  );
});


const Child4 = () => {
  console.log('Child4 render');

  const log = useMemo(()=>(str:string)=>{
    console.log(`log -> ${str}`);
  }, []);

  // 上面的 log 也可以使用 useCallback
  // const log = useCallback((str:string)=>{
  //   console.log(`log -> ${str}`);
  // }, []);
  
  return (
    <div>
      <Child4_1 log={log}/>
      {/* 
        step-05：Child4_2 有 memo，
        而且 log 方法用 useMemo 包了一下，
        所以 props 中的 log 方法不会随着 Child3 的渲染每次都会重新生成，
        所以 Child4_2 不会跟着父组件渲染 
      */}
      <Child4_2 log={log}/>
      {/* 
        step-06：Child4_3 有 memo，
        虽然 log 方法用 useMemo 包了一下，但是传入 Child4_2 时是每次都会重新生成的匿名函数
        所以 props 中的 log 方法会随着 Child3 的渲染每次都会重新生成，
        所以 Child4_3 跟着父组件渲染 
      */}
      <Child4_3 log={(...args)=>log(...args)}/>
    </div>
  );
};

const Child4_1 = (prop: IProps) => {
  prop.log('Child4_1 render');
  return (
    <div>
      Child4_1
    </div>
  );
};

const Child4_2 = memo((prop: IProps) => {
  prop.log('Child4_2 render');
  return (
    <div>
      Child4_2
    </div>
  );
});

const Child4_3 = memo((prop: IProps) => {
  prop.log('Child4_3 render');
  return (
    <div>
      Child4_3
    </div>
  );
});

class Count {
  count  = 0;
  addCount = () => {
    this.count++;
  }
}

const child5Count = new Count();

/* 
  step-07：Child5 构造了一个相对不规范的 react 使用方式，即：
  父组件将一个外部类的实例传递给子组件，这时候子组件的 props 在 render 时不会变化
  所以，这时候如果用 memo 包一下子组件，即使类实例中的组件发生变化并且 forceUpdate，也不会触发子组件的 render
  (除非再给子组件加一个变化的 prop,让子组件判断出每次 render props 不一样)
*/
const Child5 = () => {
  console.log('Child5 render');
  const [, updateState] = useState([]);
  const forceUpdate = useCallback(() => updateState([]), []);

  const addCount = () => {
    child5Count.addCount();
    forceUpdate();
  };

  return (
    <div>
      <button onClick = {addCount}>child5 add</button>
      <Child5_1 count={child5Count}/>
      <Child5_2 count={child5Count}/>
    </div>
  );
};

const Child5_1 = (props:{
  count: Count
}) => {
  console.log('Child5_1 render');
  return (
    <div>
      Child5_1  {props.count.count}
    </div>
  );
};

const Child5_2 = memo((props:{
  count: Count
}) => {
  console.log('Child5_2 render');
  return (
    <div>
      Child5_2 {props.count.count}
    </div>
  );
});

render(<App/>, document.getElementById('app'));
