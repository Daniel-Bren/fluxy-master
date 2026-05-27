import { createClient } from '@/lib/supabase/server'
import NovaTransacaoModal from '@/components/transacoes/nova-transacao-modal'
import ListaCarteira from '@/components/transacoes/lista-carteira'
import SeletorMes from '@/components/seletor-mes'
import { Suspense } from 'react'

type Props = {
  searchParams: Promise<{ mes?: string }>
}

export default async function CarteiraPage({ searchParams }: Props) {
  const { mes } = await searchParams
  const supabase = await createClient()

  const ano = mes ? parseInt(mes.split('-')[0]) : new Date().getFullYear()
  const mesNum = mes ? parseInt(mes.split('-')[1]) - 1 : new Date().getMonth()

  const primeiroDia = `${ano}-${String(mesNum + 1).padStart(2, '0')}-01`
  const ultimoDia = `${ano}-${String(mesNum + 1).padStart(2, '0')}-${new Date(ano, mesNum + 1, 0).getDate()}`

  const { data: categorias } = await supabase
    .from('categorias')
    .select('id, nome, user_id')
    .order('nome')

  const { data: transacoes } = await supabase
    .from('transacoes')
    .select(`
      id,
      tipo,
      valor,
      data,
      descricao,
      status,
      recorrente,
      recorrencia_id,
      categorias (
        nome
      )
    `)
    .gte('data', primeiroDia)
    .lte('data', ultimoDia)
    .order('data', { ascending: false })

  const lista = (transacoes ?? []) as any[]
  const emAberto = lista.filter((t) => t.status === 'aberto')
  const concluidas = lista.filter((t) => t.status !== 'aberto')

  const totalAberto = emAberto
    .filter((t) => t.tipo === 'saida')
    .reduce((acc: number, t: any) => acc + Number(t.valor), 0)

  function formatarMoeda(valor: number) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Carteira</h1>
          <p className="text-[#6B7280] mt-1">
            Acompanhe o que está em aberto e o que já foi pago
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Suspense fallback={<div className="w-48 h-8 bg-gray-100 rounded-lg animate-pulse" />}>
            <SeletorMes />
          </Suspense>
          <NovaTransacaoModal categorias={categorias ?? []} />
        </div>
      </div>

      {totalAberto > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-amber-800">Total em aberto (despesas)</p>
            <p className="text-2xl font-bold text-amber-700 mt-0.5">{formatarMoeda(totalAberto)}</p>
          </div>
          <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium">
            {emAberto.filter((t: any) => t.tipo === 'saida').length} lançamento(s) pendente(s)
          </span>
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <ListaCarteira emAberto={emAberto} concluidas={concluidas} />
      </div>
    </div>
  )
}
