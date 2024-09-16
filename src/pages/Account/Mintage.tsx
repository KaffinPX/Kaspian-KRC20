import { useEffect, useState } from "react"
import { CoinsIcon } from "lucide-react"
import { Inscription } from 'kasplexbuilder'
import { useKaspian } from 'kaspianprovider'
import { toast } from "sonner"
import { Address, ScriptBuilder, XOnlyPublicKey, addressFromScriptPublicKey } from '@/../wasm'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import useIndexer from "@/hooks/useIndexer"
import useAccount from "@/hooks/useAccount"

function Mintage () {
  const { address } = useAccount()
  const { tokens, networkId } = useIndexer()
  const { invoke } = useKaspian()

  const [ ticker, setTicker ] = useState<string>()
  const [ script, setScript ] = useState<string>()
  const [ commitAddress, setCommitAddress ] = useState<string>()
  const [ commit, setCommit ] = useState<string>()

  useEffect(() => {
    if (commitAddress) setCommitAddress(undefined)

    if (!ticker) return
    if (tokens[ticker]?.state === 'finished') {
      toast.error(`${ticker} token minting is no longer available as it has been completed.`)
      return
    }

    const script = new ScriptBuilder()
    const inscription = new Inscription('mint', {
      tick: ticker
    })

    inscription.write(script, XOnlyPublicKey.fromAddress(new Address(address!)).toString())

    const scriptAddress = addressFromScriptPublicKey(script.createPayToScriptHashScript(), networkId!)!.toString()
    const commitment = localStorage.getItem(scriptAddress)
  
    setScript(script.toString())
    if (commitment) setCommit(commitment)
    setCommitAddress(scriptAddress)
  }, [ address, ticker ])
  
  useEffect(() => {
    setTicker(undefined)
  }, [ networkId ])

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
        <Select value={ticker} disabled={Object.keys(tokens).length === 0 || !!commit} onValueChange={(ticker) => {
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
        <Button className={"gap-2"} disabled={!commitAddress} onClick={async () => {
          if (!commit) {
            invoke('transact', [[[ commitAddress!, '0.2' ]]]).then(commitment => {
              const transaction = JSON.parse(commitment)

              setCommit(transaction.id)
              localStorage.setItem(commitAddress!, transaction.id)

              toast.success('Committed token mint request succesfully!', {
                action: {
                  label: 'Copy',
                  onClick: () => navigator.clipboard.writeText(transaction.id)
                }
              })
            }).catch((message) => {
              toast.error(`Oops! Something went wrong with your wallet: ${message}`)
            })
          } else {
            invoke('transact', [[], "1", [{
              address: commitAddress!,
              outpoint: commit,
              index: 0,
              signer: address!,
              script: script
            }]]).then((reveal) => {
              const transaction = JSON.parse(reveal)

              setCommit(undefined)
              localStorage.removeItem(commitAddress!)

              toast.success('Revealed and completed token mint request succesfully!', { 
                action: {
                  label: 'Copy',
                  onClick: () => navigator.clipboard.writeText(transaction.id)
                }
              })
            }).catch((message) => {
              toast.error(`Oops! Something went wrong with your wallet: ${message}`)
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
