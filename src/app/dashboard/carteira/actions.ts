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
