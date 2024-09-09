import { useKaspian } from 'kaspianprovider'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function Connection () {
  const { providers, connect } = useKaspian()

  return (
    <>
      <Card className='w-[550px]'>
        <CardHeader>
          <CardTitle>Connect</CardTitle>
          <CardDescription>Connect to a Kaspian-compatible wallet to use DApp.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col gap-10'>
            {providers.length === 0 ? (
              <p className="text-center text-gray-500 py-3">
                No wallets found.
              </p>
            ) : (
              providers.map((provider) => (
                <div className="flex justify-between items-center px-4 py-2 border rounded-md" key={provider.id}>
                  <span>{provider.name}</span>
                  <Button variant={"secondary"} onClick={() => connect(provider.id)}>
                    Connect
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )  
}

export default Connection
