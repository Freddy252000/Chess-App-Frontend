import React, { ReactNode, useState } from 'react';
import { View, Text, Image, TouchableOpacity, TextInput, ScrollView, TextInputProps, ViewStyle, StyleProp, Switch, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { C, display, shadow } from '../theme';
import { ChessKnight } from './ChessPieces';

export type IconName = React.ComponentProps<typeof Ionicons>['name'];
export const Icon = ({ name, size = 20, color = C.green }: { name: IconName; size?: number; color?: string }) => (
  <Ionicons name={name} size={size} color={color} />
);

/* ───────── Layout ───────── */
function useRefreshControl(onRefresh?: () => unknown) {
  const [refreshing, setRefreshing] = useState(false);
  if (!onRefresh) return undefined;
  return (
    <RefreshControl refreshing={refreshing} tintColor={C.green} colors={[C.green]}
      onRefresh={async () => { setRefreshing(true); try { await onRefresh(); } finally { setRefreshing(false); } }} />
  );
}

export function Screen({ title, back, action, children, scroll = true, onRefresh }: {
  title: string; back?: boolean; action?: ReactNode; children: ReactNode; scroll?: boolean; onRefresh?: () => unknown;
}) {
  const nav = useNavigation<any>();
  const refreshControl = useRefreshControl(onRefresh);
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ backgroundColor: C.white, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: C.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {back && (
            <TouchableOpacity onPress={() => nav.goBack()} style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="chevron-back" size={24} />
            </TouchableOpacity>
          )}
          <Text style={{ fontSize: 18, fontWeight: '600', color: C.text }}>{title}</Text>
        </View>
        {action}
      </View>
      {scroll ? (
        <ScrollView refreshControl={refreshControl} contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : children}
    </SafeAreaView>
  );
}

/** Dashboard-style screen with a green gradient hero at the top */
export function HeroScreen({ greeting, title, sub, children, onRefresh }: { greeting: string; title: string; sub?: string; children: ReactNode; onRefresh?: () => unknown }) {
  const insets = useSafeAreaInsets();
  const refreshControl = useRefreshControl(onRefresh);
  return (
    <ScrollView refreshControl={refreshControl} style={{ flex: 1, backgroundColor: C.bg }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
      <LinearGradient colors={[C.green, C.greenDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingTop: insets.top + 20, paddingBottom: 24, paddingHorizontal: 20 }}>
        <Text style={{ color: 'rgba(255,255,255,.7)', fontSize: 14 }}>{greeting}</Text>
        <Text style={{ color: '#fff', fontSize: 26, fontFamily: display }}>{title}</Text>
        {sub ? <Text style={{ color: 'rgba(255,255,255,.6)', fontSize: 12, marginTop: 4 }}>{sub}</Text> : null}
        <View style={{ position: 'absolute', right: 16, bottom: 4, opacity: 0.12 }}>
          <ChessKnight size={110} color="#fff" />
        </View>
      </LinearGradient>
      <View style={{ padding: 16, gap: 20 }}>{children}</View>
    </ScrollView>
  );
}

export const Card = ({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) => (
  <View style={[{ backgroundColor: C.white, borderRadius: 16, padding: 16, ...shadow }, style]}>{children}</View>
);
export const SectionTitle = ({ children }: { children: ReactNode }) => (
  <Text style={{ fontSize: 14, fontWeight: '600', color: C.text2 }}>{children}</Text>
);
export const Muted = ({ children, style }: { children: ReactNode; style?: any }) => (
  <Text style={[{ fontSize: 12, color: C.muted }, style]}>{children}</Text>
);
export const InfoRow = ({ k, v, last }: { k: string; v: string | number; last?: boolean }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: last ? 0 : 1, borderBottomColor: C.bg }}>
    <Text style={{ fontSize: 12, color: C.muted }}>{k}</Text>
    <Text style={{ fontSize: 12, color: C.text, fontWeight: '500', maxWidth: '60%', textAlign: 'right' }}>{v}</Text>
  </View>
);
export const InfoCard = ({ title, rows }: { title: string; rows: [string, string | number][] }) => (
  <Card>
    <SectionTitle>{title}</SectionTitle>
    <View style={{ marginTop: 8 }}>{rows.map(([k, v], i) => <InfoRow key={k} k={k} v={v} last={i === rows.length - 1} />)}</View>
  </Card>
);

/* ───────── Display ───────── */
const AV = [C.green, C.greenLight, '#1a3a5c', '#5c3a1a', '#3a1a5c'];
export function Avatar({ name, size = 'md', uri }: { name: string; size?: 'sm' | 'md' | 'lg' | 'xl'; uri?: string }) {
  const d = { sm: 32, md: 40, lg: 64, xl: 96 }[size];
  const fs = { sm: 12, md: 14, lg: 22, xl: 32 }[size];
  if (uri) return <Image source={{ uri }} style={{ width: d, height: d, borderRadius: d / 2, backgroundColor: C.border }} />;
  const initials = name.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('');
  return (
    <View style={{ width: d, height: d, borderRadius: d / 2, backgroundColor: initials ? AV[name.charCodeAt(0) % AV.length] : C.border, alignItems: 'center', justifyContent: 'center' }}>
      {initials ? <Text style={{ color: '#fff', fontWeight: '600', fontSize: fs }}>{initials}</Text> : <Icon name="person" size={d / 2} color={C.muted} />}
    </View>
  );
}

type BadgeType = 'success' | 'warning' | 'danger' | 'default' | 'primary' | 'info' | 'purple';
const BADGE: Record<BadgeType, [string, string]> = {
  success: ['#DCFCE7', '#15803D'], warning: ['#FEF3C7', '#B45309'], danger: ['#FEE2E2', '#B91C1C'],
  default: ['#F3F4F6', '#4B5563'], primary: ['rgba(27,67,50,.1)', C.green], info: ['#DBEAFE', '#1D4ED8'], purple: ['#F3E8FF', '#7E22CE'],
};
export const Badge = ({ label, type = 'default' }: { label: string; type?: BadgeType }) => (
  <View style={{ backgroundColor: BADGE[type][0], paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99, alignSelf: 'flex-start' }}>
    <Text style={{ color: BADGE[type][1], fontSize: 11, fontWeight: '500' }}>{label}</Text>
  </View>
);

export const ProgressBar = ({ value, color = 'green' }: { value: number; color?: 'green' | 'mint' | 'warning' | 'danger' }) => {
  const bg = { green: C.green, mint: C.mint, warning: C.warn, danger: C.danger }[color];
  return (
    <View style={{ height: 8, backgroundColor: '#F3F4F6', borderRadius: 99, overflow: 'hidden' }}>
      <View style={{ height: '100%', width: `${Math.min(100, value)}%`, backgroundColor: bg, borderRadius: 99 }} />
    </View>
  );
};

export function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <Card style={{ flex: 1, minWidth: '47%' }}>
      <Text style={{ fontSize: 13, fontWeight: '500', color: C.text2, marginBottom: 6 }}>{label}</Text>
      <Text style={{ fontSize: 24, fontWeight: '700', color: C.text, fontFamily: display }}>{value}</Text>
      {sub ? <Text style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{sub}</Text> : null}
    </Card>
  );
}

