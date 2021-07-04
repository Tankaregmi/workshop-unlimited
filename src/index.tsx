import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import serviceWorkerRegistration from './serviceWorkerRegistration';
import wakeLock from './wakeLock';


ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);


// serviceWorkerRegistration('./serviceWorker.js')
//   .then(reg => console.log('[serviceWorkerRegistration] Active ->', reg))
//   .catch(err => console.log('[serviceWorkerRegistration] Error ->', err));

wakeLock('screen')
  .then(() => console.log('[wakeLock] Active'))
  .catch(err => console.log('[wakeLock] Error ->', err));
