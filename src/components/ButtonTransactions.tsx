'use client'
import { Money } from 'phosphor-react'
import Link from 'next/link'

export default function ButtonTransactions() {
  return (
    <div className="flex flex-row">
      <div>
        <Link href="/transanctions-pix">
          <button className=" flex items-center w-80">
            <Money size={32} />
            <span className="ml-2">Transações</span>
          </button>
        </Link>
      </div>
    </div>
  )
}
