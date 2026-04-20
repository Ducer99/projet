import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import { GoogleOAuthProvider } from '@react-oauth/google' // ⭐ Google OAuth Provider
import App from './App.tsx'
import designSystem from './theme/designSystem'
import './styles/tokens.css' // Design tokens (CSS variables)
import './styles/emotional-palette.css' // 🌿 Emotional palette (sage, beige, lavender)
import './styles/global.css'
import './index.css'
import './i18n/config' // Configuration i18n

const GOOGLE_CLIENT_ID = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || 'no-google-oauth'}>
      <ChakraProvider theme={designSystem}>
        <App />
      </ChakraProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
