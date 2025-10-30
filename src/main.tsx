import React from 'react';
import ReactDOM from 'react-dom/client';
import { configureAmplify } from './amplify/initAmplify';
import './styles.css';
import App from './App';

await configureAmplify();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);


