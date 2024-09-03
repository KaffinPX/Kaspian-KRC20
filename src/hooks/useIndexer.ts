import { useContext } from "react"
import { IndexerContext } from "../contexts/Indexer"

export default function useIndexer () {
  const context = useContext(IndexerContext)

  if (!context) throw new Error("Missing Indexer context")

  return context
}
