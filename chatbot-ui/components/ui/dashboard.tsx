"use client"

import { FC } from "react"

interface DashboardProps {
  children: React.ReactNode
}

export const Dashboard: FC<DashboardProps> = ({ children }) => {
  return (
    <div className="flex size-full">
      <div className="relative flex w-screen min-w-[90%] grow flex-col sm:min-w-fit">
        {children}
      </div>
    </div>
  )
}
