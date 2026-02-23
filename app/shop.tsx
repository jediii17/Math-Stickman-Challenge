import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, useWindowDimensions } from 'react-native';
import Svg, { Path, Ellipse, Line, G, Circle, Rect } from 'react-native-svg';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useGameState, Accessory, PowerUps, AccessoryType } from '@/hooks/useGameState';
import Stickman from '@/components/Stickman';
import { useAuth } from '@/contexts/AuthContext';
import { useAudioPlayer } from 'expo-audio';
import * as db from '@/lib/db';
import { ShopItem } from '@/lib/db';
import StickmanCoin from '@/components/StickmanCoin';

// Shop items are now fetched from the database in the component body

// ─── Category definitions ───
type CategoryKey = 'hair' | 'face' | 'upper' | 'lower' | 'shoes' | 'back';

interface Category {
  key: CategoryKey;
  label: string;
  emoji: string;
  types: AccessoryType[];
}

const CATEGORIES: Category[] = [
  { key: 'hair', label: 'Head', emoji: '👒', types: ['hair'] },
  { key: 'face', label: 'Face', emoji: '👓', types: ['face'] },
  { key: 'upper', label: 'Upper', emoji: '👕', types: ['upper'] },
  { key: 'lower', label: 'Lower', emoji: '👖', types: ['lower'] },
  { key: 'shoes', label: 'Shoes', emoji: '👟', types: ['shoes'] },
  { key: 'back', label: 'Back', emoji: '🎒', types: ['back'] },
];

