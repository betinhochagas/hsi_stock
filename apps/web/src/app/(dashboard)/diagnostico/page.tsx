'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DiagnosticoPage() {
  const [status, setStatus] = useState<any>({})
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const diagnostico = {
      temToken: !!token,
      tokenPreview: token ? token.substring(0, 50) + '...' : null,
      apiUrl: process.env.NEXT_PUBLIC_API_URL,
      timestamp: new Date().toISOString()
    }
    
    setStatus(diagnostico)
    
    // Testar API se tiver token
    if (token) {
      fetch('http://localhost:3001/api/v1/movements', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(data => {
          setStatus((s: any) => ({ ...s, apiResponse: data, apiStatus: 'OK' }))
        })
        .catch(err => {
          setStatus((s: any) => ({ ...s, apiError: err.message, apiStatus: 'ERRO' }))
        })
    }
  }, [])

  const fazerLogin = () => {
    router.push('/login')
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🔍 Diagnóstico do Sistema</h1>
      
      <div className="space-y-4">
        <div className={`border p-4 rounded ${status.temToken ? 'bg-green-50' : 'bg-red-50'}`}>
          <h2 className="font-bold text-lg mb-2">
            {status.temToken ? '✓ Autenticado' : '✗ NÃO Autenticado'}
          </h2>
          <div className="text-sm space-y-1">
            <div>Token no localStorage: {status.temToken ? 'SIM' : 'NÃO'}</div>
            {status.tokenPreview && <div className="font-mono text-xs">{status.tokenPreview}</div>}
          </div>
        </div>

        {status.apiStatus && (
          <div className={`border p-4 rounded ${status.apiStatus === 'OK' ? 'bg-green-50' : 'bg-yellow-50'}`}>
            <h2 className="font-bold text-lg mb-2">API: {status.apiStatus}</h2>
            {status.apiResponse && (
              <div className="text-sm">
                <div>Movimentações encontradas: {status.apiResponse.data?.length || 0}</div>
                <div>Total: {status.apiResponse.pagination?.total || 0}</div>
              </div>
            )}
            {status.apiError && (
              <div className="text-sm text-red-600">Erro: {status.apiError}</div>
            )}
          </div>
        )}

        {!status.temToken && (
          <div className="bg-blue-50 border border-blue-200 p-6 rounded">
            <h3 className="font-bold text-lg mb-2">⚠️ Ação Necessária</h3>
            <p className="mb-4">
              Você precisa fazer login para acessar o sistema.
            </p>
            <button
              onClick={fazerLogin}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Ir para Login
            </button>
            <div className="mt-4 text-sm text-gray-600">
              <div>Email: admin@hsi.local</div>
              <div>Senha: admin123</div>
            </div>
          </div>
        )}

        {status.temToken && status.apiResponse && status.apiResponse.data?.length > 0 && (
          <div className="bg-green-50 border border-green-200 p-6 rounded">
            <h3 className="font-bold text-lg mb-2">✓ Sistema Funcionando</h3>
            <p className="mb-4">
              {status.apiResponse.data.length} movimentação(ões) encontrada(s)!
            </p>
            <button
              onClick={() => router.push('/movements')}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Ver Movimentações
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded text-xs font-mono">
        <pre>{JSON.stringify(status, null, 2)}</pre>
      </div>
    </div>
  )
}
