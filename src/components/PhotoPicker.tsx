import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { Avatar, Icon, IconName } from './ui';
import { Dialog } from './Dialog';
import { C } from '../theme';

/** Temp placeholder photo (remote). Replace with your own default/avatar service. */
export const tempPhotoUrl = (seed: string) => `https://i.pravatar.cc/300?u=${encodeURIComponent(seed || String(Date.now()))}`;

export function PhotoPicker({ name, uri, onChange }: { name: string; uri?: string; onChange: (uri?: string) => void }) {
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState('');

  const pick = async (kind: 'camera' | 'gallery') => {
    setOpen(false); setErr('');
    const opts = { mediaType: 'photo' as const, quality: 0.8 as const, selectionLimit: 1 };
    const res = kind === 'camera' ? await launchCamera(opts) : await launchImageLibrary(opts);
    if (res.didCancel) return;
    if (res.errorMessage) return setErr(res.errorMessage);
    const u = res.assets?.[0]?.uri;
    if (u) onChange(u);
  };

  const Row = ({ icon, label, onPress, danger }: { icon: IconName; label: string; onPress: () => void; danger?: boolean }) => (
    <TouchableOpacity onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: C.bg }}>
      <Icon name={icon} size={20} color={danger ? C.danger : C.green} />
      <Text style={{ fontSize: 15, color: danger ? C.danger : C.text }}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ alignItems: 'center', gap: 8, paddingVertical: 8 }}>
      <TouchableOpacity onPress={() => setOpen(true)} activeOpacity={0.85}>
        <Avatar name={name} size="xl" uri={uri} />
        <View style={{ position: 'absolute', right: 0, bottom: 0, width: 30, height: 30, borderRadius: 15, backgroundColor: C.green, borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="camera" size={15} color="#fff" />
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setOpen(true)}><Text style={{ fontSize: 12, color: C.green, fontWeight: '500' }}>{uri ? 'Change Photo' : 'Upload Photo'}</Text></TouchableOpacity>
      {err ? <Text style={{ fontSize: 12, color: C.danger }}>{err}</Text> : null}

      <Dialog visible={open} onClose={() => setOpen(false)} title="Profile Photo">
        <View>
          <Row icon="camera-outline" label="Take Photo" onPress={() => pick('camera')} />
          <Row icon="images-outline" label="Choose from Gallery" onPress={() => pick('gallery')} />
          <Row icon="sparkles-outline" label="Use Temp Photo" onPress={() => { setOpen(false); onChange(tempPhotoUrl(name)); }} />
          {uri ? <Row icon="trash-outline" label="Remove Photo" danger onPress={() => { setOpen(false); onChange(undefined); }} /> : null}
        </View>
      </Dialog>
    </View>
  );
}
