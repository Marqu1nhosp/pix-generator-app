'use client'
import { ReactNode, createContext, useState } from 'react'

interface TransactionsPix {
  nameClient: string
  valuePix: string
  city: string
  description: string
}

interface TransactionsPixContextType {
  transactionsPix: TransactionsPix[]
  setTransactionsPixContext: React.Dispatch<
    React.SetStateAction<TransactionsPix[]>
  >
}

interface TransactionsPixProviderProps {
  children: ReactNode
}

export const TransactionsPixContext = createContext(
  {} as TransactionsPixContextType,
)

export function TransactionsPixProvider({
  children,
}: TransactionsPixProviderProps) {
  const [transactionsPixContext, setTransactionsPixContext] = useState<
    TransactionsPix[]
  >([])

  return (
    <TransactionsPixContext.Provider
      value={{
        transactionsPix: transactionsPixContext,
        setTransactionsPixContext,
      }}
    >
      {children}
    </TransactionsPixContext.Provider>
  )
}
