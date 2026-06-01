'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function marcarComoPago(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { erro: 'Não autenticado' }

  const { error } = await supabase
    .from('transacoes')
    .update({ status: 'pago' })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { erro: error.message }

  revalidatePath('/dashboard/carteira')
  revalidatePath('/dashboard')
  return { sucesso: true }
}

export async function reabrirLancamento(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { erro: 'Não autenticado' }

  const { error } = await supabase
    .from('transacoes')
    .update({ status: 'aberto' })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { erro: error.message }

  revalidatePath('/dashboard/carteira')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/transacoes')
  return { sucesso: true }
}

export async function editarLancamento(id: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { erro: 'Não autenticado' }

  const valor = parseFloat(formData.get('valor') as string)
  const data = formData.get('data') as string
  const descricao = formData.get('descricao') as string
  const categoria_id = formData.get('categoria_id') as string

  if (!valor || !data || !categoria_id) {
    return { erro: 'Preencha todos os campos obrigatórios.' }
  }

  const { data: lancamento, error: fetchError } = await supabase
    .from('transacoes')
    .select('recorrencia_id, data')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchError) return { erro: fetchError.message }

  const { error } = await supabase
    .from('transacoes')
    .update({ valor, data, descricao, categoria_id })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { erro: error.message }

  if (lancamento?.recorrencia_id) {
    await supabase
      .from('transacoes')
      .update({ valor, descricao, categoria_id })
      .eq('recorrencia_id', lancamento.recorrencia_id)
      .eq('user_id', user.id)
      .gt('data', lancamento.data)
  }

  revalidatePath('/dashboard/carteira')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/transacoes')
  return { sucesso: true }
}
