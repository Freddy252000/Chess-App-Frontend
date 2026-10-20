import React, { ReactNode } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Btn, Icon, IconName } from './ui';
import { C, display, shadow } from '../theme';

export type DialogAction = { label: string; onPress: () => void; variant?: 'primary' | 'soft' | 'ghost' | 'danger' | 'outline' };
type Tone = 'default' | 'danger' | 'success';
const TONE: Record<Tone, { fg: string; bg: string }> = {
  default: { fg: C.green, bg: 'rgba(27,67,50,.1)' },
  danger: { fg: C.danger, bg: '#FEF2F2' },
  success: { fg: '#16A34A', bg: '#DCFCE7' },
};

export function Dialog({ visible, onClose, title, message, icon, tone = 'default', actions, children }: {
  visible: boolean; onClose: () => void; title: string; message?: string; icon?: IconName; tone?: Tone;
  actions?: DialogAction[]; children?: ReactNode;
}) {
  const t = TONE[tone];
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(15,23,42,.5)', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Pressable onPress={() => {}} style={{ width: '100%', maxWidth: 360, backgroundColor: '#fff', borderRadius: 20, padding: 20, gap: 12, ...shadow }}>
          {icon && (
            <View style={{ alignSelf: 'center', width: 52, height: 52, borderRadius: 26, backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={icon} size={26} color={t.fg} />
            </View>
          )}
          <Text style={{ fontSize: 18, fontFamily: display, color: C.text, textAlign: icon ? 'center' : 'left' }}>{title}</Text>
          {message ? <Text style={{ fontSize: 14, color: C.text2, lineHeight: 20, textAlign: icon ? 'center' : 'left' }}>{message}</Text> : null}
          {children}
          {actions && (
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
              {actions.map(a => <Btn key={a.label} label={a.label} variant={a.variant ?? 'ghost'} onPress={a.onPress} style={{ flex: 1 }} />)}
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function ConfirmDialog({ visible, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger, icon, onConfirm, onCancel }: {
  visible: boolean; title: string; message?: string; confirmLabel?: string; cancelLabel?: string; danger?: boolean;
  icon?: IconName; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <Dialog visible={visible} onClose={onCancel} title={title} message={message} tone={danger ? 'danger' : 'default'}
      icon={icon ?? (danger ? 'alert-circle-outline' : 'help-circle-outline')}
      actions={[{ label: cancelLabel, onPress: onCancel }, { label: confirmLabel, variant: danger ? 'danger' : 'primary', onPress: onConfirm }]} />
  );
}
