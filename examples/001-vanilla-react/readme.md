# 原生 React 状态管理

## demo01 - `context`

**使用原生 `context`，跨组建传递状态（class 类的写法）**

使用到的 API: `React.createContext`

### `context` 的缺陷

代码被侵入，这会使得组件的复用性变差。

### 相关文档

- [react docs - Context](https://zh-hans.reactjs.org/docs/context.html)

## demo02 - `useContext`

**使用原生 `useContext`，跨组建传递状态（hooks 写法）**

`useContext` 可以替代 class 写法中的 contextType;

```js
class Sub extends React.Component {
  static contextType = AContext; 
  render() {
    return (
      <div>context value: {JSON.stringify(this.context)}</div>
    );
  }
}

// to

function Sub () {
  const context = useContext(AContext);
  return (
    <div>hooks: context value: {JSON.stringify(context)}</div>
  );
}
```

## demo02 - `useContext`