export function Empty({ icon, title, sub }: { icon: IconName; title: string; sub?: string }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 48 }}>
      <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
        <Icon name={icon} size={28} color={C.muted} />
      </View>
      <Text style={{ fontSize: 14, fontWeight: '500', color: C.text2 }}>{title}</Text>
      {sub ? <Muted style={{ marginTop: 4, textAlign: 'center' }}>{sub}</Muted> : null}
    </View>
  );
}

export function SuccessView({ icon = 'checkmark', title, sub, button, onPress }: { icon?: IconName; title: string; sub?: string; button: string; onPress: () => void }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <Icon name={icon} size={38} color="#16A34A" />
      </View>
      <Text style={{ fontSize: 20, fontFamily: display, color: C.text, marginBottom: 8 }}>{title}</Text>
      {sub ? <Muted style={{ textAlign: 'center', marginBottom: 24, fontSize: 14 }}>{sub}</Muted> : null}
      <Btn label={button} onPress={onPress} />
    </SafeAreaView>
  );
}

/* ───────── Inputs ───────── */
type BtnVariant = 'primary' | 'soft' | 'ghost' | 'danger' | 'outline';
export function Btn({ label, onPress, variant = 'primary', icon, disabled, style, small }: {
  label?: string; onPress?: () => void; variant?: BtnVariant; icon?: IconName; disabled?: boolean; style?: StyleProp<ViewStyle>; small?: boolean;
}) {
  const pad = small ? 8 : 14;
  const content = (color: string) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
      {icon && <Icon name={icon} size={16} color={color} />}
      {label ? <Text style={{ color, fontWeight: '600', fontSize: small ? 12 : 14 }}>{label}</Text> : null}
    </View>
  );
  if (variant === 'primary') {
    return (
      <TouchableOpacity disabled={disabled} onPress={onPress} activeOpacity={0.85} style={[{ opacity: disabled ? 0.5 : 1, borderRadius: 12, overflow: 'hidden' }, style]}>
        <LinearGradient colors={[C.green, C.greenLight]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingVertical: pad, paddingHorizontal: 20 }}>{content('#fff')}</LinearGradient>
      </TouchableOpacity>
    );
  }
  const map = { soft: ['rgba(27,67,50,.1)', C.green], ghost: [C.bg, C.text2], danger: ['#FEF2F2', C.danger], outline: [C.white, C.green] } as const;
  const [bg, fg] = map[variant];
  return (
    <TouchableOpacity disabled={disabled} onPress={onPress} style={[{ backgroundColor: bg, borderRadius: 12, paddingVertical: small ? 8 : 12, paddingHorizontal: 12, borderWidth: variant === 'outline' ? 1 : 0, borderColor: C.border }, style]}>
      {content(fg)}
    </TouchableOpacity>
  );
}

