import { Indexer } from "kasplexbuilder"
import { createContext, ReactNode, useCallback, useEffect, useRef, useState } from "react"
import type { Token } from "kasplexbuilder/src/indexer/protocol"

type Tokens = {[ ticker: string ]: Token}
export const IndexerContext = createContext<{
  tokens: Tokens
  networkId: string | undefined
  setNetworkId: (address: string) => void
  indexer: React.MutableRefObject<Indexer>
} | undefined>(undefined)

export function IndexerProvider ({ children }: {
  children: ReactNode
}) {
  const indexer = useRef(new Indexer(''))
  const [ networkId, setNetworkId ] = useState<string>()
  const [ tokens, setTokens ] = useState<Tokens>({})
    
  const refresh = useCallback(async () => {
    if (indexer.current.url === '') return

    let tokens: Token[] = []
    let cursor = undefined
  
    while (true) {
      const response = await indexer.current.getKRC20TokenList({ next: cursor })

      tokens.push(...response.result)
  
      if (response.result.length < 50) break
      cursor = response.next
    }
  
    setTokens(tokens.reduce((acc: {[ ticker: string ]: Token}, token) => {
      acc[token.tick] = token
      return acc
    }, {}))
  }, [])
  
  useEffect(() => {
    if (networkId === 'testnet-10') {
      indexer.current.url = 'https://tn10api.kasplex.org'
    } else {
      indexer.current.url = ''
    }

    refresh()
  }, [ networkId ])

  return (
    <IndexerContext.Provider value={{ networkId, setNetworkId, indexer, tokens }}>
      {children}
    </IndexerContext.Provider>
  )
}
