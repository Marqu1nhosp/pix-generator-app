'use client'
import { useSession } from 'next-auth/react'
import { api, apiUrlImage } from '@/app/api/axios'
import { Sidebar } from '@/components/Sidebar'
import { Toaster, toast } from 'sonner'
import { useState } from 'react'
import Image from 'next/image'
import { useForm, Controller } from 'react-hook-form'
import { Button } from '@/components/Button'
import { PIX } from 'react-qrcode-pix'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { IMaskInput } from 'react-imask'
import { Spinner } from 'phosphor-react'

import '../../../assets/qrcode-pix.png'
import '../../../styles/global.css'

// Interface representando as propriedades de um usuário
interface User {
  id: string
  email: string
  name: string
  profilePicture: string
}

// Função auxiliar para converter string monetária em número
function parseMonetaryValue(value: string): number {
  // Remove caracteres não numéricos exceto ponto e vírgula
  const cleaned = value.replace(/[^\d,.-]/g, '')
  // Substitui vírgula por ponto para parseFloat
  const normalized = cleaned.replace(',', '.')
  return parseFloat(normalized) || 0
}

// Define o esquema para o formulário de criação de usuário usando Zod
const createPixFormSchema = z.object({
  nameClient: z
    .string()
    .min(1, 'Nome do cliente é obrigatório')
    .min(3, 'Nome deve ter pelo menos 3 caracteres'),
  keyPix: z
    .string()
    .min(1, 'Chave pix é obrigatória')
    .min(5, 'Chave pix deve ter pelo menos 5 caracteres'),
  city: z
    .string()
    .min(1, 'Nome da cidade é obrigatório')
    .min(2, 'Cidade deve ter pelo menos 2 caracteres'),
  valuePix: z
    .string()
    .min(1, 'Valor do pix é obrigatório')
    .refine((val) => {
      const numericValue = parseMonetaryValue(val)
      return numericValue >= 0.01
    }, 'Valor mínimo é R$ 0,01'),
  description: z
    .string()
    .min(1, 'Descrição é obrigatória')
    .min(5, 'Descrição deve ter pelo menos 5 caracteres'),
})

// Define o tipo TypeScript com base no esquema do Zod
type CreatePix = z.infer<typeof createPixFormSchema>

export default function PixGenerator() {
  const { data } = useSession()
  const user: User | null = data as User | null
  const [isLoading, setIsLoading] = useState(false)
  const [generatedQRCode, setGeneratedQRCode] = useState(false)
  const [formData, setFormData] = useState<CreatePix>()

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreatePix>({
    resolver: zodResolver(createPixFormSchema),
  })

  async function handleGenerateQRCode(data: CreatePix) {
    const { nameClient, description, city, valuePix, keyPix } = data
    setIsLoading(true)
    setFormData(data)

    try {
      // Salva a transação no backend
      await api.post('transactions-pix', {
        nameClient,
        description,
        city,
        valuePix,
        keyPix,
        idUser: user?.id,
      })

      // Gera o QR Code imediatamente após salvar
      setGeneratedQRCode(true)
      reset()
      toast.success('QR Code PIX gerado com sucesso!')
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        'Erro ao gerar QR Code. Tente novamente.'
      toast.error(errorMessage)
      setGeneratedQRCode(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="h-screen flex flex-col items-center justify-center gap-5">
      <Toaster />
      <div>
        <Sidebar />
      </div>

      <div className="flex flex-col gap-8 bg-[#000000] p-20 rounded-xl items-center justify-center mb-6">
        <div className="flex flex-col justify-center items-center gap-3 md:mt-0 mt-[4.5rem]">
          <h1 className="mb-1 md:mb-6 text-white text-xl md:text-3xl font-bold text-center">
            Gerador de QRCODE Pix
          </h1>
          <div className="">
            <Image
              className="w-28 h-28 rounded-full bg-zinc-500"
              src={apiUrlImage.defaults.baseURL + (user?.profilePicture ?? '')}
              alt="Rounded avatar"
              priority={true}
              width={100}
              height={100}
              loading="eager"
            />
          </div>
          <div className="w-56 flex flex-col">
            <span className="text-white text-sm text-center">
              Olá, {user?.name}.
            </span>
            <span className="text-white text-sm text-center">
              Bem-vindo à sua conta.
            </span>
          </div>
        </div>
        <form
          action=""
          onSubmit={handleSubmit(handleGenerateQRCode)}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <label htmlFor="" className="text-white">
              Nome do cliente
            </label>
            <input
              type="text"
              className="rounded-xl h-9 w-56 shadow-sm"
              {...register('nameClient')}
            />
            {errors.nameClient && (
              <span className="text-red-600 text-sm">
                {errors.nameClient.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="" className="text-white">
              Chave pix
            </label>
            <input
              type="text"
              className="rounded-xl h-9 w-56 shadow-sm"
              {...register('keyPix')}
            />
            {errors.keyPix && (
              <span className="text-red-600 text-sm">
                {errors.keyPix.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="valuePix" className="text-white">
              Valor (R$)
            </label>
            <Controller
              control={control}
              name="valuePix"
              render={({ field: { onChange, onBlur, value } }) => (
                <IMaskInput
                  mask={Number}
                  radix=","
                  scale={2}
                  thousandsSeparator="."
                  padFractionalZeros={true}
                  normalizeZeros={true}
                  mapToRadix={['.']}
                  onAccept={(val) => onChange(val)}
                  onBlur={onBlur}
                  value={value || ''}
                  placeholder="0,00"
                  className="rounded-xl h-9 w-56 shadow-sm px-3"
                />
              )}
            />
            {errors.valuePix && (
              <span className="text-red-600 text-sm">
                {errors.valuePix.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="" className="text-white">
              Cidade
            </label>
            <input
              type="text"
              className="rounded-xl h-9 w-56 shadow-sm"
              {...register('city')}
            />
            {errors.city && (
              <span className="text-red-600 text-sm">
                {errors.city.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="" className="text-white">
              Descrição
            </label>
            <input
              type="text"
              className="rounded-xl h-9 w-56 shadow-sm"
              {...register('description')}
            />
            {errors.description && (
              <span className="text-red-600 text-sm">
                {errors.description.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="text-white bg-green-600 hover:bg-green-800 disabled:bg-gray-600 disabled:cursor-not-allowed font-semibold rounded-xl h-9 w-56 flex items-center justify-center gap-2 transition-colors"
          >
            {(isSubmitting || isLoading) ? (
              <>
                <Spinner size={20} className="animate-spin" />
                Gerando...
              </>
            ) : (
              'Gerar QR Code'
            )}
          </button>
        </form>
        {generatedQRCode && formData && (
          <div className="flex flex-col items-center gap-4 mt-4">
            <h2 className="text-white text-xl font-semibold">
              QR Code PIX Gerado
            </h2>
            <div className="bg-white p-4 rounded-lg">
              <PIX
                pixkey={formData.keyPix}
                merchant={formData.nameClient}
                city={formData.city}
                amount={parseMonetaryValue(formData.valuePix)}
              />
            </div>
            <p className="text-white text-sm text-center max-w-xs">
              Escaneie o código acima com o app do seu banco para realizar o
              pagamento
            </p>
            <button
              onClick={() => {
                setGeneratedQRCode(false)
                setFormData(undefined)
              }}
              className="text-white bg-gray-600 hover:bg-gray-700 font-semibold rounded-xl h-9 w-56 transition-colors"
            >
              Gerar Novo QR Code
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
