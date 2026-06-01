'use client'

import { marcarComoPago } from '@/app/dashboard/carteira/actions'
import { ArrowDownCircle, ArrowUpCircle, CheckCircle2 } from 'lucide-react'

type Transacao = {
  id: string
  tipo: 'entrada' | 'saida'
  valor: number
  data: string
  descricao: string | null
  categorias: { nome: string }[] | null
}

type Props = {
  transacoes: Transacao[]
}

function ItemCarteira({ t }: { t: Transacao }) {
  async function handleMarcar() {
    await marcarComoPago(t.id)
  }

  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-3">
        {t.tipo === 'entrada' ? (
          <ArrowDownCircle size={22} className="text-[#16A34A]" />
        ) : (
          <ArrowUpCircle size={22} className="text-[#DC2626]" />
        )}

        <div>
          <p className="text-sm font-medium text-[#111827]">
            {t.descricao || t.categorias?.[0]?.nome || '—'}
          </p>
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
          onClick={handleMarcar}
          title={t.tipo === 'entrada' ? 'Marcar como recebido' : 'Marcar como pago'}
          className="w-8 h-8 rounded-full flex items-center justify-center text-[#6B7280] hover:text-[#16A34A] hover:bg-green-50 transition-colors"
        >
          <CheckCircle2 size={18} />
        </button>
      </div>
    </div>
  )
}

export default function ListaCarteira({ transacoes }: Props) {
  if (transacoes.length === 0) {
    return (
      <div className="text-center py-12 text-[#6B7280] text-sm">
        Nenhum lançamento em aberto neste mês.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {transacoes.map((t) => (
        <ItemCarteira key={t.id} t={t} />
      ))}
    </div>
  )
}
