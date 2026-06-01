'use client'

import { marcarComoPago } from '@/app/dashboard/carteira/actions'

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

  const categoria = t.categorias?.[0]?.nome
  const data = new Date(t.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
  const valor = t.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className={`w-3 h-3 rounded-full shrink-0 ${
          t.tipo === 'entrada' ? 'bg-[#16A34A]' : 'bg-[#DC2626]'
        }`} />

        <div className="min-w-0">
          <p className="text-base font-semibold text-[#111827] truncate">
            {t.descricao || categoria || '—'}
          </p>
          <p className="text-xs text-[#6B7280] mt-0.5">
            {categoria}{categoria ? ' • ' : ''}{data}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        <p className={`text-xl font-bold ${
          t.tipo === 'entrada' ? 'text-[#16A34A]' : 'text-[#DC2626]'
        }`}>
          {t.tipo === 'saida' ? '- ' : ''}{valor}
        </p>
        <button
          onClick={handleMarcar}
          className="text-xs font-medium px-3 py-1.5 rounded-lg border border-[#16A34A] text-[#16A34A] bg-white hover:bg-[#16A34A] hover:text-white transition-colors whitespace-nowrap"
        >
          {t.tipo === 'entrada' ? 'Marcar como recebido' : 'Marcar como pago'}
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

  const totalSaidas = transacoes
    .filter((t) => t.tipo === 'saida')
    .reduce((acc, t) => acc + Number(t.valor), 0)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-[#6B7280]">
          <span className="font-semibold text-[#111827]">{transacoes.length}</span>{' '}
          {transacoes.length === 1 ? 'lançamento em aberto' : 'lançamentos em aberto'}
        </p>
        {totalSaidas > 0 && (
          <p className="text-sm text-[#6B7280]">
            Despesas pendentes:{' '}
            <span className="font-semibold text-[#DC2626]">
              {totalSaidas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </p>
        )}
      </div>

      {transacoes.map((t) => (
        <ItemCarteira key={t.id} t={t} />
      ))}
    </div>
  )
}
