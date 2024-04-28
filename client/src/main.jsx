import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './components/App.jsx'

/**
 * Main entry file for the React application. It initializes the root React component (App) 
 * inside a React root container created in the 'root' DOM element found in the index.html file.
 */

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
