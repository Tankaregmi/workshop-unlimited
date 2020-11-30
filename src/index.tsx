import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import wakeLock from './utils/wakeLock';


ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);


wakeLock(true);
