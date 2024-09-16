import { Indexer } from "kasplexbuilder"
import { createContext, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { Token } from "kasplexbuilder/src/indexer/protocol"

type Tokens = {[ ticker: string ]: Token}
export const IndexerContext = createContext<{
  tokens: Tokens
  networkId: string | undefined
  setNetworkId: (address: string) => void
  indexer: Indexer
} | undefined>(undefined)

export function IndexerProvider ({ children }: {
  children: ReactNode
}) {
  const [ networkId, setNetworkId ] = useState<string>()
  const [ tokens, setTokens ] = useState<Tokens>({})
    
  const indexer = useMemo(() => {
    const indexer = new Indexer('')

    if (networkId === 'mainnet') {
      indexer.url = 'https://api.kasplex.org'
    } else if (networkId === 'testnet-10') {
      indexer.url = 'https://tn10api.kasplex.org'
    }

    return indexer
  }, [ networkId ])

  const refresh = useCallback(async () => {
    let tokens: Token[] = []
    let cursor = undefined
  
    while (true) {
      const response = await indexer.getKRC20TokenList({ next: cursor })

      tokens.push(...response.result)
  
      if (response.result.length < 50) break
      cursor = response.next
    }
  
    setTokens(tokens.reduce((acc: {[ ticker: string ]: Token}, token) => {
      acc[token.tick] = token
      return acc
    }, {}))
  }, [ indexer ])

  useEffect(() => {
    setTokens({})
    refresh()
  }, [ indexer, refresh ])

  return (
    <IndexerContext.Provider value={{ networkId, setNetworkId, indexer, tokens }}>
      {children}
    </IndexerContext.Provider>
  )
}
