import ReactDOM from 'react-dom/client'
import App from './App'
import { KaspianProvider } from 'kaspianprovider'
import { AccountProvider } from './contexts/Account'
import { ThemeProvider } from './contexts/Theme'
import { IndexerProvider } from './contexts/Indexer'
import { Toaster } from "@/components/ui/sonner"
import "./style.css"

import * as kaspa from "@/../wasm"
import wasmBinary from "../wasm/kaspa_bg.wasm?url"

kaspa.default(wasmBinary)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <KaspianProvider>
      <IndexerProvider>
        <AccountProvider>
          <App />
          <Toaster />
        </AccountProvider>
      </IndexerProvider>
    </KaspianProvider>
  </ThemeProvider>
)
