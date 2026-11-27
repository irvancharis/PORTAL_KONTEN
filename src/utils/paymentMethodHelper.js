import { generateDynamicQris } from './qris';

const METHOD_KEY = 'portal-payment-method-active';
const QRIS_LIST_KEY = 'portal-qris-list';

export function getPaymentMethodConfig() {
  try {
    const activeMethod = localStorage.getItem(METHOD_KEY) || 'transfer';
    const rawList = localStorage.getItem(QRIS_LIST_KEY);
    const qrisList = rawList ? JSON.parse(rawList) : [];
    return { activeMethod, qrisList: Array.isArray(qrisList) ? qrisList : [] };
  } catch {
    return { activeMethod: 'transfer', qrisList: [] };
  }
}

export function savePaymentMethodConfig(activeMethod, qrisList) {
  try {
    localStorage.setItem(METHOD_KEY, activeMethod || 'transfer');
    localStorage.setItem(QRIS_LIST_KEY, JSON.stringify(qrisList || []));
    window.dispatchEvent(new Event('payment-method-updated'));
  } catch (e) {
    console.error('Failed saving payment method config:', e);
  }
}

export function getActiveQrisForAmount(amount) {
  const { activeMethod, qrisList } = getPaymentMethodConfig();
  if (activeMethod !== 'qris') return null;
  const activeQris = qrisList.find(q => q.isActive) || qrisList[0];
  if (!activeQris || !activeQris.qrisString) return null;
  const dynamicQris = generateDynamicQris(activeQris.qrisString, amount);
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(dynamicQris)}`;
  return {
    name: activeQris.name || 'QRIS DANA Bisnis',
    dynamicQris,
    qrImageUrl
  };
}
