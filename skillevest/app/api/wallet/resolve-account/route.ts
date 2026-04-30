import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { resolveAccountNumber } from '@/lib/paystack'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const account_number = searchParams.get('account_number')
  const bank_code = searchParams.get('bank_code')

  if (!account_number || !bank_code) {
    return NextResponse.json({ error: 'account_number and bank_code are required' }, { status: 400 })
  }

  const result = await resolveAccountNumber(account_number, bank_code)
  return NextResponse.json(result)
}
