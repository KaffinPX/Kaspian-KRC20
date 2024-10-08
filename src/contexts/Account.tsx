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
  const { indexer } = useIndexer()
  const [ address, setAddress ] = useState<string>()
  const [ balances, setBalances ] = useState<Balances>({})

  const refresh = useCallback(async () => {
    if (!address || indexer.url === '') return setBalances({})

    const balances = (await indexer.getKRC20Balances({ address })).result

    setBalances(balances.reduce((acc: { [ticker: string]: Balance }, balance) => {
      acc[balance.tick] = balance
      return acc
    }, {}))
  }, [ address, indexer ])

  useEffect(() => {
    refresh()
  }, [ refresh, address ])

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
