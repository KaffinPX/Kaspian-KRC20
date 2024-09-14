import { useEffect, useState } from 'react'
import { CoinsIcon, SendIcon } from 'lucide-react'
import { Inscription } from 'kasplexbuilder'
import { useKaspian } from 'kaspianprovider'
import { toast } from 'sonner'
import { Address, ScriptBuilder, XOnlyPublicKey, addressFromScriptPublicKey } from '@/../wasm'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import useIndexer from '@/hooks/useIndexer'
import useAccount from '@/hooks/useAccount'

function Transfer ({ ticker }: {
  ticker: string
}) {
  const { address, balances } = useAccount()
  const { networkId } = useIndexer()
  const { invoke } = useKaspian()

  const [ recipient, setRecipient ] = useState<string>('')
  const [ amount, setAmount ] = useState<string>('')
  const [ script, setScript ] = useState<string>()
  const [ commitAddress, setCommitAddress ] = useState<string>()
  const [ commit, setCommit ] = useState<string>()

  useEffect(() => {
    if (commitAddress) setCommitAddress(undefined)

    if (!address || recipient === '' || amount === '') return
    if (!Address.validate(recipient)) return

    const script = new ScriptBuilder()
    const inscription = new Inscription('transfer', {
      tick: ticker,
      amt: BigInt(Number(amount) * 1e8).toString(),
      to: recipient.toString()
    })

    inscription.write(script, XOnlyPublicKey.fromAddress(new Address(address!)).toString())

    setScript(script.toString())
    setCommitAddress(addressFromScriptPublicKey(script.createPayToScriptHashScript(), networkId!)!.toString())
  }, [ address, recipient, amount ])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"ghost"} size={"icon"}>
          <SendIcon />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer</DialogTitle>
          <DialogDescription className='flex flex-col text-center'>
            <span className="text-base font-bold">{+balances[ticker].balance / 10 ** +balances[ticker].dec} {ticker}</span>
            <span className="font-light text-xs">Available</span>
          </DialogDescription>
          <div className={"mx-auto w-80 gap-2 flex flex-col"}>
            <Input
              placeholder={'Recipient'}
              value={recipient}
              onChange={(e) => { setRecipient(e.target.value) }}
              disabled={!!commit}
            />
            <Input
              placeholder={'Amount'}
              type={'number'}
              min={0}
              value={amount}
              onChange={(e) => { setAmount(e.target.value) }}
              disabled={!!commit}
            />
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button className={"gap-2"} disabled={!commitAddress} onClick={async () => {
            if (!commit) {
              invoke('transact', [[[ commitAddress!, '0.2' ]]]).then(commitment => {
                const transaction = JSON.parse(commitment)
                setCommit(transaction.id)

                toast.success('Committed token transfer request succesfully!', {
                  action: {
                    label: 'Copy',
                    onClick: () => navigator.clipboard.writeText(transaction.id)
                  }
                })
              }).catch((message) => {
                toast.error(`Oops! Something went wrong with your wallet: ${message}`)
              })
            } else {
              invoke('transact', [[], "0.01", [{
                address: commitAddress!,
                outpoint: commit,
                index: 0,
                signer: address!,
                script: script
              }]]).then((reveal) => {
                const transaction = JSON.parse(reveal)
                setRecipient('')
                setAmount('')
                setCommit(undefined)

                toast.success('Revealed and completed token transfer request succesfully!', { 
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )  
}

export default Transfer
