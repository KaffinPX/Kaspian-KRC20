import { useContext } from "react"
import { AccountContext } from "../contexts/Account"

export default function useAccount () {
  const context = useContext(AccountContext)

  if (!context) throw new Error("Missing Account context")

  return context
}
