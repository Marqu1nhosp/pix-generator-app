/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import '../styles/global.css'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { api } from '@/app/api/axios'
import { zodResolver } from '@hookform/resolvers/zod'
// import { v4 as uuid } from 'uuid'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { Eye, EyeSlash } from 'phosphor-react'
import { IMaskInput } from 'react-imask'
import { toast, Toaster } from 'sonner'
import { validateCPF } from '@/utils/cpfValidator'

// Interface representando as propriedades para Checkar cpf e e-mail
interface checkCpfEmail {
  cpf: string
  email: string
}

const MAX_FILE_SIZE = 500000
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]

// Define o esquema para o formulário de criação de usuário usando Zod
const createUserFormSchema = z.object({
  name: z
    .string()
    .nonempty('O nome é obrigatório')
    .transform((name) => {
      return name
        .trim()
        .split(' ')
        .map((word) => {
          return word[0].toLocaleUpperCase().concat(word.substring(1))
        })
        .join(' ')
    }),
  email: z
    .string()
    .nonempty('O e-mail é obrigatório')
    .email('Formato de e-mail inválido')
    .toLowerCase(),
  cpf: z
    .string()
    .min(14, 'O CPF é obrigatório')
    .refine(
      (cpf) => {
        const cleanCPF = cpf.replace(/\D/g, '')
        return validateCPF(cleanCPF)
      },
      {
        message: 'CPF inválido. Verifique os dígitos verificadores.',
      },
    ),
  password: z
    .string()
    .min(6, 'A senha precisa de no mínimo +</br> 6 caractetes'),
  profilePicture: z
    .any()
    .refine((files) => files?.length === 1, 'Foto de perfil é obrigatório.')
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      `Max file size is 5MB.`,
    )
    .refine((files) => {
      const fileType = files?.[0]?.type
      console.log('Tipo MIME do arquivo:', fileType)
      return ACCEPTED_IMAGE_TYPES.includes(fileType)
    }, '.jpg, .jpeg, .png and .webp files are accepted.'),
})

// Define o tipo TypeScript com base no esquema do Zod
type CreateUser = z.infer<typeof createUserFormSchema>

