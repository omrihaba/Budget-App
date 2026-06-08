import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useColors } from '../constants/colors';
import { formatILS } from '../utils/currency';

export interface ChartSlice {
  label: string;
  value: number;
  color: string;
}

interface Props {
  data: ChartSlice[];
  size?: number;
}

function toXY(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function ringArc(cx: number, cy: number, ro: number, ri: number, a0: number, a1: number): string {
  const os = toXY(cx, cy, ro, a1);
  const oe = toXY(cx, cy, ro, a0);
  const is = toXY(cx, cy, ri, a1);
  const ie = toXY(cx, cy, ri, a0);
  const big = a1 - a0 > 180 ? 1 : 0;
  return [
    `M${os.x} ${os.y}`,
    `A${ro} ${ro} 0 ${big} 0 ${oe.x} ${oe.y}`,
    `L${ie.x} ${ie.y}`,
    `A${ri} ${ri} 0 ${big} 1 ${is.x} ${is.y}`,
    'Z',
  ].join(' ');
}

export default function DonutChart({ data, size = 180 }: Props) {
  const c = useColors();
  if (!data.length) return null;

  const cx = size / 2, cy = size / 2;
  const ro = size / 2 - 6, ri = ro * 0.55;
  const total = data.reduce((s, d) => s + d.value, 0);
  const gapDeg = 2;
  const available = 360 - gapDeg * data.length;

  let cursor = 0;
  const slices = data.map(d => {
    const sweep = (d.value / total) * available;
    const s0 = cursor, s1 = cursor + sweep;
    cursor = s1 + gapDeg;
    return { ...d, s0, s1 };
  });

  return (
    <View style={st.wrap}>
      <Svg width={size} height={size} style={{ alignSelf: 'center' }}>
        {slices.map((sl, i) => (
          <Path key={i} d={ringArc(cx, cy, ro, ri, sl.s0, sl.s1)} fill={sl.color} />
        ))}
      </Svg>

      <View style={st.legend}>
        {data.map((item, i) => (
          <View key={i} style={st.row}>
            <View style={[st.dot, { backgroundColor: item.color }]} />
            <Text style={[st.lbl, { color: c.secondaryText }]} numberOfLines={1}>{item.label}</Text>
            <Text style={[st.amt, { color: c.text }]}>{formatILS(item.value)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  wrap:   { gap: 16 },
  legend: { gap: 8 },
  row:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot:    { width: 10, height: 10, borderRadius: 5 },
  lbl:    { flex: 1, fontSize: 13 },
  amt:    { fontSize: 13, fontWeight: '600' },
});
