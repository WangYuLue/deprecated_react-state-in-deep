# 原生 React 状态管理

## Context & useContext

在一个典型的 React 应用中，数据是通过 props 属性自上而下（由父及子）进行传递的，但此种用法对于某些类型的属性而言是极其繁琐的。

Context 提供了一种在组件之间共享此类值的方式，而不必显式地通过组件树的逐层传递 props。

### 使用到的 API

- `React.createContext`
- `Context.Provider`
- `Context.Consumer`

### 优缺点

优点：不必显示的一层层传递组件
缺点：使得组件的复用性变差

### 其他情况

#### 改变 context 里的值

将函数放入 `BaseContext.Provider` 里，例如：

```js
class App extends React.Component {
  state= {
    color: 'balck'
  }

  setColor = (color: string) => {
    this.setState({ color });
  }
  render() {
    return (
      <BaseContext.Provider value={{
        color: this.state.color,
        setColor: this.setColor
      }}>
        <Toolbar />
      </BaseContext.Provider>
    );
  }
}

// Sub 是 Toolbar 的深层子组件
const Sub = () => {
  const context = useContext(BaseContext);
  return (
    <div>
      <button onClick={()=>context.setColor('red')}>变红</button>
    </div>
  );
}
```

#### 一个组件中需要使用多个 context

使用多层 Consumer，例如：

```js
// 一个组件可能会消费多个 context
function Content() {
  return (
    <ThemeContext.Consumer>
      {theme => (
        <UserContext.Consumer>
          {user => (
            <ProfilePage user={user} theme={theme} />
          )}
        </UserContext.Consumer>
      )}
    </ThemeContext.Consumer>
  );
}
```

详情参考文档 [docs - consuming-multiple-contexts](https://zh-hans.reactjs.org/docs/context.html#consuming-multiple-contexts)

### 相关文档

- [react docs - Context](https://zh-hans.reactjs.org/docs/context.html)

### 相关例子

- 01-context
- 02-useContext

### 拓展阅读

- [react issue: Preventing rerenders with React.memo and useContext hook](https://github.com/facebook/react/issues/15156)

## memo, useMemo, pureComponent 的作用

作用：**通过浅层对比，来阻止不必要的渲染**

1. 父组件重新 render 时，也会尝试重新 render 子组件；
2. 如果子组件没有 memo，会跟着父组件 render；
3. 如果子组件有 memo，且 props 浅对比没有变化，则不会跟着父组件 render；
4. JSX 中的匿名函数在每次 父组件 render 时重新生成，这是即使 memo，浅对比也会不一样，这时候 子组件也会重新 render；
5. 由于 memo 是浅对比，所以当一个对象作为 prop 传入子组件时，如果对象的引用没有变化，即使父组件 render,也不会触发 子组件render；

### 相关例子

- 03-memo
