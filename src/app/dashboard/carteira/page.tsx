import { createClient } from '@/lib/supabase/server'
import NovaTransacaoModal from '@/components/transacoes/nova-transacao-modal'
import ListaCarteira from '@/components/carteira/lista-carteira'
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
      categoria_id,
      recorrencia_id,
      categorias (
        nome
      )
    `)
    .eq('status', 'aberto')
    .gte('data', primeiroDia)
    .lte('data', ultimoDia)
    .order('data', { ascending: true })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Carteira</h1>
          <p className="text-[#6B7280] mt-1">
            Lançamentos em aberto do mês
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Suspense fallback={<div className="w-48 h-8 bg-gray-100 rounded-lg animate-pulse" />}>
            <SeletorMes />
          </Suspense>
          <NovaTransacaoModal categorias={categorias ?? []} />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <ListaCarteira transacoes={(transacoes ?? []) as any} categorias={categorias ?? []} />
      </div>
    </div>
  )
}
