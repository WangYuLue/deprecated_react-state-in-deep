import * as React from 'react';
import { render } from 'react-dom';

const  { useEffect } = React;

const App = () => {
  useEffect(()=>{
    console.log('log');
  }, []);

  return (
    <div>
      hello world
    </div>
  );
};

render(<App/>, document.getElementById('app'));
