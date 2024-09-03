import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCcwIcon } from "lucide-react"
import Transfer from "./Tokens/Transact"
import useAccount from "@/hooks/useAccount"

function Tokens () {
  const { balances, refresh } = useAccount()

  return (
    <Card className='w-[550px]'>
      <CardHeader>
        <CardTitle>
          Tokens
          <Button className="h-min w-min ml-2" variant={"ghost"} size={"icon"} onClick={({ currentTarget }) => {
            currentTarget.disabled = true

            refresh().then(() => {
              currentTarget.disabled = false
            })
          }}>
            <RefreshCcwIcon size={16} />
          </Button>
        </CardTitle>
        <CardDescription>Manage and track your KRC-20 tokens effortlessly in this section.</CardDescription>
      </CardHeader>
      <CardContent className="h-[544px] overflow-y-auto scrollbar-hidden">
        {Object.entries(balances).length === 0 ? (
          <p className="text-center text-gray-500 py-3">
            No tokens found.
          </p>
        ) : (
          Object.entries(balances).map(([ticker, { balance, dec }], index) => (
            <div key={index} className="border rounded-md mb-2">
              <div className="flex justify-between items-center px-4 py-2">
                <span className="text-xl font-semibold">{+balance / 10 ** +dec} {ticker}</span>
                <Transfer ticker={ticker} />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )  
}

export default Tokens