const AccessoryIcon = ({ id, color = Colors.primary }: { id: string, color?: string }) => {
  const size = 60;
  const sw = 1.5;
  
  if (id === 'hat-1') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 65) scale(1.5)">
          <Ellipse cx={0} cy={0} rx={22} ry={4} fill={color} />
          <Path
            d={`M-16.5,0 Q-16.5,-16 0,-17 Q16.5,-16 16.5,0 Z`}
            fill={color}
            stroke="#1976D2"
            strokeWidth={1}
          />
          <Line x1={-15} y1={-2} x2={15} y2={-2} stroke="#1976D2" strokeWidth={2} />
        </G>
      </Svg>
    );
  }
  
  if (id === 'hat-2') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 65) scale(1.5)">
          <Path d={`M-18,0 Q-18,-18 0,-18 Q18,-18 18,0 Z`} fill="#FF5722" stroke="#E64A19" strokeWidth={1} />
          <Path d={`M-18,0 L25,0`} stroke="#E64A19" strokeWidth={3} strokeLinecap="round" />
        </G>
      </Svg>
    );
  }

  if (id === 'hat-3') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 65) scale(1.5)">
          <Ellipse cx={0} cy={2} rx={26} ry={6} fill="#F06292" />
          <Path d={`M-15,0 Q-15,-20 0,-20 Q15,-20 15,0 Z`} fill="#F48FB1" stroke="#D81B60" strokeWidth={1} />
          <Line x1={-14} y1={-2} x2={14} y2={-2} stroke="#D81B60" strokeWidth={3} />
        </G>
      </Svg>
    );
  }

  if (id === 'hat-4') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 60) scale(1.6)">
          <Path d="M-15,5 Q-15,-5 0,-8 Q15,-5 15,5" fill="none" stroke="#FFD700" strokeWidth={2} />
          <Path d="M-12,2 Q-6,-6 0,-12 Q6,-6 12,2" fill="none" stroke="#FFD700" strokeWidth={2} />
          <Circle cx={0} cy={-12} r={3} fill="#F06292" stroke="#D81B60" strokeWidth={0.5} />
          <Path d="M-10,-5 L-8,-7 M-8,-5 L-10,-7" stroke="#FFD700" strokeWidth={1} />
          <Line x1={10} y1={-5} x2={8} y2={-7} stroke="#FFD700" strokeWidth={1} />
        </G>
      </Svg>
    );
  }
  
  // --- New Hair Styles ---
  if (id.startsWith('hair-')) {
    const cx = 50;
    const headCY = 45;
    const headR = 18;
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {id === 'hair-b1' && (
          <G>
            <Path d={`M${cx - headR * 1.1},${headCY} L${cx - headR * 1.0},${headCY - headR * 0.8} L${cx - headR * 0.6},${headCY - headR * 0.5} L${cx - headR * 0.2},${headCY - headR * 1.2} L${cx + headR * 0.2},${headCY - headR * 0.6} L${cx + headR * 0.8},${headCY - headR * 1.0} L${cx + headR * 1.1},${headCY} Q${cx},${headCY - headR * 0.5} ${cx - headR * 1.1},${headCY} Z`} fill="#2196F3" stroke="#1565C0" strokeLinejoin="round" />
          </G>
        )}
        {id === 'hair-b2' && (
          <G>
            <Path d={`M${cx - headR * 1.1},${headCY + headR * 0.2} Q${cx - headR * 1.1},${headCY - headR * 1.2} ${cx},${headCY - headR * 1.2} Q${cx + headR * 1.1},${headCY - headR * 1.2} ${cx + headR * 1.1},${headCY + headR * 0.2} Q${cx + headR * 0.5},${headCY - headR * 0.3} ${cx},${headCY - headR * 0.1} Q${cx - headR * 0.5},${headCY - headR * 0.3} ${cx - headR * 1.1},${headCY + headR * 0.2} Z`} fill="#795548" stroke="#5D4037" />
          </G>
        )}
        {id === 'hair-b3' && (
          <G>
             <Path d={`M${cx - headR * 1.1},${headCY} Q${cx - headR * 1.1},${headCY - headR * 1.3} ${cx + headR * 0.3},${headCY - headR * 1.2} Q${cx + headR * 1.1},${headCY - headR * 0.5} ${cx + headR * 1.1},${headCY + headR * 0.2} Q${cx + headR * 0.5},${headCY - headR * 0.5} ${cx - headR * 1.1},${headCY} Z`} fill="#263238" stroke="#000000" />
          </G>
        )}
        {id === 'hair-b4' && (
          <G>
            <Path d={`M${cx - headR * 0.9},${headCY} L${cx - headR * 0.9},${headCY - headR * 0.9} Q${cx},${headCY - headR * 1.3} ${cx + headR * 0.9},${headCY - headR * 0.9} L${cx + headR * 0.9},${headCY} Q${cx},${headCY - headR * 0.5} ${cx - headR * 0.9},${headCY} Z`} fill="#4CAF50" stroke="#388E3C" />
            <Path d={`M${cx - headR * 0.8},${headCY - headR * 0.3} L${cx + headR * 0.8},${headCY - headR * 0.3}`} stroke="#388E3C" strokeWidth={1} strokeDasharray="2,2" />
          </G>
        )}
        {id === 'hair-g1' && (
          <G>
            <Path d={`M${cx - headR * 0.9},${headCY - headR * 0.5} Q${cx - headR * 1.8},${headCY - headR * 1.2} ${cx - headR * 2.2},${headCY} Q${cx - headR * 1.5},${headCY - headR * 0.2} ${cx - headR * 0.9},${headCY - headR * 0.2} Z`} fill="#F48FB1" stroke="#D81B60" />
            <Path d={`M${cx + headR * 0.9},${headCY - headR * 0.5} Q${cx + headR * 1.8},${headCY - headR * 1.2} ${cx + headR * 2.2},${headCY} Q${cx + headR * 1.5},${headCY - headR * 0.2} ${cx + headR * 0.9},${headCY - headR * 0.2} Z`} fill="#F48FB1" stroke="#D81B60" />
            <Circle cx={cx - headR * 0.9} cy={headCY - headR * 0.35} r={headR * 0.2} fill="#00BCD4" />
            <Circle cx={cx + headR * 0.9} cy={headCY - headR * 0.35} r={headR * 0.2} fill="#00BCD4" />
            <Path d={`M${cx - headR * 1.05},${headCY} Q${cx - headR * 1.05},${headCY - headR * 1.2} ${cx},${headCY - headR * 1.2} Q${cx + headR * 1.05},${headCY - headR * 1.2} ${cx + headR * 1.05},${headCY} Q${cx},${headCY - headR * 0.5} ${cx - headR * 1.05},${headCY} Z`} fill="#F06292" stroke="#D81B60" />
          </G>
        )}
        {id === 'hair-g2' && (
          <G>
            <Path d={`M${cx - headR * 1.0},${headCY} Q${cx - headR * 1.0},${headCY - headR * 1.2} ${cx},${headCY - headR * 1.2} Q${cx + headR * 1.0},${headCY - headR * 1.2} ${cx + headR * 1.0},${headCY} Q${cx + headR * 1.3},${headCY + headR * 0.5} ${cx + headR * 1.0},${headCY + headR * 2.5} Q${cx + headR * 0.5},${headCY + headR * 1.5} ${cx + headR * 0.5},${headCY - headR * 0.3} Q${cx},${headCY - headR * 0.5} ${cx - headR * 0.5},${headCY - headR * 0.3} Q${cx - headR * 0.5},${headCY + headR * 1.5} ${cx - headR * 1.0},${headCY + headR * 2.5} Q${cx - headR * 1.3},${headCY + headR * 0.5} ${cx - headR * 1.0},${headCY} Z`} fill="#AB47BC" stroke="#8E24AA" />
          </G>
        )}
        {id === 'hair-g3' && (
          <G>
             <Path d={`M${cx - headR * 1.1},${headCY + headR} L${cx - headR * 1.1},${headCY - headR * 0.5} Q${cx - headR * 1.1},${headCY - headR * 1.3} ${cx},${headCY - headR * 1.3} Q${cx + headR * 1.1},${headCY - headR * 1.3} ${cx + headR * 1.1},${headCY - headR * 0.5} L${cx + headR * 1.1},${headCY + headR} Q${cx + headR * 0.5},${headCY} ${cx},${headCY - headR * 0.3} Q${cx - headR * 0.5},${headCY} ${cx - headR * 1.1},${headCY + headR} Z`} fill="#FFD54F" stroke="#FFB300" />
          </G>
        )}
        {id === 'hair-g4' && (
          <G>
            <Path d={`M${cx},${headCY - headR * 1.0} Q${cx + headR * 1.5},${headCY - headR * 2.5} ${cx + headR * 2.0},${headCY - headR * 0.5} Q${cx + headR * 1.0},${headCY - headR * 0.5} ${cx},${headCY - headR * 0.8} Z`} fill="#EF5350" stroke="#D32F2F" />
            <Path d={`M${cx - headR * 1.0},${headCY} Q${cx - headR * 1.0},${headCY - headR * 1.2} ${cx},${headCY - headR * 1.2} Q${cx + headR * 1.0},${headCY - headR * 1.2} ${cx + headR * 1.0},${headCY} Q${cx},${headCY - headR * 0.5} ${cx - headR * 1.0},${headCY} Z`} fill="#F44336" stroke="#D32F2F" />
            <Circle cx={cx} cy={headCY - headR * 0.9} r={headR * 0.2} fill="#FFEB3B" />
          </G>
        )}
        {id === 'hair-g5' && (
          <G>
            <Path d={`M${cx - headR * 1.05},${headCY} Q${cx - headR * 1.05},${headCY - headR * 1.2} ${cx},${headCY - headR * 1.2} Q${cx + headR * 1.05},${headCY - headR * 1.2} ${cx + headR * 1.05},${headCY} L${cx + headR * 1.05},${headCY + headR * 2.5} L${cx + headR * 0.5},${headCY + headR * 2.5} L${cx + headR * 0.5},${headCY - headR * 0.3} Q${cx},${headCY - headR * 0.6} ${cx - headR * 0.5},${headCY - headR * 0.3} L${cx - headR * 0.5},${headCY + headR * 2.5} L${cx - headR * 1.05},${headCY + headR * 2.5} Z`} fill="#212121" stroke="#000000" />
          </G>
        )}
        {id === 'hair-b5' && (
          <G>
            {/* Mohawk/Faux-hawk in orange */}
            <Path d={`M${cx - headR * 0.4},${headCY} Q${cx - headR * 0.4},${headCY - headR * 1.8} ${cx},${headCY - headR * 2.0} Q${cx + headR * 0.4},${headCY - headR * 1.8} ${cx + headR * 0.4},${headCY} Q${cx},${headCY - headR * 0.5} ${cx - headR * 0.4},${headCY} Z`} fill="#FF9800" stroke="#E65100" />
            {/* Side fade */}
            <Path d={`M${cx - headR * 1.0},${headCY} Q${cx - headR * 1.0},${headCY - headR * 0.8} ${cx - headR * 0.4},${headCY - headR * 0.6} L${cx - headR * 0.4},${headCY} Z`} fill="#FFB74D" stroke="#E65100" strokeWidth={0.5} />
            <Path d={`M${cx + headR * 1.0},${headCY} Q${cx + headR * 1.0},${headCY - headR * 0.8} ${cx + headR * 0.4},${headCY - headR * 0.6} L${cx + headR * 0.4},${headCY} Z`} fill="#FFB74D" stroke="#E65100" strokeWidth={0.5} />
          </G>
        )}
      </Svg>
    );
  }

  if (id === 'hat-robot') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.6)">
          <Path d={`M-15,-5 Q-15,-20 0,-20 Q15,-20 15,-5 L15,12 Q0,18 -15,12 Z`} fill="#37474F" stroke="#263238" strokeWidth={2} />
          <Path d={`M-12,-2 Q0,-5 12,-2 L10,8 Q0,10 -10,8 Z`} fill="#111" />
          <Path d={`M-8,2 L8,2`} stroke="#00E5FF" strokeWidth={3} strokeLinecap="round" />
          <Circle cx={-4} cy={2} r={3} fill="#FFF" />
          <Circle cx={4} cy={2} r={3} fill="#FFF" />
          <Line x1={0} y1={-20} x2={0} y2={-30} stroke="#90A4AE" strokeWidth={2} />
          <Circle cx={0} cy={-32} r={4} fill="#00E5FF" />
          <Rect x={-18} y={0} width={4} height={6} fill="#78909C" />
          <Rect x={14} y={0} width={4} height={6} fill="#78909C" />
        </G>
      </Svg>
    );
  }

  if (id === 'glasses-1') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.8)">
          <Circle cx={-12} cy={0} r={8} fill="rgba(54, 69, 79, 0.4)" stroke="#37474F" strokeWidth={sw} />
          <Circle cx={12} cy={0} r={8} fill="rgba(54, 69, 79, 0.4)" stroke="#37474F" strokeWidth={sw} />
          <Line x1={-4} y1={0} x2={4} y2={0} stroke="#37474F" strokeWidth={sw} />
          <Line x1={-20} y1={0} x2={-30} y2={-5} stroke="#37474F" strokeWidth={1} />
          <Line x1={20} y1={0} x2={30} y2={-5} stroke="#37474F" strokeWidth={1} />
        </G>
      </Svg>
    );
  }

  if (id === 'glasses-2') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.8)">
          <Path d={`M-20,-6 L-4,-6 L-4,6 L-20,6 Z`} fill="none" stroke="#2196F3" strokeWidth={sw} />
          <Path d={`M4,-6 L20,-6 L20,6 L4,6 Z`} fill="none" stroke="#2196F3" strokeWidth={sw} />
          <Line x1={-4} y1={0} x2={4} y2={0} stroke="#2196F3" strokeWidth={sw} />
        </G>
      </Svg>
    );
  }

  if (id === 'glasses-3') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.8)">
          <Circle cx={-12} cy={0} r={9} fill="none" stroke="#E91E63" strokeWidth={sw} />
          <Circle cx={12} cy={0} r={9} fill="none" stroke="#E91E63" strokeWidth={sw} />
          <Line x1={-3} y1={0} x2={3} y2={0} stroke="#E91E63" strokeWidth={sw} />
          <Path d={`M-20,-8 L-15,-13`} stroke="#E91E63" strokeWidth={1.5} strokeLinecap="round" />
          <Path d={`M20,-8 L15,-13`} stroke="#E91E63" strokeWidth={1.5} strokeLinecap="round" />
        </G>
      </Svg>
    );
  }
  
  // --- New Creative Face Accessories ---
  if (id === 'face-blush') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(2.5)">
          <Ellipse cx={-12} cy={5} rx={5} ry={3} fill="#FF8A80" opacity={0.7} />
          <Ellipse cx={12} cy={5} rx={5} ry={3} fill="#FF8A80" opacity={0.7} />
          <Path d="M -2,0 Q 0,2 2,0" fill="none" stroke="#FFA000" strokeWidth={1} />
        </G>
      </Svg>
    );
  }

  if (id === 'face-star') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.8)">
          <Path d={`M-10,-8 L-7,-3 L-2,-3 L-6,2 L-4,8 L-10,5 L-16,8 L-14,2 L-18,-3 L-13,-3 Z`} fill="#FFD700" stroke="#FFC107" strokeWidth={1} />
          <Path d={`M10,-8 L13,-3 L18,-3 L14,2 L16,8 L10,5 L4,8 L6,2 L2,-3 L7,-3 Z`} fill="#FFD700" stroke="#FFC107" strokeWidth={1} />
          <Line x1={-2} y1={0} x2={2} y2={0} stroke="#FFC107" strokeWidth={1} />
        </G>
      </Svg>
    );
  }

  if (id === 'face-bandaid') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(2.5) rotate(-15)">
          <Rect x={-8} y={-3} width={16} height={6} rx={2} fill="#FFCCBC" stroke="#D84315" strokeWidth={1} />
          <Rect x={-3} y={-3} width={6} height={6} fill="#FFAB91" />
          <Circle cx={-1} cy={-1} r={1} fill="#D84315" />
          <Circle cx={1} cy={1} r={1} fill="#D84315" />
        </G>
      </Svg>
    );
  }

  if (id === 'face-freckles') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
         <G transform="translate(50, 50) scale(2.5)">
          <Circle cx={-12} cy={0} r={1.5} fill="#8D6E63" />
          <Circle cx={-8} cy={2} r={2} fill="#8D6E63" />
          <Circle cx={-4} cy={1} r={1.2} fill="#8D6E63" />
          <Circle cx={12} cy={0} r={1.5} fill="#8D6E63" />
          <Circle cx={8} cy={2} r={2} fill="#8D6E63" />
          <Circle cx={4} cy={1} r={1.2} fill="#8D6E63" />
          <Circle cx={0} cy={-2} r={1.2} fill="#8D6E63" />
        </G>
      </Svg>
    );
  }

  if (id === 'face-cat') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(2.2)">
          <Path d={`M-3,0 L3,0 L0,4 Z`} fill="#F48FB1" />
          <Path d={`M0,4 Q-3,8 -6,6`} fill="none" stroke="#F48FB1" strokeWidth={1.5} />
          <Path d={`M0,4 Q3,8 6,6`} fill="none" stroke="#F48FB1" strokeWidth={1.5} />
          <Line x1={-4} y1={2} x2={-10} y2={-2} stroke="#000" strokeWidth={1} />
          <Line x1={-4} y1={4} x2={-10} y2={4} stroke="#000" strokeWidth={1} />
          <Line x1={-4} y1={6} x2={-10} y2={10} stroke="#000" strokeWidth={1} />
          <Line x1={4} y1={2} x2={10} y2={-2} stroke="#000" strokeWidth={1} />
          <Line x1={4} y1={4} x2={10} y2={4} stroke="#000" strokeWidth={1} />
          <Line x1={4} y1={6} x2={10} y2={10} stroke="#000" strokeWidth={1} />
        </G>
      </Svg>
    );
  }

  if (id === 'face-hero') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.6)">
          <Path d={`M-18,-6 Q-18,8 -8,6 Q0,2 8,6 Q18,8 18,-6 Q0,-10 -18,-6 Z`} fill="#000000" />
          <Circle cx={-10} cy={0} r={5} fill="#FFF" />
          <Circle cx={10} cy={0} r={5} fill="#FFF" />
        </G>
      </Svg>
    );
  }
  
  // --- New Creative Boy Shirts ---
  if (id === 'upper-b1') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.6)">
          <Path d={`M-10,-10 L-10,10 Q0,14 10,10 L10,-10 Z`} fill="#ECEFF1" stroke="#CFD8DC" />
          <Path d={`M-14,-6 L-10,-10 L-10,0 L-14,4 Z`} fill="#ECEFF1" stroke="#CFD8DC" />
          <Path d={`M14,-6 L10,-10 L10,0 L14,4 Z`} fill="#ECEFF1" stroke="#CFD8DC" />
          <Circle cx={0} cy={-2} r={3} fill="#2196F3" />
          <Line x1={-6} y1={5} x2={6} y2={5} stroke="#B0BEC5" strokeWidth={1} strokeDasharray="2,2" />
        </G>
      </Svg>
    );
  }

  if (id === 'upper-b2') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.7)">
          <Path d={`M-10,-8 L-10,8 Q0,12 10,8 L10,-8 Z`} fill="#8BC34A" stroke="#689F38" />
          <Path d={`M-3,-5 L0,-8 L3,-5 M-3,1 L0,-2 L3,1 M-3,7 L0,4 L3,7`} fill="none" stroke="#FFC107" strokeWidth={1.5} />
          <Path d={`M-10,8 L-6,11 L-2,8 L2,11 L6,8 L10,11`} fill="none" stroke="#689F38" strokeWidth={1} />
        </G>
      </Svg>
    );
  }

  if (id === 'upper-b3') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.6)">
          <Rect x={-10} y={-8} width={20} height={18} fill="#B0BEC5" stroke="#78909C" rx={2} />
          <Rect x={-16} y={-8} width={6} height={10} fill="#90A4AE" stroke="#607D8B" rx={1} />
          <Rect x={10} y={-8} width={6} height={10} fill="#90A4AE" stroke="#607D8B" rx={1} />
          <Circle cx={0} cy={1} r={4} fill="#00BCD4" stroke="#0097A7" />
          <Line x1={-6} y1={8} x2={6} y2={8} stroke="#78909C" strokeWidth={1.5} />
        </G>
      </Svg>
    );
  }

  if (id === 'upper-b4') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.8)">
          <Path d={`M-8,-8 L-8,8 Q0,11 8,8 L8,-8 Q0,-3 -8,-8 Z`} fill="#F44336" stroke="#D32F2F" />
          <Line x1={-6} y1={-6} x2={-6} y2={8} stroke="#FFF" strokeWidth={1.5} />
          <Line x1={6} y1={-6} x2={6} y2={8} stroke="#FFF" strokeWidth={1.5} />
          <Path d={`M-1,1 L1,-1 L1,6`} fill="none" stroke="#FFF" strokeWidth={2} strokeLinecap="round" />
        </G>
      </Svg>
    );
  }

  // --- New Creative Girl Shirts ---
  if (id === 'upper-g1') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.8)">
          <Circle cx={-10} cy={-6} r={4} fill="#F48FB1" stroke="#D81B60" />
          <Circle cx={10} cy={-6} r={4} fill="#F48FB1" stroke="#D81B60" />
          <Path d={`M-8,-8 L-6,8 L0,11 L6,8 L8,-8 Q0,-5 -8,-8 Z`} fill="#F06292" stroke="#D81B60" />
          <Path d={`M-6,8 L0,11 L6,8`} fill="none" stroke="#FFD700" strokeWidth={1} />
          <Line x1={0} y1={-5} x2={0} y2={11} stroke="#FFD700" strokeWidth={1} />
        </G>
      </Svg>
    );
  }

  if (id === 'upper-g2') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.6)">
          <Path d={`M-10,-8 L-15,-4 L-11,2 L-8,0`} fill="#B39DDB" stroke="#9575CD" />
          <Path d={`M10,-8 L15,-4 L11,2 L8,0`} fill="#B39DDB" stroke="#9575CD" />
          <Path d={`M-10,-8 L-10,10 Q0,14 10,10 L10,-8 Z`} fill="#E1BEE7" stroke="#CE93D8" />
          <Line x1={-10} y1={-2} x2={10} y2={-2} stroke="#FFCDD2" strokeWidth={2} />
          <Line x1={-10} y1={2} x2={10} y2={2} stroke="#FFF9C4" strokeWidth={2} />
          <Line x1={-10} y1={6} x2={10} y2={6} stroke="#C8E6C9" strokeWidth={2} />
          <Path d={`M0,-4 L1,-1 L4,-1 L2,1 L3,4 L0,2 L-3,4 L-2,1 L-4,-1 L-1,-1 Z`} fill="#FFF" transform="scale(0.8) translate(0, 5)" />
        </G>
      </Svg>
    );
  }

  if (id === 'upper-g3') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.8)">
          <Path d={`M-9,-6 L-9,6 Q0,10 9,6 L9,-6 Q0,-10 -9,-6 Z`} fill="#4DD0E1" stroke="#00BCD4" />
          <Path d={`M-6,0 Q-3,-3 0,0 Q-3,3 -6,0 Z`} fill="#B2EBF2" stroke="#00BCD4" strokeWidth={0.5} />
          <Path d={`M0,0 Q3,-3 6,0 Q3,3 0,0 Z`} fill="#B2EBF2" stroke="#00BCD4" strokeWidth={0.5} />
          <Circle cx={-3} cy={6} r={1} fill="#FFF" />
          <Circle cx={4} cy={7} r={1.5} fill="#FFF" />
        </G>
      </Svg>
    );
  }

  if (id === 'upper-g4') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.6)">
          <Path d={`M-10,-8 L-18,-4 L-15,3 L-10,0`} fill="#FFF" stroke="#E0E0E0" />
          <Path d={`M10,-8 L18,-4 L15,3 L10,0`} fill="#FFF" stroke="#E0E0E0" />
          <Path d={`M-10,-8 L-11,10 Q0,12 11,10 L10,-8 Z`} fill="#FFF" stroke="#E0E0E0" />
          <Line x1={-2} y1={-8} x2={-2} y2={10} stroke="#E0E0E0" strokeWidth={1} />
          <Circle cx={2} cy={-2} r={1.5} fill="#F06292" />
          <Circle cx={-6} cy={-2} r={1.5} fill="#F06292" />
          <Circle cx={2} cy={4} r={1.5} fill="#F06292" />
          <Circle cx={-6} cy={4} r={1.5} fill="#F06292" />
        </G>
      </Svg>
    );
  }

  // --- New Creative Boy Pants ---
  if (id === 'lower-b1') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.6)">
          <Path d={`M-8,0 L8,0 L10,12 L1,12 L0,5 L-1,12 L-10,12 Z`} fill="#795548" stroke="#5D4037" strokeWidth={1} />
          <Rect x={-11} y={4} width={5} height={6} fill="#8D6E63" stroke="#5D4037" rx={1} />
          <Rect x={6} y={4} width={5} height={6} fill="#8D6E63" stroke="#5D4037" rx={1} />
        </G>
      </Svg>
    );
  }

  if (id === 'lower-b2') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.6)">
          <Path d={`M-8,0 L8,0 L10,12 L1,12 L0,5 L-1,12 L-10,12 Z`} fill="#1E88E5" />
          <Path d={`M-8,0 L8,0 L10,8 L1,6 L0,3 L-1,6 L-10,8 Z`} fill="#E53935" stroke="#B71C1C" />
          <Rect x={-8} y={0} width={16} height={3} fill="#FDD835" />
        </G>
      </Svg>
    );
  }

  if (id === 'lower-b3') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.6)">
          <Rect x={-8} y={0} width={6} height={12} fill="#B0BEC5" stroke="#78909C" rx={1} />
          <Rect x={2} y={0} width={6} height={12} fill="#B0BEC5" stroke="#78909C" rx={1} />
          <Circle cx={-5} cy={6} r={2} fill="#00BCD4" />
          <Circle cx={5} cy={6} r={2} fill="#00BCD4" />
        </G>
      </Svg>
    );
  }

  if (id === 'lower-b4') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.6)">
          <Path d={`M-8,0 L8,0 L11,7 L8,12 L1,12 L0,5 L-1,12 L-8,12 L-11,7 Z`} fill="#212121" stroke="#000000" />
          <Line x1={-9} y1={8} x2={-3} y2={10} stroke="#E53935" strokeWidth={1.5} />
          <Line x1={9} y1={8} x2={3} y2={10} stroke="#E53935" strokeWidth={1.5} />
          <Rect x={-8} y={0} width={16} height={2} fill="#E53935" />
        </G>
      </Svg>
    );
  }

  // --- New Creative Girl Pants/Skirts ---
  if (id === 'lower-g1') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.5)">
          <Path d={`M-8,0 Q-16,6 -12,18 Q-4,10 0,14 Q0,5 0,0`} fill="#FCE4EC" stroke="#F48FB1" />
          <Path d={`M0,0 Q0,5 0,14 Q4,10 12,18 Q16,6 8,0`} fill="#FCE4EC" stroke="#F48FB1" />
          <Path d={`M-4,0 Q-10,10 -2,20 Q0,10 2,20 Q10,10 4,0`} fill="#F8BBD0" stroke="#F06292" opacity={0.8} />
          <Rect x={-8} y={0} width={16} height={3} fill="#81C784" />
        </G>
      </Svg>
    );
  }

  if (id === 'lower-g2') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.6)">
          <Path d={`M-8,0 L8,0 L10,15 L1,15 L0,5 L-1,15 L-10,15 Z`} fill="#E1BEE7" />
          <Line x1={-9} y1={3} x2={9} y2={3} stroke="#FFCDD2" strokeWidth={2} />
          <Line x1={-9.5} y1={7} x2={9.5} y2={7} stroke="#FFE082" strokeWidth={2} />
          <Line x1={-10} y1={11} x2={10} y2={11} stroke="#C8E6C9" strokeWidth={2} />
          <Line x1={-10.5} y1={15} x2={10.5} y2={15} stroke="#BBDEFB" strokeWidth={2} />
        </G>
      </Svg>
    );
  }

  if (id === 'lower-g3') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.5)">
          <Path d={`M-8,0 Q-12,8 -2,15 L2,15 Q12,8 8,0 Z`} fill="#4DD0E1" stroke="#00BCD4" />
          <Path d={`M-4,3 Q0,6 4,3 M-5,7 Q0,10 5,7 M-4,11 Q0,14 4,11`} fill="none" stroke="#26C6DA" strokeWidth={1} />
        </G>
      </Svg>
    );
  }

  if (id === 'lower-g4') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.5)">
          <Path d={`M-8,0 Q-14,6 -10,15 L-1,15 L0,5 L1,15 L10,15 Q14,6 8,0 Z`} fill="#FFF" stroke="#BDBDBD" />
          <Line x1={-8} y1={0} x2={-10} y2={15} stroke="#E0E0E0" />
          <Line x1={-4} y1={0} x2={-3} y2={15} stroke="#E0E0E0" />
          <Line x1={4} y1={0} x2={3} y2={15} stroke="#E0E0E0" />
          <Line x1={8} y1={0} x2={10} y2={15} stroke="#E0E0E0" />
          <Line x1={-11} y1={5} x2={11} y2={5} stroke="#E0E0E0" />
          <Line x1={-11} y1={10} x2={11} y2={10} stroke="#E0E0E0" />
        </G>
      </Svg>
    );
  }

  // --- New Creative Boys Shoes ---
  if (id === 'shoes-b1') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.6)">
          <Path d={`M-10,-5 L-10,12 L10,12 L10,2 L4,-5 Z`} fill="#B0BEC5" stroke="#78909C" strokeWidth={1} />
          <Rect x={-6} y={12} width={12} height={6} fill="#455A64" />
          <Path d={`M-3,18 L0,25 L3,18 Z`} fill="#FF5722" />
        </G>
      </Svg>
    );
  }

  if (id === 'shoes-b2') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.6)">
          <Path d={`M-10,-2 L-10,10 L12,10 L12,4 L4,-2 Z`} fill="#F44336" stroke="#D32F2F" strokeWidth={1} />
          <Path d={`M-6,10 L-4,15 L-2,10 M2,10 L4,15 L6,10`} fill="none" stroke="#FFF" strokeWidth={1.5} />
        </G>
      </Svg>
    );
  }

  if (id === 'shoes-b3') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.5)">
          <Rect x={-12} y={2} width={24} height={10} rx={2} fill="#546E7A" stroke="#37474F" strokeWidth={1.5} />
          <Line x1={-6} y1={2} x2={-6} y2={12} stroke="#37474F" strokeWidth={1.5} />
          <Line x1={0} y1={2} x2={0} y2={12} stroke="#37474F" strokeWidth={1.5} />
          <Line x1={6} y1={2} x2={6} y2={12} stroke="#37474F" strokeWidth={1.5} />
          <Circle cx={0} cy={7} r={3} fill="#00E5FF" />
        </G>
      </Svg>
    );
  }

  if (id === 'shoes-b4') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.6)">
          <Path d={`M-10,-5 L-10,10 L12,10 L12,4 L4,-5 Z`} fill="#212121" stroke="#000000" strokeWidth={1} />
          <Line x1={6} y1={4} x2={6} y2={10} stroke="#000" strokeWidth={1.5} />
          <Line x1={-10} y1={0} x2={2} y2={0} stroke="#E53935" strokeWidth={2} />
        </G>
      </Svg>
    );
  }

  // --- New Creative Girls Shoes ---
  if (id === 'shoes-g1') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.5)">
          <Path d={`M-8,-4 L-8,10 L12,10 L12,2 L4,-4 Z`} fill="#F06292" stroke="#D81B60" strokeWidth={1} />
          <Circle cx={-4} cy={14} r={3.5} fill="#4DD0E1" />
          <Circle cx={8} cy={14} r={3.5} fill="#4DD0E1" />
        </G>
      </Svg>
    );
  }

  if (id === 'shoes-g2') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.7)">
          <Path d={`M-4,0 Q-15,5 -18,10 Q0,8 18,10 Q15,5 4,0 Z`} fill="#26C6DA" stroke="#00ACC1" strokeWidth={1} />
          <Line x1={0} y1={3} x2={-10} y2={8} stroke="#00ACC1" strokeWidth={1} />
          <Line x1={0} y1={3} x2={10} y2={8} stroke="#00ACC1" strokeWidth={1} />
        </G>
      </Svg>
    );
  }

  if (id === 'shoes-g3') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.7)">
          <Ellipse cx={2} cy={6} rx={12} ry={6} fill="#FFF" stroke="#E0E0E0" />
          <Ellipse cx={10} cy={0} rx={3} ry={6} fill="#FFF" stroke="#E0E0E0" transform="rotate(15 10 0)" />
          <Ellipse cx={4} cy={-1} rx={3} ry={6} fill="#FFF" stroke="#E0E0E0" transform="rotate(-15 4 -1)" />
          <Circle cx={10} cy={6} r={2} fill="#000" />
          <Circle cx={12} cy={8} r={1.5} fill="#F48FB1" />
        </G>
      </Svg>
    );
  }

  if (id === 'shoes-g4') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.7)">
          <Path d={`M-8,8 Q2,4 12,9 Q12,12 -8,12 Z`} fill="#F8BBD0" stroke="#F06292" />
          <Line x1={-6} y1={0} x2={3} y2={6} stroke="#F06292" strokeWidth={1.5} />
          <Line x1={3} y1={0} x2={-6} y2={6} stroke="#F06292" strokeWidth={1.5} />
        </G>
      </Svg>
    );
  }

  if (id === 'shirt-1') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 45) scale(1.5)">
          <Path
            d={`M-12,-15 L-25,18 Q0,25 25,18 L12,-15 Z`}
            fill="rgba(231, 76, 60, 0.4)"
            stroke={Colors.error}
            strokeWidth={1.5}
          />
          <Circle cx={0} cy={-13} r={3} fill={Colors.secondary} stroke="#E57373" strokeWidth={1} />
        </G>
      </Svg>
    );
  }

  if (id === 'back-2') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.3)">
          <Path d="M-20,-30 L20,30" stroke="#7F8C8D" strokeWidth={3} strokeLinecap="round" />
          <Path d="M20,-30 L-20,30" stroke="#7F8C8D" strokeWidth={3} strokeLinecap="round" />
          <Path d="M-20,-30 L-14,-22" stroke="#2C3E50" strokeWidth={5} strokeLinecap="round" />
          <Path d="M20,-30 L14,-22" stroke="#2C3E50" strokeWidth={5} strokeLinecap="round" />
          <Circle cx={-20} cy={-30} r={2} fill="#F1C40F" />
          <Circle cx={20} cy={-30} r={2} fill="#F1C40F" />
        </G>
      </Svg>
    );
  }

  if (id === 'back-3') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.2)">
          <Rect x={-15} y={-15} width={30} height={35} rx={5} fill="#8D6E63" stroke="#5D4037" strokeWidth={1} />
          <Rect x={-15} y={-5} width={30} height={4} fill="#5D4037" />
          <Rect x={-15} y={10} width={30} height={4} fill="#5D4037" />
          <Path d="M-10,-15 L-10,20 M10,-15 L10,20" stroke="rgba(0,0,0,0.3)" strokeWidth={3} />
        </G>
      </Svg>
    );
  }

  if (id === 'back-4') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.4)">
          <Path d="M0,0 Q-25,-30 -40,-10 Q-35,10 0,5 Z" fill="rgba(255,255,255,0.8)" stroke="#BDC3C7" strokeWidth={1} />
          <Path d="M0,0 Q25,-30 40,-10 Q35,10 0,5 Z" fill="rgba(255,255,255,0.8)" stroke="#BDC3C7" strokeWidth={1} />
        </G>
      </Svg>
    );
  }

  if (id === 'back-5') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.3)">
          <Rect x={-12} y={-15} width={24} height={30} rx={2} fill="#7F8C8D" />
          <Rect x={-8} y={15} width={6} height={10} fill="#E67E22" />
          <Rect x={2} y={15} width={6} height={10} fill="#E67E22" />
          <Path d="M-8,25 L-5,32 L-2,25 Z" fill="#E74C3C" />
          <Path d="M2,25 L5,32 L8,25 Z" fill="#E74C3C" />
        </G>
      </Svg>
    );
  }

  if (id === 'back-6') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.2)">
          <Path d="M0,0 Q-30,-40 -45,-15 Q-40,10 0,5 Z" fill="#F48FB1" stroke="#D81B60" strokeWidth={1.5} />
          <Path d="M0,0 Q-25,40 -40,25 Q-35,10 0,5 Z" fill="#F48FB1" stroke="#D81B60" strokeWidth={1.5} />
          <Path d="M0,0 Q30,-40 45,-15 Q40,10 0,5 Z" fill="#F48FB1" stroke="#D81B60" strokeWidth={1.5} />
          <Path d="M0,0 Q25,40 40,25 Q35,10 0,5 Z" fill="#F48FB1" stroke="#D81B60" strokeWidth={1.5} />
          <Circle cx={-30} cy={-15} r={3} fill="#fff" opacity={0.6} />
          <Circle cx={30} cy={-15} r={3} fill="#fff" opacity={0.6} />
        </G>
      </Svg>
    );
  }

  // --- New Creative Boys Backs ---
  if (id === 'back-b1') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 40) scale(1.3)">
          <Path
            d={`M-10,-10 L-25,25 Q0,35 25,25 L10,-10 Z`}
            fill="rgba(33, 150, 243, 0.8)"
            stroke="#1976D2"
            strokeWidth={1.5}
          />
        </G>
      </Svg>
    );
  }

  if (id === 'back-b2') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 55) scale(1.2)">
          <Path d={`M0,-5 Q-40,-35 -55,-10 L-40,-5 L-45,15 L-25,5 Z`} fill="#4CAF50" stroke="#388E3C" strokeWidth={1.5} />
          <Path d={`M0,-5 Q40,-35 55,-10 L40,-5 L45,15 L25,5 Z`} fill="#4CAF50" stroke="#388E3C" strokeWidth={1.5} />
          <Path d={`M0,-5 Q-15,-20 -55,-10`} fill="none" stroke="#2E7D32" strokeWidth={2} />
          <Path d={`M0,-5 Q15,-20 55,-10`} fill="none" stroke="#2E7D32" strokeWidth={2} />
        </G>
      </Svg>
    );
  }

  if (id === 'back-b3') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.3)">
          <Circle cx={0} cy={0} r={22} fill="#263238" stroke="#00E5FF" strokeWidth={3} />
          <Circle cx={0} cy={0} r={14} fill="none" stroke="#00E5FF" strokeWidth={1.5} />
          <Circle cx={0} cy={0} r={6} fill="#00E5FF" />
          <Path d={`M0,-22 L0,-10 M0,10 L0,22`} stroke="#00E5FF" strokeWidth={2} />
          <Path d={`M-22,0 L-10,0 M10,0 L22,0`} stroke="#00E5FF" strokeWidth={2} />
        </G>
      </Svg>
    );
  }

  if (id === 'back-b4') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.4)">
          <Path d={`M-10,-10 L5,20 L15,15 L0,-15 Z`} fill="#795548" stroke="#5D4037" strokeWidth={1.5} />
          <Path d={`M-10,-10 L0,-15`} stroke="#3E2723" strokeWidth={4} strokeLinecap="round" />
          <Path d={`M5,20 L15,15`} stroke="#3E2723" strokeWidth={4} strokeLinecap="round" />
          <Line x1={-5} y1={-13} x2={-15} y2={-30} stroke="#D7CCC8" strokeWidth={2} />
          <Line x1={-1} y1={-14} x2={-8} y2={-33} stroke="#D7CCC8" strokeWidth={2} />
          <Line x1={3} y1={-13} x2={-2} y2={-31} stroke="#D7CCC8" strokeWidth={2} />
          <Path d={`M-15,-30 L-20,-25 M-15,-30 L-10,-35`} stroke="#FF5252" strokeWidth={2} />
          <Path d={`M-8,-33 L-13,-28 M-8,-33 L-3,-38`} stroke="#FF5252" strokeWidth={2} />
          <Path d={`M-2,-31 L-7,-26 M-2,-31 L3,-36`} stroke="#FF5252" strokeWidth={2} />
        </G>
      </Svg>
    );
  }

  // --- New Creative Girls Backs ---
  if (id === 'back-g1') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.3)">
          <Path d={`M0,0 Q-30,-45 -45,-20 Q-30,5 0,0 Z`} fill="rgba(224, 64, 251, 0.4)" stroke="#E040FB" strokeWidth={1.5} />
          <Path d={`M0,0 Q30,-45 45,-20 Q30,5 0,0 Z`} fill="rgba(224, 64, 251, 0.4)" stroke="#E040FB" strokeWidth={1.5} />
          <Path d={`M0,5 Q-25,35 -35,20 Q-20,10 0,5 Z`} fill="rgba(0, 229, 255, 0.4)" stroke="#00E5FF" strokeWidth={1.5} />
          <Path d={`M0,5 Q25,35 35,20 Q20,10 0,5 Z`} fill="rgba(0, 229, 255, 0.4)" stroke="#00E5FF" strokeWidth={1.5} />
          <Circle cx={-25} cy={-15} r={1.5} fill="#FFF" />
          <Circle cx={25} cy={-15} r={1.5} fill="#FFF" />
          <Circle cx={-15} cy={20} r={1.5} fill="#FFF" />
          <Circle cx={15} cy={20} r={1.5} fill="#FFF" />
        </G>
      </Svg>
    );
  }

  if (id === 'back-g2') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 45) scale(1.3)">
          <Path d={`M0,0 Q-35,-25 -40,0 Q-35,25 0,0 Z`} fill="#E91E63" stroke="#C2185B" strokeWidth={2} />
          <Path d={`M0,0 Q35,-25 40,0 Q35,25 0,0 Z`} fill="#E91E63" stroke="#C2185B" strokeWidth={2} />
          <Path d={`M0,5 Q-10,25 -20,40 L-10,35 L0,5 Z`} fill="#D81B60" stroke="#AD1457" strokeWidth={1.5} />
          <Path d={`M0,5 Q10,25 20,40 L10,35 L0,5 Z`} fill="#D81B60" stroke="#AD1457" strokeWidth={1.5} />
          <Circle cx={0} cy={0} r={8} fill="#F06292" stroke="#C2185B" strokeWidth={1.5} />
        </G>
      </Svg>
    );
  }

  if (id === 'back-g3') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 40) scale(1.3)">
          <Path
            d={`M-12,-5 L-28,25 L0,30 L28,25 L12,-5 Z`}
            fill="#673AB7"
            stroke="#512DA8"
            strokeWidth={1.5}
          />
          <Path d={`M-12,12 L-10,16 L-6,16 L-9,18 L-8,22 L-12,20 L-16,22 L-15,18 L-18,16 L-14,16 Z`} fill="#FFEB3B" />
          <Path d={`M10,18 L12,22 L16,22 L13,24 L14,28 L10,26 L6,28 L7,24 L4,22 L8,22 Z`} fill="#FFEB3B" transform="scale(0.7) translate(15, -10)" />
        </G>
      </Svg>
    );
  }

  if (id === 'back-g4') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.4)">
          <Rect x={-14} y={-10} width={28} height={24} rx={8} fill="#8D6E63" stroke="#5D4037" strokeWidth={1.5} />
          <Circle cx={-10} cy={-12} r={5} fill="#8D6E63" stroke="#5D4037" strokeWidth={1.5} />
          <Circle cx={-10} cy={-12} r={2.5} fill="#D7CCC8" />
          <Circle cx={10} cy={-12} r={5} fill="#8D6E63" stroke="#5D4037" strokeWidth={1.5} />
          <Circle cx={10} cy={-12} r={2.5} fill="#D7CCC8" />
          <Circle cx={-5} cy={-2} r={2} fill="#3E2723" />
          <Circle cx={5} cy={-2} r={2} fill="#3E2723" />
          <Ellipse cx={0} cy={3} rx={4} ry={3} fill="#D7CCC8" />
          <Circle cx={0} cy={2} r={1.5} fill="#3E2723" />
          <Path d={`M-2,4 Q0,6 2,4`} fill="none" stroke="#3E2723" strokeWidth={1} />
        </G>
      </Svg>
    );
  }

  if (id === 'shirt-2') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 45) scale(1.5)">
          <Path d={`M-12,-18 L-22,-8 L-16,-2 L-10,-6 L-10,5 L10,5 L10,-6 L16,-2 L22,-8 L12,-18 Z`} fill="#4CAF50" stroke="#388E3C" strokeWidth={1} />
        </G>
      </Svg>
    );
  }

  if (id === 'shirt-3') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 45) scale(1.5)">
          <Path d={`M-10,-18 L-25,-5 L-20,2 L-8,-8`} fill="#9C27B0" stroke="#7B1FA2" strokeWidth={1} />
          <Path d={`M10,-18 L25,-5 L20,2 L8,-8`} fill="#9C27B0" stroke="#7B1FA2" strokeWidth={1} />
          <Path d={`M-10,-18 L-15,5 L15,5 L10,-18 Z`} fill="#9C27B0" stroke="#7B1FA2" strokeWidth={1} />
        </G>
      </Svg>
    );
  }

  if (id === 'shirt-4') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 45) scale(1.5)">
          <Path d="M-8,-14 L-15,-8 L-12,-3 L-6,-8" fill="#F8BBD0" stroke="#F06292" strokeWidth={1} />
          <Path d="M8,-14 L15,-8 L12,-3 L6,-8" fill="#F8BBD0" stroke="#F06292" strokeWidth={1} />
          <Path d={`M-10,-15 L-10,10 Q0,15 10,10 L10,-15 Z`} fill="#F8BBD0" stroke="#F06292" strokeWidth={1} />
        </G>
      </Svg>
    );
  }

  if (id === 'shirt-5') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 60) scale(1.5)">
          <Path d={`M-12,0 L12,0 L20,15 Q0,20 -20,15 Z`} fill="#F06292" stroke="#D81B60" strokeWidth={1} />
          <Path d="M-15,8 Q-7,10 0,8 Q7,10 15,8" fill="none" stroke="#D81B60" strokeWidth={1} opacity={0.5} />
        </G>
      </Svg>
    );
  }

  if (id === 'lower-1') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.8)">
          <Path d={`M-10,0 L10,0 L12,15 L2,15 L0,5 L-2,15 L-12,15 Z`} fill="#1976D2" stroke="#0D47A1" strokeWidth={1} />
        </G>
      </Svg>
    );
  }

  if (id === 'lower-2') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 55) scale(1.6)">
          <Path d={`M-10,0 L10,0 L18,20 Q0,26 -18,20 Z`} fill="#9C27B0" stroke="#7B1FA2" strokeWidth={1} />
          <Rect x={-10} y={0} width={20} height={3} fill="#F06292" rx={1} />
        </G>
      </Svg>
    );
  }

  if (id === 'lower-3') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 55) scale(1.6)">
          {/* Purple Pleated Skirt */}
          <Path d={`M-12,0 L12,0 L22,22 Q0,28 -22,22 Z`} fill="#673AB7" stroke="#512DA8" strokeWidth={1} />
          <Line x1={-15} y1={5} x2={-18} y2={20} stroke="#512DA8" strokeWidth={1} opacity={0.6} />
          <Line x1={-5} y1={5} x2={-6} y2={24} stroke="#512DA8" strokeWidth={1} opacity={0.6} />
          <Line x1={5} y1={5} x2={6} y2={24} stroke="#512DA8" strokeWidth={1} opacity={0.6} />
          <Line x1={15} y1={5} x2={18} y2={20} stroke="#512DA8" strokeWidth={1} opacity={0.6} />
        </G>
      </Svg>
    );
  }

  if (id === 'lower-4') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.8)">
          {/* Camo Shorts */}
          <Path d={`M-10,0 L10,0 L12,18 L2,18 L0,8 L-2,18 L-12,18 Z`} fill="#556B2F" stroke="#3D4F1F" strokeWidth={1} />
          {/* Camo spots */}
          <Circle cx={-6} cy={6} r={3} fill="#8B4513" opacity={0.5} />
          <Circle cx={6} cy={12} r={2.5} fill="#2F4F4F" opacity={0.5} />
        </G>
      </Svg>
    );
  }
  
  if (id === 'shoes-1') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.8)">
          <Path d={`M-25,10 L-25,-5 L-12,-5 L-10,-12 L-30,-12 Z`} fill="#37474F" stroke="#263238" strokeWidth={1} />
          <Path d={`M25,10 L25,-5 L12,-5 L10,-12 L30,-12 Z`} fill="#37474F" stroke="#263238" strokeWidth={1} />
        </G>
      </Svg>
    );
  }

  if (id === 'shoes-2') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.5)">
          <Path d={`M-25,15 L-25,2 L-10,2 L-8,-5 L-30,-5 Z`} fill="#2196F3" stroke="#1976D2" strokeWidth={1} />
          <Circle cx={-18} cy={8} r={3} fill="#fff" />
          <Path d={`M25,15 L25,2 L10,2 L8,-5 L30,-5 Z`} fill="#2196F3" stroke="#1976D2" strokeWidth={1} />
          <Circle cx={18} cy={8} r={3} fill="#fff" />
        </G>
      </Svg>
    );
  }

  if (id === 'shoes-3') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.5)">
          <Path d={`M-22,15 L-22,5 Q-15,5 -12,15 Z`} fill="#E91E63" />
          <Line x1={-22} y1={8} x2={-15} y2={8} stroke="#fff" strokeWidth={1.5} />
          <Path d={`M22,15 L22,5 Q15,5 12,15 Z`} fill="#E91E63" />
          <Line x1={22} y1={8} x2={15} y2={8} stroke="#fff" strokeWidth={1.5} />
        </G>
      </Svg>
    );
  }

  return <Ionicons name="shirt-outline" size={32} color={color} />;
};

