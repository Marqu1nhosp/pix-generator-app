'use client'
import { Sidebar } from '@/components/Sidebar'
import { useSession } from 'next-auth/react'
import '../../../styles/global.css'
import { api, apiUrlImage } from '@/app/api/axios'
import Image from 'next/image'
import { useContext, useEffect, useState } from 'react'
import { TransactionsPixContext } from '@/contexts/TransactionsPixContext'
import { TableTransactionPix } from '@/components/TableTransactionPix'
import { Spinner } from 'phosphor-react'
import { toast, Toaster } from 'sonner'

interface User {
  id: string
  email: string
  name: string
  profilePicture: string
}

interface TransactionsPixData {
  nameClient: string
  valuePix: string
  city: string
  description: string
}

export default function TransactionsPix() {
  const { setTransactionsPixContext } = useContext(TransactionsPixContext)
  const [transactionsPixData, setTransanctionsPixData] = useState<
    TransactionsPixData[]
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data } = useSession()
  const user: User | null = data as User | null

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return

      setIsLoading(true)
      setError(null)

      try {
        const response = await api.get(`/transactions-pix/${user?.id}`)
        const transactionsPixData = response.data
        setTransanctionsPixData(transactionsPixData)
        setTransactionsPixContext(transactionsPixData)
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          'Erro ao carregar transações. Tente novamente.'
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user?.id, setTransactionsPixContext])

  return (
    <>
      <Toaster />
      <Sidebar />
      <div className="h-screen bg-gradiente-linear-black-ofCourse flex flex-col items-center gap-5">
        <div className="flex flex-col justify-center items-center gap-3 mt-10">
          <div className="">
            <Image
              className="w-28 h-28 rounded-full bg-zinc-500"
              src={apiUrlImage.defaults.baseURL + (user?.profilePicture ?? '')}
              alt="Rounded avatar"
              priority={true}
              width={200}
              height={200}
              loading="eager"
            />
          </div>
          <div className="w-50">
            <p className="text-white text-base text-center">
              Olá, {user?.name},
            </p>
            <p className="text-white text-sm text-center">
              Bem-vindo às suas Transações Pix.
            </p>
          </div>
          {isLoading ? (
            <div className="flex flex-col items-center gap-4 mt-8">
              <Spinner size={48} className="animate-spin text-blue-500" />
              <p className="text-white text-sm">Carregando transações...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-4 mt-8 p-4 bg-red-900/20 rounded-lg border border-red-500/50">
              <p className="text-red-400 text-sm text-center">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-white bg-blue-600 hover:bg-blue-700 font-semibold rounded-xl px-4 py-2 transition-colors"
              >
                Tentar Novamente
              </button>
            </div>
          ) : (
            <TableTransactionPix />
          )}
        </div>
      </div>
    </>
  )
}
