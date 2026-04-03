import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import { store } from './services/store/Store.js'
import { BrowserRouter } from 'react-router'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { attachAxiosStore } from './services/axiosClient.js'

attachAxiosStore(store);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <Provider store = {store}>
    <ThemeProvider>
    <App />
    </ThemeProvider>
    </Provider>
    </BrowserRouter>
  </StrictMode>,
)