export default function ShopScreen() {
  const [activeTab, setActiveTab] = React.useState<'character' | 'magic'>('character');
  const [activeCategory, setActiveCategory] = React.useState<CategoryKey>('hair');
  const [trialItem, setTrialItem] = React.useState<{ id: string; type: AccessoryType } | null>(null);
  const [dbItems, setDbItems] = React.useState<ShopItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setIsLoading(true);
    const items = await db.getShopItems();
    setDbItems(items);
    setIsLoading(false);
  };

  const purchasePlayer = useAudioPlayer(require('@/assets/sounds/purchase.mp3'));
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { coins, ownedAccessories, buyAccessory, equipAccessory, equippedAccessories, buyAccessoryForUser, equipAccessoryForUser, powerUps, buyPowerUp, buyPowerUpForUser } = useGameState();
  const { user, isGuest } = useAuth();

  // Build preview overrides from trial item
  const previewOverrides: Partial<Record<AccessoryType, string | null>> | undefined = trialItem
    ? { [trialItem.type]: trialItem.id }
    : undefined;

  // Filter items by active category
  const categoryDef = CATEGORIES.find(c => c.key === activeCategory)!;
  const filteredItems = dbItems.filter(item => !item.is_magic && categoryDef.types.includes(item.type as AccessoryType));
  const magicItemsList = dbItems.filter(item => item.is_magic);

  const handleTryItem = (item: ShopItem) => {
    // Toggle trial: if same item, clear; otherwise set
    if (trialItem?.id === item.id) {
      setTrialItem(null);
    } else {
      setTrialItem({ id: item.id, type: item.type as AccessoryType });
    }
  };

  const handleBuyTrialItem = async () => {
    if (!trialItem) return;
    const item = dbItems.find(i => i.id === trialItem.id);
    if (!item) return;
    if (coins < item.price) return;

    purchasePlayer.seekTo(0);
    purchasePlayer.play();

    if (!isGuest && user) {
      await buyAccessoryForUser(user.id, item as unknown as Accessory);
    } else {
      buyAccessory(item as unknown as Accessory);
    }
    // After buying, auto-equip and clear trial
    if (!isGuest && user) {
      await equipAccessoryForUser(user.id, item.type as AccessoryType, item.id);
    } else {
      equipAccessory(item.type as AccessoryType, item.id);
    }
    setTrialItem(null);
  };

  const handleCategoryChange = (key: CategoryKey) => {
    setActiveCategory(key);
    setTrialItem(null); // Clear trial when switching categories
  };

  const renderItem = ({ item }: { item: ShopItem }) => {
    const isOwned = ownedAccessories.includes(item.id);
    const isEquipped = Object.values(equippedAccessories).includes(item.id);
    const isTrying = trialItem?.id === item.id;

    return (
      <View style={[styles.itemCard, isTrying && styles.itemCardTrial]}>
        <View style={[styles.itemIcon, { backgroundColor: isTrying ? 'rgba(46, 204, 113, 0.15)' : 'rgba(46, 204, 113, 0.06)' }]}>
          <AccessoryIcon id={item.id} color={Colors.primary} />
        </View>
        <Text style={styles.itemName}>{item.name}</Text>
        {!isOwned && (
          <View style={styles.priceRow}>
            <StickmanCoin size={15} animated={false} />
            <Text style={styles.itemPrice}>{item.price}</Text>
          </View>
        )}
        {isOwned ? (
          <Pressable
            style={[styles.actionBtn, isEquipped ? styles.equippedBtn : styles.equipBtn]}
            onPress={async () => {
              if (!isGuest && user) {
                await equipAccessoryForUser(user.id, item.type as AccessoryType, isEquipped ? null : item.id);
              } else {
                equipAccessory(item.type as AccessoryType, isEquipped ? null : item.id);
              }
            }}
          >
            <Ionicons name={isEquipped ? 'checkmark-circle' : 'add-circle-outline'} size={16} color="#fff" />
            <Text style={styles.actionBtnText}>{isEquipped ? 'Equipped' : 'Equip'}</Text>
          </Pressable>
        ) : (
          <View style={styles.dualBtnRow}>
            <Pressable
              style={[styles.actionBtn, styles.tryBtnHalf, isTrying && styles.tryingBtn]}
              onPress={() => handleTryItem(item)}
            >
              <Ionicons name={isTrying ? 'eye' : 'eye-outline'} size={14} color="#fff" />
              <Text style={styles.actionBtnText}>{isTrying ? 'Trying' : 'Try'}</Text>
            </Pressable>
            <Pressable
              style={[styles.actionBtn, styles.buyBtnHalf]}
              onPress={async () => {
                if (coins >= item.price) {
                  purchasePlayer.seekTo(0);
                  purchasePlayer.play();
                  if (!isGuest && user) {
                    await buyAccessoryForUser(user.id, item as unknown as Accessory);
                    await equipAccessoryForUser(user.id, item.type as AccessoryType, item.id);
                  } else {
                    buyAccessory(item as unknown as Accessory);
                    equipAccessory(item.type as AccessoryType, item.id);
                  }
                  if (trialItem?.id === item.id) setTrialItem(null);
                }
              }}
            >
              <Ionicons name="cart-outline" size={14} color="#fff" />
              <Text style={styles.actionBtnText}>Buy</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  const renderMagicItem = ({ item }: { item: ShopItem }) => {
    const quantity = powerUps[item.id as keyof PowerUps] || 0;

    return (
      <View style={styles.itemCard}>
        <View style={[styles.itemIcon, { backgroundColor: `${item.color}1A` }]}>
          <Ionicons name={item.icon as any} size={32} color={item.color} />
        </View>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.priceRow}>
          <StickmanCoin size={16} animated={false} />
          <Text style={styles.itemPrice}>{item.price}</Text>
        </View>
        <View style={styles.inventoryRow}>
          <Text style={styles.inventoryText}>Owned: {quantity}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.actionBtn,
            styles.buyBtn,
            pressed && { opacity: 0.8 }
          ]}
          onPress={async () => {
            if (coins >= item.price) {
              purchasePlayer.seekTo(0);
              purchasePlayer.play();
              if (!isGuest && user) {
                await buyPowerUpForUser(user.id, item.id as keyof PowerUps, item.price);
              } else {
                buyPowerUp(item.id as keyof PowerUps, item.price);
              }
            }
          }}
        >
          <Ionicons name="cart-outline" size={18} color="#fff" />
          <Text style={styles.actionBtnText}>Buy One</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.title}>Shop</Text>
        <View style={styles.coinBadge}>
          <StickmanCoin size={18} />
          <Text style={styles.coinText}>{coins.toLocaleString()}</Text>
        </View>
      </View>

      {/* ── Top-level tabs ── */}
      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, activeTab === 'character' && styles.activeTab]}
          onPress={() => { setActiveTab('character'); setTrialItem(null); }}
        >
          <Text style={[styles.tabText, activeTab === 'character' && styles.activeTabText]}>Character</Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'magic' && styles.activeTab]}
          onPress={() => { setActiveTab('magic'); setTrialItem(null); }}
        >
          <Text style={[styles.tabText, activeTab === 'magic' && styles.activeTabText]}>Magic Items</Text>
        </Pressable>
      </View>

      {/* ── Character tab content ── */}
      {activeTab === 'character' && (
        <>
          {/* Preview area with trial badge */}
          <View style={[styles.previewArea, trialItem && styles.previewAreaTrial]}>
            <Stickman wrongCount={0} size={Math.min(Math.round(screenWidth * 0.38), 150)} previewOverrides={previewOverrides} />
            {trialItem && (
              <View style={styles.trialBadge}>
                <Ionicons name="eye" size={12} color={Colors.primary} />
                <Text style={styles.trialBadgeText}>Previewing</Text>
              </View>
            )}
          </View>

          {/* Category bar */}
          <View style={styles.categoryBar}>
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.key;
              const count = dbItems.filter((i: ShopItem) => !i.is_magic && cat.types.includes(i.type as AccessoryType)).length;
              return (
                <Pressable
                  key={cat.key}
                  style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                  onPress={() => handleCategoryChange(cat.key)}
                >
                  <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                  <Text style={[styles.categoryPillText, isActive && styles.categoryPillTextActive]}>
                    {cat.label}
                  </Text>
                  <View style={[styles.categoryCountBadge, isActive && styles.categoryCountBadgeActive]}>
                    <Text style={[styles.categoryCountText, isActive && styles.categoryCountTextActive]}>{count}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </>
      )}

      {isGuest && (
        <View style={styles.guestBanner}>
          <Ionicons name="information-circle" size={16} color={Colors.secondary} />
          <Text style={styles.guestBannerText}>Login to sync across devices!</Text>
        </View>
      )}

      {/* ── Item grid ── */}
        {activeTab === 'character' ? (
          <FlatList
            data={filteredItems}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            numColumns={2}
            contentContainerStyle={styles.itemList}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={styles.columnWrapper}
            ListEmptyComponent={
              isLoading ? <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} /> : null
            }
          />
        ) : (
          <FlatList
            data={magicItemsList}
            renderItem={renderMagicItem}
            keyExtractor={item => item.id}
            numColumns={2}
            contentContainerStyle={styles.itemList}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={styles.columnWrapper}
            ListEmptyComponent={
              isLoading ? <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} /> : null
            }
          />
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: 24, fontFamily: 'Fredoka_700Bold', color: Colors.text },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  coinText: { fontSize: 16, fontFamily: 'Fredoka_700Bold', color: '#B8860B' },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 16,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 15,
    color: Colors.textLight,
  },
  activeTabText: {
    color: Colors.primary,
  },

  // ── Preview ──
  previewArea: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    paddingHorizontal: 8,
    paddingVertical: 12,
    marginBottom: 8,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  previewAreaTrial: {
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  trialBadge: {
    position: 'absolute',
    top: 10,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(46, 204, 113, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trialBadgeText: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 11,
    color: Colors.primary,
  },

  // ── Category bar ──
  categoryBar: {
    flexDirection: 'row',
    marginHorizontal: 12,
    marginBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 16,
    padding: 4,
  },
  categoryPill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 12,
    gap: 2,
  },
  categoryPillActive: {
    backgroundColor: '#fff',
    shadowColor: Colors.primary,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  categoryEmoji: {
    fontSize: 18,
  },
  categoryPillText: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 11,
    color: Colors.textLight,
  },
  categoryPillTextActive: {
    color: Colors.primary,
  },
  categoryCountBadge: {
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
  },
  categoryCountBadgeActive: {
    backgroundColor: 'rgba(46, 204, 113, 0.15)',
  },
  categoryCountText: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 10,
    color: Colors.textLight,
  },
  categoryCountTextActive: {
    color: Colors.primary,
  },

  // ── Item grid ──
  list: { padding: 8 },
  itemCard: {
    width: '46%',
    backgroundColor: Colors.card,
    margin: 8,
    padding: 14,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  itemCardTrial: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(46, 204, 113, 0.04)',
  },
  itemIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  itemName: { fontSize: 14, fontFamily: 'Fredoka_600SemiBold', color: Colors.text, textAlign: 'center', minHeight: 36 },
  itemDesc: { fontSize: 12, fontFamily: 'Fredoka_500Medium', color: Colors.textLight, textAlign: 'center', marginBottom: 8, minHeight: 32 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 },
  itemPrice: { fontSize: 14, fontFamily: 'Fredoka_600SemiBold', color: '#B8860B' },
  itemPriceMagic: { fontSize: 14, fontFamily: 'Fredoka_600SemiBold', color: '#B8860B' },

  // ── Action buttons ──
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    width: '100%',
  },
  actionBtnText: { color: '#fff', fontFamily: 'Fredoka_600SemiBold', fontSize: 13 },
  tryBtn: {
    backgroundColor: Colors.blue,
  },
  tryingBtn: {
    backgroundColor: '#2980B9',
    borderWidth: 1,
    borderColor: '#fff',
  },
  dualBtnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    width: '100%',
  },
  tryBtnHalf: {
    flex: 1,
    backgroundColor: '#3498DB',
  },
  buyBtnHalf: {
    flex: 1,
    backgroundColor: '#27AE60',
  },
  equipBtn: {
    backgroundColor: Colors.secondary,
  },
  equippedBtn: {
    backgroundColor: Colors.tertiary,
  },
  itemList: {
    padding: 16,
    gap: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    gap: 16,
  },
  inventoryRow: {
    marginVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  inventoryText: {
    fontSize: 12,
    fontFamily: 'Fredoka_500Medium',
    color: Colors.textLight,
    textAlign: 'center',
  },
  buyBtn: {
    backgroundColor: Colors.primary,
    marginTop: 8,
  },
  magicBuyBtn: {
    backgroundColor: Colors.primary,
    flex: 1,
  },
  magicActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  quantityBadge: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 14,
    color: Colors.text,
  },

  // ── Guest banner ──
  guestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(241, 196, 15, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  guestBannerText: {
    fontSize: 13,
    fontFamily: 'Fredoka_500Medium',
    color: Colors.secondaryDark,
  },
});
