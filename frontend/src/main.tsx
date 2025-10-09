import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import App from './App.tsx'
import designSystem from './theme/designSystem'
import './styles/tokens.css' // Design tokens (CSS variables)
import './styles/emotional-palette.css' // 🌿 Emotional palette (sage, beige, lavender)
import './styles/global.css'
import './index.css'
import './i18n/config' // Configuration i18n

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider theme={designSystem}>
      <App />
    </ChakraProvider>
  </React.StrictMode>,
)
