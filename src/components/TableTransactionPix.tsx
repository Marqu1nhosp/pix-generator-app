'use client'

import { TransactionsPixContext } from '@/contexts/TransactionsPixContext'
import { useContext } from 'react'

// Função para formatar valores monetários
function formatCurrency(value: string | number): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(numValue)) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numValue)
}

export function TableTransactionPix() {
  const { transactionsPix } = useContext(TransactionsPixContext)

  if (transactionsPix.length === 0) {
    return (
      <div className="mt-6 p-8 bg-gray-800 rounded-xl border border-gray-700">
        <p className="text-gray-400 text-center">
          Nenhuma transação encontrada. Gere seu primeiro QR Code PIX!
        </p>
      </div>
    )
  }

  return (
    <div className="mt-6 overflow-hidden rounded-xl border bg-gray-800 shadow max-w-4xl w-full">
      <table className="min-w-full border-collapse">
        <thead className="hidden lg:table-header-group bg-gray-700">
          <tr>
            <th className="py-4 text-left text-sm font-semibold text-white sm:px-6">
              Nome do cliente
            </th>
            <th className="py-4 text-left text-sm font-semibold text-white sm:px-6">
              Cidade
            </th>
            <th className="py-4 text-left text-sm font-semibold text-white sm:px-6">
              Valor
            </th>
            <th className="py-4 text-left text-sm font-semibold text-white sm:px-6">
              Descrição
            </th>
          </tr>
        </thead>

        <tbody>
          {transactionsPix.map((transaction, index) => (
            <tr
              key={index}
              className="border-b border-gray-700 last:border-0 transition hover:bg-gray-700/40"
            >
              <td className="py-4 sm:px-6 text-white font-medium">
                <span className="block">{transaction.nameClient}</span>
                <div className="mt-1 text-sm text-gray-300 lg:hidden">
                  <p>{transaction.city}</p>
                </div>
              </td>

              <td className="hidden lg:table-cell py-4 sm:px-6 text-gray-300">
                {transaction.city}
              </td>

              <td className="py-4 sm:px-6 text-white font-medium">
                <span className="text-green-400 font-semibold">
                  {formatCurrency(transaction.valuePix)}
                </span>
                <div className="mt-1 text-sm text-gray-300 lg:hidden">
                  <p>{transaction.description}</p>
                </div>
              </td>

              <td className="hidden lg:table-cell py-4 sm:px-6 text-gray-300">
                {transaction.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

