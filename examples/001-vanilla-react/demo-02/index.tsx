import * as React from 'react';
import { render } from 'react-dom';

const { useContext } = React;

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

function Sub () {
  const context = useContext(BaseContext);
  return (
    <div>hooks: context value: {JSON.stringify(context)}</div>
  );
}

render(<App/>, document.getElementById('app'));
