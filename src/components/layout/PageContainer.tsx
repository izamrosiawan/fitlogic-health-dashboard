"use client"

import React from 'react'
import { motion } from 'framer-motion'

interface PageContainerProps {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
}

export function PageContainer({ title, description, action, children }: PageContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col space-y-6 p-4 md:p-8 max-w-7xl mx-auto w-full"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl text-foreground">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground font-medium">
              {description}
            </p>
          )}
        </div>
        {action && <div className="flex items-center space-x-3">{action}</div>}
      </div>
      <div className="w-full">
        {children}
      </div>
    </motion.div>
  )
}
