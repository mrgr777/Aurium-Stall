/**
 * Diálogos compatíveis com web e nativo.
 * O `Alert` do React Native não funciona no navegador (react-native-web),
 * então na web usamos os diálogos nativos do browser.
 */
import { Alert, Platform } from 'react-native';

type ConfirmOptions = {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void;
};

/** Confirmação com Cancelar / Confirmar. */
export function confirmDialog(opts: ConfirmOptions): void {
  if (Platform.OS === 'web') {
    const text = opts.message ? `${opts.title}\n\n${opts.message}` : opts.title;
    const ok = (globalThis as { confirm?: (m: string) => boolean }).confirm?.(text);
    if (ok) opts.onConfirm();
    return;
  }
  Alert.alert(opts.title, opts.message, [
    { text: opts.cancelText ?? 'Cancelar', style: 'cancel' },
    {
      text: opts.confirmText ?? 'Confirmar',
      style: opts.destructive ? 'destructive' : 'default',
      onPress: opts.onConfirm,
    },
  ]);
}

/** Aviso simples (apenas OK). */
export function alertDialog(title: string, message?: string): void {
  if (Platform.OS === 'web') {
    const text = message ? `${title}\n\n${message}` : title;
    (globalThis as { alert?: (m: string) => void }).alert?.(text);
    return;
  }
  Alert.alert(title, message);
}
