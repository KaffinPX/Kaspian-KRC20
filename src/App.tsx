import { useEffect } from 'react'
import { CopyIcon, Moon, Sun } from 'lucide-react'
import { useKaspian } from 'kaspianprovider'
import { toast } from 'sonner'
import Connect from './pages/Connection'
import Account from './pages/Account'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from './components/ui/button'
import { useTheme } from './hooks/useTheme'
import useIndexer from './hooks/useIndexer'
import useAccount from './hooks/useAccount'

function App() {
  const { account } = useKaspian()
  const { setNetworkId, networkId } = useIndexer()
  const { address, setAddress } = useAccount()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    if (account) {
      if (networkId !== account.networkId) {
        setNetworkId(account.networkId)
        setAddress(account.addresses[0])
      }
      if (!address) setAddress(account.addresses[0])
    }
  }, [ account ])

  return (
    <>
      <div className="flex justify-between my-6">
        <div className="flex gap-2 mx-8">
          <p className="text-3xl">Kaspian | KRC20</p>
          <Button size={"icon"} variant={"ghost"} onClick={() => {
            setTheme(theme === 'light' ? 'dark' : 'light')
          }}>
            {theme === 'light' ? <Sun /> : <Moon />}
          </Button>
        </div>
        <div className='flex bg-card rounded-md gap-1 px-1'>
          <Select value={address} disabled={!account?.addresses} onValueChange={(address) => {
            setAddress(address)
          }}>
            <SelectTrigger className="w-[160px] border-0">
              <SelectValue placeholder="Select an address" />
            </SelectTrigger>
            <SelectContent className='w-[360px]'>
            {account && account.addresses.map((address, index) => (
              <SelectItem key={index} value={address}>
                {address}
              </SelectItem>
            ))}
            </SelectContent>
          </Select>
          <Button size={"icon"} variant={"ghost"} disabled={!address} onClick={() => {
            navigator.clipboard.writeText(address!)

            toast.success('Address copied into clipboard.')
          }}>
            <CopyIcon size={20} />
          </Button>
        </div>
      </div>
      {!account && (
        <Connect />
      )}
      {account && (
        <Account />
      )}
      <p className="w-[460px] fixed bottom-0 mb-6 text-xs font-thin">
        As with all early-stage products there are risks associated with using the protocol and users assume the full responsibility for these risks. You should not deposit any money you are not comfortable losing.
      </p>
    </>
  )  
}

export default App
