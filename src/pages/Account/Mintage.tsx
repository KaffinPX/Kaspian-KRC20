import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CoinsIcon } from "lucide-react"
import useAccount from "@/hooks/useAccount"
import { useEffect, useState } from "react"
import { Address, ScriptBuilder, XOnlyPublicKey, addressFromScriptPublicKey } from '@/../wasm'
import { Inscription } from 'kasplexbuilder'
import { useKaspian } from 'kprovider'
import { Label } from "@/components/ui/label"
import useIndexer from "@/hooks/useIndexer"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

function Mintage () {
  const { address } = useAccount()
  const { tokens, networkId } = useIndexer()
  const { invoke } = useKaspian()

  const [ ticker, setTicker ] = useState('')
  const [ script, setScript ] = useState<string>()
  const [ commitAddress, setCommitAddress ] = useState<string>()
  const [ commit, setCommit ] = useState<string>()

  useEffect(() => {
    if (!ticker) return setCommitAddress(undefined)

    const script = new ScriptBuilder()
    const inscription = new Inscription('mint', {
      tick: ticker
    })

    inscription.write(script, XOnlyPublicKey.fromAddress(new Address(address!)).toString())

    setScript(script.toString())
    setCommitAddress(addressFromScriptPublicKey(script.createPayToScriptHashScript(), networkId!)!.toString())
  }, [ address, ticker ])

  return (
    <Card className='w-[550px]'>
      <CardHeader>
        <CardTitle>
          Mintage
        </CardTitle>
        <CardDescription>Mint your own KRC-20 tokens by creating transactions with specific fees.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-6 items-center">
        <Label htmlFor="ticker" className='font-bold'>Ticker:</Label>
        <Select value={ticker} onValueChange={(ticker) => {
          setTicker(ticker)
        }}>
          <SelectTrigger className="col-span-5" id='ticker'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className='w-[360px]'>
            {Object.entries(tokens).map(([, token], index) => (
              <SelectItem key={index} value={token.tick}>
                {token.tick}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
      <CardFooter>
        <Button className={"gap-2"} disabled={!commitAddress || tokens[ticker].state === 'finished'} onClick={async () => {
          if (!commit) {
            const commitment = JSON.parse(await invoke('transact', [[[ commitAddress!, '0.2' ]]]))
            setCommit(commitment.id)

            toast.success('Committed token mint request succesfully!', {
              action: {
                label: 'Copy',
                onClick: () => navigator.clipboard.writeText(commitment.id)
              }
            })
          } else {
            const reveal = JSON.parse(await invoke('transact', [[], "1", [{
              address: commitAddress!,
              outpoint: commit,
              index: 0,
              signer: address!,
              script: script
            }]]))

            setCommit(undefined)

            toast.success('Revealed and completed token mint request succesfully!', { 
              action: {
                label: 'Copy',
                onClick: () => navigator.clipboard.writeText(reveal.id)
              }
            })
          }
        }}>
          <CoinsIcon /> {!commit ? 'Commit' : 'Reveal'}
        </Button>
        {ticker && (
          <p className="ml-4 text-sm">
            {(+tokens[ticker].lim / 10 ** +tokens[ticker].dec)} {ticker} to be minted.
          </p>
        )}
      </CardFooter>
    </Card>
  )  
}

export default Mintage
