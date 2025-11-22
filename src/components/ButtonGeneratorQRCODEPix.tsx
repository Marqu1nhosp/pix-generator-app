'use client'
import { Table } from 'phosphor-react'
import Link from 'next/link'

export default function ButtonGeneratorQRCODEPix() {
  return (
    <div className="flex flex-row">
      <div className="">
        <Link href="/pix-generator">
          <button className="flex items-center w-80">
            <Table size={32} />
            <span className="ml-2">Gerar QRCODE</span>
          </button>
        </Link>
      </div>
    </div>
  )
}
