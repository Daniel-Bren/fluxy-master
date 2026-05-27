'use client'

import { alternarStatus } from '@/app/dashboard/transacoes/actions'
import { ArrowDownCircle, ArrowUpCircle, CheckCircle2, RotateCcw, RefreshCw } from 'lucide-react'

type Transacao = {
  id: string
  tipo: 'entrada' | 'saida'
  valor: number
  data: string
  descricao: string | null
  status: string
  recorrente: boolean
  recorrencia_id: string | null
  categorias: { nome: string }[] | null
}

type Props = {
  emAberto: Transacao[]
  concluidas: Transacao[]
}

function ItemTransacao({ t }: { t: Transacao }) {
  async function handleAlternar() {
    await alternarStatus(t.id, t.status)
  }

  const isPago = t.status === 'pago'

  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-3">
        {t.tipo === 'entrada' ? (
          <ArrowDownCircle size={22} className="text-[#16A34A]" />
        ) : (
          <ArrowUpCircle size={22} className="text-[#DC2626]" />
        )}

        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-[#111827]">
              {t.descricao || t.categorias?.[0]?.nome || '—'}
            </p>
            {t.recorrente && (
              <span className="flex items-center gap-1 text-xs text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-full">
                <RefreshCw size={10} />
                Recorrente
              </span>
            )}
          </div>
          <p className="text-xs text-[#6B7280]">
            {t.categorias?.[0]?.nome} •{' '}
            {new Date(t.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className={`text-sm font-semibold ${t.tipo === 'entrada' ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
          {t.tipo === 'saida' ? '- ' : ''}
          {t.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </span>

        <button
          onClick={handleAlternar}
          title={isPago ? 'Reabrir lançamento' : 'Marcar como pago/recebido'}
          className={`transition-colors ${
            isPago
              ? 'text-[#16A34A] hover:text-amber-500'
              : 'text-[#6B7280] hover:text-[#16A34A]'
          }`}
        >
          {isPago ? <RotateCcw size={16} /> : <CheckCircle2 size={16} />}
        </button>
      </div>
    </div>
  )
}

export default function ListaCarteira({ emAberto, concluidas }: Props) {
  const nenhumLancamento = emAberto.length === 0 && concluidas.length === 0

  if (nenhumLancamento) {
    return (
      <div className="text-center py-12 text-[#6B7280] text-sm">
        Nenhuma transação neste mês. Adicione a primeira!
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {emAberto.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold text-amber-600">Em aberto</span>
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              {emAberto.length}
            </span>
          </div>
          <div className="space-y-3">
            {emAberto.map((t) => <ItemTransacao key={t.id} t={t} />)}
          </div>
        </div>
      )}

      {concluidas.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold text-[#16A34A]">Concluídas</span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              {concluidas.length}
            </span>
          </div>
          <div className="space-y-3">
            {concluidas.map((t) => <ItemTransacao key={t.id} t={t} />)}
          </div>
        </div>
      )}
    </div>
  )
}
