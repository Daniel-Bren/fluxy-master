'use client'

import { useState } from 'react'
import { marcarComoPago, editarLancamento } from '@/app/dashboard/carteira/actions'
import { Pencil, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

type Categoria = {
  id: string
  nome: string
}

type Transacao = {
  id: string
  tipo: 'entrada' | 'saida'
  valor: number
  data: string
  descricao: string | null
  categoria_id: string | null
  recorrencia_id: string | null
  categorias: { nome: string }[] | null
}

type Props = {
  transacoes: Transacao[]
  categorias: Categoria[]
}

function ItemCarteira({ t, categorias }: { t: Transacao; categorias: Categoria[] }) {
  const [editando, setEditando] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  async function handleMarcar() {
    await marcarComoPago(t.id)
  }

  async function handleEditar(formData: FormData) {
    setErro('')
    setCarregando(true)
    const resultado = await editarLancamento(t.id, formData)
    if (resultado?.erro) {
      setErro(resultado.erro)
      setCarregando(false)
      return
    }
    setEditando(false)
    setCarregando(false)
  }

  const categoria = t.categorias?.[0]?.nome
  const dataFormatada = new Date(t.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
  const valor = t.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <>
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
              {categoria}{categoria ? ' • ' : ''}{dataFormatada}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <p className={`text-xl font-bold ${
            t.tipo === 'entrada' ? 'text-[#16A34A]' : 'text-[#DC2626]'
          }`}>
            {t.tipo === 'saida' ? '- ' : ''}{valor}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditando(true)}
              title="Editar lançamento"
              className="text-[#6B7280] hover:text-[#2563EB] transition-colors p-1"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={handleMarcar}
              className="text-xs font-medium px-3 py-1.5 rounded-lg border border-[#16A34A] text-[#16A34A] bg-white hover:bg-[#16A34A] hover:text-white transition-colors whitespace-nowrap"
            >
              {t.tipo === 'entrada' ? 'Marcar como recebido' : 'Marcar como pago'}
            </button>
          </div>
        </div>
      </div>

      {editando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setEditando(false)}
          />

          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-xl z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#111827]">Editar lançamento</h2>
              <button
                onClick={() => setEditando(false)}
                className="text-[#6B7280] hover:text-[#111827]"
              >
                <X size={20} />
              </button>
            </div>

            <form action={handleEditar} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  name="descricao"
                  type="text"
                  defaultValue={t.descricao ?? ''}
                  placeholder="Ex: Almoço, Salário..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor">Valor (R$)</Label>
                <Input
                  id="valor"
                  name="valor"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={t.valor}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="data">Data</Label>
                <Input
                  id="data"
                  name="data"
                  type="date"
                  defaultValue={t.data}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria_id">Categoria</Label>
                <select
                  id="categoria_id"
                  name="categoria_id"
                  required
                  defaultValue={t.categoria_id ?? ''}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#111827] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nome}
                    </option>
                  ))}
                </select>
              </div>

              {t.recorrencia_id && (
                <p className="text-xs text-[#6B7280] bg-blue-50 px-3 py-2 rounded-lg">
                  Este é um lançamento recorrente. Valor, descrição e categoria serão atualizados também nos meses seguintes.
                </p>
              )}

              {erro && <p className="text-sm text-[#DC2626]">{erro}</p>}

              <div className="flex gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setEditando(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#2563EB] hover:bg-[#1d4ed8]"
                  disabled={carregando}
                >
                  {carregando ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default function ListaCarteira({ transacoes, categorias }: Props) {
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
        <ItemCarteira key={t.id} t={t} categorias={categorias} />
      ))}
    </div>
  )
}
