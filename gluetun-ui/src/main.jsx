import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { getBasePath } from './utils/basePathUtils'

// Get the dynamically determined base path
const basePath = getBasePath()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={basePath}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
