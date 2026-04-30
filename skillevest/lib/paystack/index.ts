import axios from 'axios'

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!
const BASE_URL = 'https://api.paystack.co'

const paystackAxios = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET}`,
    'Content-Type': 'application/json',
  },
})

export async function initializePayment(params: {
  email: string
  amount_naira: number
  reference: string
  callback_url?: string
  metadata?: Record<string, unknown>
}) {
  const response = await paystackAxios.post('/transaction/initialize', {
    email: params.email,
    amount: params.amount_naira * 100, // Paystack uses kobo
    reference: params.reference,
    callback_url:
      params.callback_url ||
      `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/verify`,
    metadata: params.metadata || {},
  })
  return response.data.data
}

export async function verifyPayment(reference: string) {
  const response = await paystackAxios.get(`/transaction/verify/${reference}`)
  return response.data.data
}

export async function createTransferRecipient(params: {
  name: string
  account_number: string
  bank_code: string
}) {
  const response = await paystackAxios.post('/transferrecipient', {
    type: 'nuban',
    name: params.name,
    account_number: params.account_number,
    bank_code: params.bank_code,
    currency: 'NGN',
  })
  return response.data.data
}

export async function initiateTransfer(params: {
  amount_naira: number
  recipient_code: string
  reference: string
  reason: string
}) {
  const response = await paystackAxios.post('/transfer', {
    source: 'balance',
    amount: params.amount_naira * 100,
    recipient: params.recipient_code,
    reference: params.reference,
    reason: params.reason,
  })
  return response.data.data
}

export async function getBankList() {
  const response = await paystackAxios.get('/bank?currency=NGN&per_page=100')
  return response.data.data
}

export async function resolveAccountNumber(account_number: string, bank_code: string) {
  const response = await paystackAxios.get(
    `/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`
  )
  return response.data.data
}

export function generateReference(prefix: string = 'SV'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`
}
