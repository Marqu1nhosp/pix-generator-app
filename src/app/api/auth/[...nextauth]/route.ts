/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { api } from '../../axios'
import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

interface User {
  id: string
  name: string
  email: string
  phone: string
  cpf: string
  password: string
  profilePicture: string
}

const nextAuthOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'email', type: 'text' },
        password: { label: 'password', type: 'password' },
      },

      async authorize(credentials, req) {
        const email = credentials?.email
        const password = credentials?.password

        const response = await api.get('users')

        // Procura um usuário com o nome de usuário fornecido nas credenciais
        const user = response.data.find(
          (u: User) => u.email === email && u.password === password,
        )
        // console.log(user)
        // Se encontrarmos um usuário, retornamos suas informações
        if (user) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
          }
        }

        // Retorna null se os dados do usuário não puderem ser recuperados
        return null
      },
    }),
  ],
  pages: {
    signIn: '/',
  },
  callbacks: {
    async jwt({ token, user }) {
      user && (token.user = user)
      return token
    },

    async session({ session, token }) {
      session = token.user as any
      return session
    },
  },
}

const handler = NextAuth(nextAuthOptions)

export { handler as GET, handler as POST, nextAuthOptions }
