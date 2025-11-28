'use client'

import { useEffect, useState } from 'react'
import { useMovements } from '@/hooks/use-movements'

export default function MovementsTestPage() {
  const [manualData, setManualData] = useState<any>(null)
  const [manualError, setManualError] = useState<any>(null)
  
  // Testar com React Query
  const { data: queryData, isLoading, error: queryError, isError } = useMovements()

  // Testar com fetch direto
  useEffect(() => {
    async function testFetch() {
      try {
        const token = localStorage.getItem('token')
        console.log('[MANUAL TEST] Token:', token ? 'EXISTS' : 'NULL')
        
        if (!token) {
          setManualError('No token in localStorage')
          return
        }

        const response = await fetch('http://localhost:3001/api/v1/movements', {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        const data = await response.json()
        setManualData(data)
      } catch (err: any) {
        console.error('[MANUAL TEST] Error:', err)
        setManualError(err.message)
      }
    }

    testFetch()
  }, [])

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Debug: Movimentações</h1>
      
      <div className="border p-4 rounded">
        <h2 className="font-bold mb-2">React Query (useMovements):</h2>
        <div>isLoading: {String(isLoading)}</div>
        <div>isError: {String(isError)}</div>
        <div>error: {queryError?.message || 'null'}</div>
        <div>data: {queryData ? JSON.stringify(queryData) : 'null'}</div>
        <div>items length: {queryData?.items?.length ?? 'null'}</div>
      </div>

      <div className="border p-4 rounded">
        <h2 className="font-bold mb-2">Fetch Manual:</h2>
        <div>Error: {manualError || 'null'}</div>
        <div>Data: {manualData ? JSON.stringify(manualData, null, 2) : 'null'}</div>
      </div>
    </div>
  )
}
