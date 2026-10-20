import React, { useState } from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Polygon, Polyline, Stop, Text as SvgText } from 'react-native-svg';
import { C } from '../theme';

export function LineChart({ data: raw, color = C.green, height = 80 }: { data: number[]; color?: string; height?: number }) {
  const [w, setW] = useState(0);
  const data = raw.length === 0 ? [0, 0] : raw.length === 1 ? [raw[0], raw[0]] : raw;
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, height - ((v - min) / range) * (height - 16) - 8]);
  const id = `g${color.replace('#', '')}`;
  return (
    <View onLayout={e => setW(e.nativeEvent.layout.width)} style={{ height }}>
      {w > 0 && (
        <Svg width={w} height={height}>
          <Defs>
            <SvgGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={color} stopOpacity={0.2} />
              <Stop offset="1" stopColor={color} stopOpacity={0.02} />
            </SvgGradient>
          </Defs>
          <Polygon points={`0,${height} ${pts.map(p => p.join(',')).join(' ')} ${w},${height}`} fill={`url(#${id})`} />
          <Polyline points={pts.map(p => p.join(',')).join(' ')} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          {pts.map(([x, y], i) => <Circle key={i} cx={x} cy={y} r={3} fill={color} stroke="#fff" strokeWidth={1.5} />)}
        </Svg>
      )}
    </View>
  );
}

export function DonutChart({ value, color = C.green, size = 72 }: { value: number; color?: string; size?: number }) {
  const r = 28, c = 2 * Math.PI * r;
  return (
    <Svg width={size} height={size} viewBox="0 0 72 72">
      <Circle cx={36} cy={36} r={r} fill="none" stroke={C.border} strokeWidth={8} />
      <Circle cx={36} cy={36} r={r} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round"
        strokeDasharray={`${(value / 100) * c} ${c}`} rotation={-90} origin="36, 36" />
      <SvgText x={36} y={41} textAnchor="middle" fontSize={13} fontWeight="700" fill={C.text}>{`${value}%`}</SvgText>
    </Svg>
  );
}

export function BarChart({ data, labels, color = C.green }: { data: number[]; labels: string[]; color?: string }) {
  const max = Math.max(...data, 1);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 5, height: 84 }}>
      {data.map((v, i) => (
        <View key={i} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
          <View style={{ width: '100%', height: (v / max) * 64, backgroundColor: color, opacity: i === data.length - 1 ? 1 : 0.5, borderTopLeftRadius: 5, borderTopRightRadius: 5 }} />
          <Text style={{ fontSize: 8, color: C.muted }}>{labels[i]}</Text>
        </View>
      ))}
    </View>
  );
}

export const MonthLabels = ({ labels }: { labels: string[] }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
    {labels.map(m => <Text key={m} style={{ fontSize: 8, color: C.muted }}>{m}</Text>)}
  </View>
);