export function Field({ label, ...props }: { label: string } & TextInputProps) {
  const [focus, setFocus] = useState(false);
  return (
    <View>
      <Text style={{ fontSize: 14, fontWeight: '500', color: C.text2, marginBottom: 6 }}>{label}</Text>
      <TextInput placeholderTextColor={C.muted} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} {...props}
        style={[{ borderWidth: 1, borderColor: focus ? C.green : C.border, backgroundColor: C.input, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: C.text }, props.style]} />
    </View>
  );
}

export function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 12 }}>
      <Icon name="search" size={16} color={C.muted} />
      <TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={C.muted} style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 8, fontSize: 14, color: C.text }} />
    </View>
  );
}

/** Replacement for <select>: horizontally scrolling chips */
export function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <View>
      <Text style={{ fontSize: 14, fontWeight: '500', color: C.text2, marginBottom: 6 }}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {options.map(o => {
          const on = o === value;
          return (
            <TouchableOpacity key={o} onPress={() => onChange(o)} style={{ paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12, borderWidth: 1, borderColor: on ? C.green : C.border, backgroundColor: on ? C.green : C.input }}>
              <Text style={{ fontSize: 13, color: on ? '#fff' : C.text2, fontWeight: '500' }}>{o}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

export function Segmented<T extends string>({ options, value, onChange, labels }: { options: readonly T[]; value: T; onChange: (v: T) => void; labels?: Record<string, string> }) {
  return (
    <View style={{ flexDirection: 'row', backgroundColor: '#E9EDF1', borderRadius: 12, padding: 4 }}>
      {options.map(o => {
        const on = o === value;
        return (
          <TouchableOpacity key={o} onPress={() => onChange(o)} style={{ flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center', backgroundColor: on ? C.white : 'transparent', ...(on ? shadow : {}) }}>
            <Text style={{ fontSize: 13, fontWeight: '500', color: on ? C.green : C.muted, textTransform: labels ? 'none' : 'capitalize' }}>{labels?.[o] ?? o}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export const Toggle = (p: { value: boolean; onValueChange: (v: boolean) => void }) => (
  <Switch {...p} trackColor={{ false: C.border, true: C.green }} thumbColor="#fff" />
);

export const IconBox = ({ name, bg = 'rgba(27,67,50,.1)', color = C.green, size = 36 }: { name: IconName; bg?: string; color?: string; size?: number }) => (
  <View style={{ width: size, height: size, borderRadius: 12, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
    <Icon name={name} size={20} color={color} />
  </View>
);

export const AddButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' }}>
    <Icon name="add" size={20} color="#fff" />
  </TouchableOpacity>
);

export const QuickAction = ({ label, icon, bg, color, onPress, row }: { label: string; icon: IconName; bg: string; color: string; onPress: () => void; row?: boolean }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.8}
    style={{ backgroundColor: C.white, borderRadius: 16, padding: row ? 16 : 12, alignItems: 'center', flexDirection: row ? 'row' : 'column', gap: row ? 12 : 8, width: row ? '48%' : '31.5%', ...shadow }}>
    <IconBox name={icon} bg={bg} color={color} />
    <Text style={{ fontSize: row ? 14 : 12, fontWeight: '500', color: C.text2, textAlign: 'center' }}>{label}</Text>
  </TouchableOpacity>
);

export const ToggleRow = ({ label, sub, value, onValueChange, last }: { label: string; sub?: string; value: boolean; onValueChange: (v: boolean) => void; last?: boolean }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: last ? 0 : 1, borderBottomColor: C.bg }}>
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 14, fontWeight: '500', color: C.text }}>{label}</Text>
      {sub ? <Text style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{sub}</Text> : null}
    </View>
    <Toggle value={value} onValueChange={onValueChange} />
  </View>
);

/* ───────── Async states ───────── */
export const Loading = () => (
  <View style={{ paddingVertical: 48, alignItems: 'center' }}><ActivityIndicator size="large" color={C.green} /></View>
);
export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 36, gap: 10 }}>
      <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="cloud-offline-outline" size={26} color={C.danger} />
      </View>
      <Text style={{ fontSize: 14, color: C.text2, textAlign: 'center', paddingHorizontal: 24 }}>{message || 'Something went wrong'}</Text>
      {onRetry ? <Btn small variant="soft" icon="refresh" label="Try again" onPress={onRetry} /> : null}
    </View>
  );
}
/** shows a spinner / error / the content for a useApi() state (keeps old data visible while refreshing) */
export function Async<T>({ state, children }: { state: { data: T | null; loading: boolean; error: string; reload: () => unknown }; children: (data: T) => ReactNode }) {
  if (state.data !== null) return <>{children(state.data)}</>;
  if (state.loading) return <Loading />;
  return <ErrorState message={state.error} onRetry={state.reload} />;
}
