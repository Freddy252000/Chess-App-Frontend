import React from 'react';
import Svg, { G, Path, Circle } from 'react-native-svg';

export const ChessKing = ({ size = 48, color = '#1B4332' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 45 45">
    <G fillRule="evenodd" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M22.5 11.63V6M20 8h5" fill="none" />
      <Path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill={color} />
      <Path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V17s-5.5-4-10 .5c-5 5-2 11.5 6 11.5v8" fill={color} />
      <Path d="M11.5 30c5.5-3 15.5-3 21 0M11.5 33.5c5.5-3 15.5-3 21 0M11.5 37c5.5-3 15.5-3 21 0" stroke="#F0D9B5" fill="none" />
    </G>
  </Svg>
);

export const ChessKnight = ({ size = 48, color = '#1B4332' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 45 45">
    <G fillRule="evenodd" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill={color} />
      <Path d="M24 18c.38 5.12-4 7-12 7l1.5-7z" fill={color} />
    </G>
  </Svg>
);

export const ChessPawn = ({ size = 24, color = '#1B4332' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 45 45">
    <G fill={color} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={22.5} cy={9.5} r={4.5} />
      <Path d="M22.5 15.5c-4 0-6 2-6 6 0 2 .5 3.5 1.5 4.5h9c1-1 1.5-2.5 1.5-4.5 0-4-2-6-6-6z" />
      <Path d="M11.5 37v-1.5l1-1 1-1v-1l1-1 .5-.5 1-3h13l1 3 .5.5 1 1v1l1 1 1 1V37c0 .5-.5 1-1 1h-21c-.5 0-1-.5-1-1z" />
    </G>
  </Svg>
);
