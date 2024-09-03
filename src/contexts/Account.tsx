import useIndexer from "@/hooks/useIndexer"
import type { Balance } from "kasplexbuilder/src/indexer/protocol"
import { createContext, ReactNode, useCallback, useEffect, useState } from "react"

type Balances = {[ ticker: string ]: Balance}

export const AccountContext = createContext<{
  address: string | undefined
  setAddress: (address: string) => void
  balances: Balances
  refresh: () => Promise<void>
} | undefined>(undefined)

export function AccountProvider ({ children }: {
  children: ReactNode
}) {
  const { indexer, tokens } = useIndexer()
  const [ address, setAddress ] = useState<string>()
  const [ balances, setBalances ] = useState<Balances>({}) // TBD: use useOptimistic for balances

  const refresh = useCallback(async () => {
    if (!address || indexer.current.url === '') return console.log('rtrned', address, indexer.current.url)

    const balances = (await indexer.current.getKRC20Balances({ address })).result

    setBalances(balances.reduce((acc: { [ticker: string]: Balance }, balance) => {
      acc[balance.tick] = balance
      return acc
    }, {}))
  }, [ address ])

  useEffect(() => {
    refresh()
  }, [ address, refresh, tokens ])

  return (
    <AccountContext.Provider value={{ 
      address,
      setAddress, 
      balances,
      refresh 
    }}>
      {children}
    </AccountContext.Provider>
  )
}