export function Register() {
  // Estado para alternar a visibilidade da senha
  const [visiblePassword, setVisiblePassword] = useState(false)

  const [messageErrorCpfEmail, setMessageErrorCpfEmail] = useState('')
  const router = useRouter()
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUser>({
    resolver: zodResolver(createUserFormSchema),
  })

  async function checkIfEmailInUse(email: string): Promise<boolean> {
    try {
      // Faz uma requisição à API para obter a lista de usuários
      const response = await api.get('users')

      // Extrai os dados de usuários da resposta da API
      const users: checkCpfEmail[] = response.data

      // Verifica se algum usuário já possui o CPF fornecido
      const isEmailInUse = users.some(
        (user: checkCpfEmail) => user.email === email,
      )

      // Retorna true se o E-mail está em uso, caso contrário, retorna false
      return isEmailInUse
    } catch (error) {
      // Em caso de erro, assume que o email não está em uso para não bloquear o cadastro
      return false
    }
  }

  async function checkIfCpfInUse(cpf: string): Promise<boolean> {
    try {
      // Faz uma requisição à API para obter a lista de usuários
      const response = await api.get('users')

      // Extrai os dados de usuários da resposta da API
      const users: checkCpfEmail[] = response.data

      // Verifica se algum usuário já possui o CPF fornecido
      const isCpfInUse = users.some((user: checkCpfEmail) => user.cpf === cpf)

      // Retorna true se o CPF está em uso, caso contrário, retorna false
      return isCpfInUse
    } catch (error) {
      // Em caso de erro, assume que o CPF não está em uso para não bloquear o cadastro
      return false
    }
  }

  // Função para lidar com a criação de usuário
  async function createUser(data: CreateUser) {
    // Extrai dados do objeto 'data'
    const { name, email, cpf, password, profilePicture } = data

    // Valida CPF antes de verificar no backend
    const cleanCPF = cpf.replace(/\D/g, '')
    if (!validateCPF(cleanCPF)) {
      setMessageErrorCpfEmail('CPF inválido. Verifique os dígitos verificadores.')
      return
    }

    try {
      // Verifica se o CPF está em uso chamando a função checkIfCpfInUse
      const isCpfInUse = await checkIfCpfInUse(cpf)
      // Verifica se o e-mail está em uso chamando a função checkIfEmailInUse
      const isEmailInUse = await checkIfEmailInUse(email)

      if (isCpfInUse && isEmailInUse) {
        // Se CPF e e-mail já estão em uso
        setMessageErrorCpfEmail(
          'Ops! Parece que já temos um cadastro com esse CPF e E-mail. ' +
            'Por favor, verifique se você já possui uma conta conosco.',
        )
        return
      } else if (isCpfInUse) {
        // Se o CPF já está em uso
        setMessageErrorCpfEmail(
          'Este CPF já está vinculado a uma conta existente.',
        )
        return
      } else if (isEmailInUse) {
        // Se o e-mail já está em uso
        setMessageErrorCpfEmail(
          'Este E-mail já está vinculado a uma conta existente.',
        )
        return
      }

      // Se passou todas as validações, cria o usuário
      // Faz uma requisição à API para criar um novo usuário
      await api.post('users', {
        name,
        email,
        cpf: cleanCPF,
        password,
      })

      // Upload da foto de perfil
      const formData = new FormData()
      formData.append('profilePicture', profilePicture[0])

      await api.post('/users/upload-profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      // Configura mensagens de sucesso e redirecionamento
      toast.success(
        'Usuário criado com sucesso! Você será redirecionado para a página de login em instantes.',
      )

      // Redireciona para a página de login após 2 segundos
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (error: any) {
      // Trata erros ao criar usuário ou verificar CPF/Email
      const errorMessage =
        error?.response?.data?.message ||
        'Erro ao criar usuário. Verifique sua conexão e tente novamente.'
      toast.error(errorMessage)
      setMessageErrorCpfEmail(errorMessage)
    }
  }

  return (
    <main className="h-screen bg-gradiente-linear-black-ofCourse flex flex-col items-center justify-center gap-5">
      <div className="flex flex-col gap-9 bg-[#000000] w-full max-w-md p-20 rounded-xl items-center justify-center">
        <div className="mr-3">
          <h1 className="text-white text-3xl ">Faça seu registro</h1>
        </div>
        <div>
          <form
            action=""
            onSubmit={handleSubmit(createUser)}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1">
              <label htmlFor="" className="text-white">
                Nome
              </label>

              <input
                type="text"
                className="rounded-xl h-9 w-56 shadow-sm"
                {...register('name')}
              />

              {errors.name && (
                <span className="text-red-600 text-sm">
                  {errors.name.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="" className="text-white">
                E-mail
              </label>
              <input
                type="text"
                className="rounded-xl h-9 w-56 shadow-sm"
                {...register('email')}
              />
              {errors.email && (
                <span className="text-red-600 text-sm">
                  {errors.email.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="" className="text-white">
                CPF
              </label>
              <Controller
                control={control}
                name="cpf"
                rules={{ required: true }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <IMaskInput
                    onAccept={(value) => onChange(value)}
                    onBlur={onBlur}
                    value={value}
                    mask="000.000.000-00"
                    className="rounded-xl h-9 w-56 shadow-sm"
                  />
                )}
              />
              {errors.cpf && (
                <span className="text-red-600 text-sm">
                  O CPF é obrigatório
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-white">Escolha uma foto de perfil</label>
              <input
                className="m-0 block w-56 h-9 flex-auto cursor-pointer rounded-xl border border-solid border-neutral-300 bg-clip-padding px-3 py-[0.60rem] text-xs font-normal text-white transition duration-300 ease-in-out file:-mx-4 file:-my-[1rem] file:cursor-pointer file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-neutral-100 file:px-3 file:py-[0.6rem] file:text-black file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] hover:file:bg-neutral-200 focus:border-primary focus:text-neutral-700 focus:shadow-te-primary focus:outline-none dark:border-neutral-600 dark:text-neutral-200 dark:file:bg-neutral-700 dark:file:text-neutral-100 dark:focus:border-primary"
                type="file"
                {...register('profilePicture')}
              />
              <p
                className="mt-1 text-sm text-gray-400 dark:text-gray-300"
                id="file_input_help"
              >
                JPEG, PNG, JPG (MAX. 5MB).
              </p>
              {errors.profilePicture && (
                <span className="text-red-600 text-sm">
                  Foto de perfil é obrigatório
                </span>
              )}
            </div>

            <div className="flex flex-col relative">
              <label htmlFor="" className="text-white">
                Senha
              </label>
              <div className="relative flex items-center">
                <input
                  type={visiblePassword ? 'text' : 'password'}
                  className="rounded-xl h-9 w-56 shadow-sm pr-10 pl-2"
                  {...register('password')}
                />
                <button
                  type="button"
                  className="text-black absolute ml-[12.5rem]"
                  onClick={() => setVisiblePassword(!visiblePassword)}
                >
                  {visiblePassword ? <Eye /> : <EyeSlash />}
                </button>
              </div>
              {errors.password && (
                <span className="text-red-600 text-sm">
                  A senha precisa de no mínimo 6 caractetes
                </span>
              )}
            </div>

            <span className="text-red-600 text-sm text-justify w-60">
              {messageErrorCpfEmail}
            </span>

            <button
              type="submit"
              className="text-white bg-green-600 hover:bg-green-800 font-semibold rounded-xl h-9 w-56 "
            >
              Criar conta
            </button>
            <Toaster richColors />
            <div>
              <Link href="/" className="text-[#9CA3AF] text-xs mr-14">
                Já tem uma conta? fazer Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}

export default Register
