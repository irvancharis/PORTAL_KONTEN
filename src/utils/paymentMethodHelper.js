import { generateDynamicQris } from './qris';
import { db, isFirebaseConfigured } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

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

export function syncPaymentMethodFromSettings(dbSettings) {
  if (!dbSettings) return;
  try {
    if (dbSettings.activePaymentMethod) {
      localStorage.setItem(METHOD_KEY, dbSettings.activePaymentMethod);
    }
    if (Array.isArray(dbSettings.qrisList)) {
      localStorage.setItem(QRIS_LIST_KEY, JSON.stringify(dbSettings.qrisList));
    }
  } catch (e) {
    console.error('Failed syncing payment method from settings:', e);
  }
}

export async function savePaymentMethodConfig(activeMethod, qrisList) {
  try {
    const methodVal = activeMethod || 'transfer';
    const listVal = qrisList || [];
    localStorage.setItem(METHOD_KEY, methodVal);
    localStorage.setItem(QRIS_LIST_KEY, JSON.stringify(listVal));
    window.dispatchEvent(new Event('payment-method-updated'));
    if (isFirebaseConfigured() && db) {
      await setDoc(
        doc(db, 'settings', 'general'),
        { activePaymentMethod: methodVal, qrisList: listVal },
        { merge: true }
      );
    }
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
