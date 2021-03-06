/**
 * @summary 使用 context 跨组建传递状态
 * 
 * @advantage 不必显示的一层层传递组件
 * @disadvantage 使组件的复用性变差
 * 
 * @tips 1、类组件使用 contextType 指定 context；函数组件使用 useContext 指定 context;
 */

import * as React from 'react';
import { render } from 'react-dom';

const AContext = React.createContext({
  age: 18
});

const BaseContext = React.createContext({
  color: 'red'
});

class App extends React.Component {
  render() {
    // 使用一个 Provider 来将当前的 theme 传递给以下的组件树。
    // 无论多深，任何组件都能读取这个值。
    return (
      <AContext.Provider value={{ age: 28 }}>
        <BaseContext.Provider value={{ color: 'balck' }}>
          <AContext.Provider value={{ age: 38 }}>
            <Toolbar />
          </AContext.Provider>
        </BaseContext.Provider>
      </AContext.Provider>
    );
  }
}

// 中间的组件再也不必指明往下传递 theme 了。
function Toolbar() {
  return (
    <div>
      <Sub />
    </div>
  );
}

class Sub extends React.Component {
  // 需要指定当前使用那个 context。（ class 中用 contextType）
  static contextType = AContext; // 不可省略
  // React 会往上找到最近的 theme Provider，然后使用它的值。
  render() {
    return (
      <div>context value: {JSON.stringify(this.context)}</div>
    );
  }
}

render(<App/>, document.getElementById('app'));
