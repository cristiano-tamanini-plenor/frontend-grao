/**
 * Tipos de cobrança (formas de pagamento)
 */
export enum BillingType {
  BOLETO = 'BOLETO',
  CREDIT_CARD = 'CREDIT_CARD',
  PIX = 'PIX',
  DEBIT_CARD = 'DEBIT_CARD',
}

/**
 * Status de cobrança
 */
export enum ChargeStatus {
  PENDING = 'PENDING',
  RECEIVED = 'RECEIVED',
  CONFIRMED = 'CONFIRMED',
  OVERDUE = 'OVERDUE',
  REFUNDED = 'REFUNDED',
  RECEIVED_IN_CASH = 'RECEIVED_IN_CASH',
  RECEIVED_IN_CASH_UNDONE = 'RECEIVED_IN_CASH_UNDONE',
  REFUND_REQUESTED = 'REFUND_REQUESTED',
  REFUND_IN_PROGRESS = 'REFUND_IN_PROGRESS',
  CHARGEBACK_REQUESTED = 'CHARGEBACK_REQUESTED',
  CHARGEBACK_DISPUTE = 'CHARGEBACK_DISPUTE',
  AWAITING_CHARGEBACK_REVERSAL = 'AWAITING_CHARGEBACK_REVERSAL',
  DUNNING_REQUESTED = 'DUNNING_REQUESTED',
  DUNNING_RECEIVED = 'DUNNING_RECEIVED',
  AWAITING_RISK_ANALYSIS = 'AWAITING_RISK_ANALYSIS',
}

/**
 * Mapeamento de labels para billingType
 */
export const BILLING_TYPE_LABELS: Record<BillingType, string> = {
  [BillingType.BOLETO]: 'Boleto',
  [BillingType.CREDIT_CARD]: 'Cartão de Crédito',
  [BillingType.PIX]: 'PIX',
  [BillingType.DEBIT_CARD]: 'Cartão de Débito',
};

/**
 * Mapeamento de labels para status
 */
export const CHARGE_STATUS_LABELS: Record<ChargeStatus, string> = {
  [ChargeStatus.PENDING]: 'Aguardando pagamento',
  [ChargeStatus.RECEIVED]: 'Recebida',
  [ChargeStatus.CONFIRMED]: 'Confirmada',
  [ChargeStatus.OVERDUE]: 'Vencida',
  [ChargeStatus.REFUNDED]: 'Cobrança estornada',
  [ChargeStatus.RECEIVED_IN_CASH]: 'Recebida em dinheiro',
  [ChargeStatus.RECEIVED_IN_CASH_UNDONE]: 'Recebida em dinheiro desfeita',
  [ChargeStatus.REFUND_REQUESTED]: 'Estorno solicitado',
  [ChargeStatus.REFUND_IN_PROGRESS]: 'Estorno em andamento',
  [ChargeStatus.CHARGEBACK_REQUESTED]: 'Chargeback solicitado',
  [ChargeStatus.CHARGEBACK_DISPUTE]: 'Chargeback em disputa',
  [ChargeStatus.AWAITING_CHARGEBACK_REVERSAL]: 'Aguardando reversão do chargeback',
  [ChargeStatus.DUNNING_REQUESTED]: 'Em negativação',
  [ChargeStatus.DUNNING_RECEIVED]: 'Negativação recebida',
  [ChargeStatus.AWAITING_RISK_ANALYSIS]: 'Pagamento em análise',
};

/**
 * Status padrão para listagem (pendentes e pagos)
 */
export const DEFAULT_STATUS_FILTERS: ChargeStatus[] = [
  ChargeStatus.PENDING,
  ChargeStatus.RECEIVED,
];

