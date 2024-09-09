import Tokens from "./Account/Tokens"
import Mintage from "./Account/Mintage"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

function Account () {
  return (
    <Tabs defaultValue="tokens" className="w-[550px]">
      <TabsList className="grid grid-cols-3 w-full">
        <TabsTrigger value="tokens">Tokens</TabsTrigger>
        <TabsTrigger value="mintage">Mintage</TabsTrigger>
        <TabsTrigger value="deployment" disabled>Deployment</TabsTrigger>
      </TabsList>
      <TabsContent value="tokens">
        <Tokens />
      </TabsContent>
      <TabsContent value="mintage">
        <Mintage />
      </TabsContent>
    </Tabs>
  )  
}

export default Account
