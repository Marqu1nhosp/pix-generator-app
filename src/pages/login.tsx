/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
// import { AuthContext } from '@/contexts/AuthContext'
// import { useContext } from 'react'
import '../styles/global.css'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { getSession, signIn, useSession } from 'next-auth/react'
import { redirect, useRouter } from 'next/navigation'

import { useEffect, useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { Eye, EyeSlash } from 'phosphor-react'
import { Button } from '@/components/Button'

const signInFormSchema = z.object({
  email: z
    .string()
    .nonempty('O e-mail é obrigatório')
    .email('Formato de e-mail inválido')
    .toLowerCase(),
  password: z.string().min(6, 'A senha precisa de no mínimo 6 caractetes'),
})

type UserSignIn = z.infer<typeof signInFormSchema>

export function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserSignIn>({ resolver: zodResolver(signInFormSchema) })
  const [visiblePassword, setVisiblePassword] = useState(false)
  const [errorCredentials, setErrorCredentials] = useState<string | null>(null)
  const router = useRouter()

  const { data: session } = useSession()

  // useEffect para verificar a sessão e redirecionar se necessário
  useEffect(() => {
    if (session) {
      redirect('/pix-generator')
    }
  }, [session])

  async function handleSignIn(data: UserSignIn) {
    const { email, password } = data

    try {
      // Tenta fazer a autenticação
      await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      // Obtém informações do usuário após autenticação
      const updatedSession = await getSession()

      // Verifica se a autenticação foi bem-sucedida
      if (updatedSession) {
        // Se sim, redireciona para a próxima página
        router.push('/pix-generator')
      } else {
        // Credenciais inválidas
        setErrorCredentials(
          'Credenciais inválidas. Verifique seu e-mail e senha.',
        )
      }
    } catch (error: any) {
      // Lida com erros de autenticação
      const errorMessage =
        error?.message ||
        'Erro ao fazer login. Verifique sua conexão e tente novamente.'
      setErrorCredentials(errorMessage)
    }
  }

  return (
    <main className="h-screen bg-gradiente-linear-black-ofCourse flex flex-col items-center justify-center gap-5">
      <div className="flex flex-col gap-9 bg-[#000000] w-full max-w-md p-20 rounded-xl items-center justify-center">
        <div className="mr-3">
          <h1 className="text-white text-3xl ">Faça seu login</h1>
        </div>
        <div>
          <form
            action=""
            onSubmit={handleSubmit(handleSignIn)}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1">
              <label htmlFor="" className="text-white">
                Email
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
            <div className="flex flex-col gap-1 relative">
              <label htmlFor="" className="text-white">
                Senha
              </label>
              <div className="relative">
                <input
                  type={visiblePassword ? 'text' : 'password'}
                  className="rounded-xl h-9 w-56 pr-10 pl-2 shadow-sm"
                  {...register('password')}
                />
                <div className="w-52">
                  {errors.password && (
                    <span className="text-red-600 text-sm">
                      {errors.password.message}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className="text-black absolute top-1/2 transform -translate-y-1/2 right-2 "
                  onClick={() => setVisiblePassword(!visiblePassword)}
                >
                  {visiblePassword ? <Eye /> : <EyeSlash />}
                </button>
              </div>
              <div className="w-56">
                <span className="text-red-600 text-sm">{errorCredentials}</span>
              </div>
            </div>
            <div>
              <a href="" className="text-[#9CA3AF] text-xs mr-14">
                Esqueceu a senha?
              </a>
            </div>

            <Button name="Entrar" type="submit" />

            <div>
              <Link href="/register" className="text-[#9CA3AF] text-xs">
                Ainda não tem uma conta? Crie uma
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}

export default Login
