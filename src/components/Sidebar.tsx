import { List } from 'phosphor-react'
import ButtonGeneratorQRCODEPix from './ButtonGeneratorQRCODEPix'
import ButtonLogout from './ButtonLogout'
import ButtonTransactions from './ButtonTransactions'
import { useState, useEffect, useRef } from 'react'
import { ItemMenuSidebar } from './ItemMenuSidebar'

export function Sidebar() {
  const [visibleDropdown, setVisibleDropdown] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null) // Certifique-se de que está inicializado como HTMLDivElement

  useEffect(() => {
    const handleResize = () => {
      setVisibleDropdown(window.innerWidth >= 768)
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        event.target instanceof Node &&
        !dropdownRef.current.contains(event.target)
      ) {
        setVisibleDropdown(false)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const toggleSidebar = () => {
    setVisibleDropdown(!visibleDropdown)
  }

  return (
    <div>
      <span
        className="absolute text-[#44b0f4] text-4xl top-5 left-4 cursor-pointer"
        onClick={toggleSidebar}
      >
        <List size={36} />
      </span>

      <div
        ref={dropdownRef}
        className={`fixed top-0 bottom-0 lg:left-0 left-0 p-2 w-[17rem] text-center bg-gray-800 items-center justify-center lg:block ease-in-out duration-300 ${
          visibleDropdown ? '-translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="text-lg mt-10 font-semibold ">
          <ItemMenuSidebar>
            <ButtonGeneratorQRCODEPix />
          </ItemMenuSidebar>

          <ItemMenuSidebar>
            <ButtonTransactions />
          </ItemMenuSidebar>

          <ItemMenuSidebar>
            <ButtonLogout />
          </ItemMenuSidebar>
        </div>
      </div>
    </div>
  )
}
