interface MenuItemProps {
  children: React.ReactNode
}

export function ItemMenuSidebar({ children }: MenuItemProps) {
  return (
    <div className="p-2.5 mt-3 flex items-center text-[#44b0f4] rounded-md px-4 duration-300 cursor-pointer hover:bg-blue-500 hover:text-white">
      {children}
    </div>
  )
}
