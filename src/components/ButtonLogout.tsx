'use client'
import { useRouter } from 'next/navigation'
import { SignOut } from 'phosphor-react'
import { signOut } from 'next-auth/react'

export default function ButtonLogout() {
  const router = useRouter()
  async function SignInOut() {
    await signOut({
      redirect: false,
    })

    router.push('/')
  }

  return (
    <div className="flex flex-row">
      <div>
        <button onClick={SignInOut} className="flex items-center w-80">
          <SignOut size={32} />
          <span className="ml-2">Sair</span>
        </button>
      </div>
    </div>
  )
}
