
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Set the API key from user input to be used by the application
// @ts-ignore
process.env.API_KEY = "AIzaSyDWOnwe630WTd8L_J2_X_IdmX0YSEvZnX0";

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Elemento root não encontrado");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);