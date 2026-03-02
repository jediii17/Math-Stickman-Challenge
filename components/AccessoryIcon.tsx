import React from 'react';
import Svg, { Path, Ellipse, Line, G, Circle, Rect } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';

const AccessoryIcon = React.memo(({ id, color = Colors.primary }: { id: string, color?: string }) => {
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
  if (['hair-b1', 'hair-b2', 'hair-b3', 'hair-b4', 'hair-b5', 'hair-g1', 'hair-g2', 'hair-g3', 'hair-g4', 'hair-g5'].includes(id)) {
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

  // --- Newer Extra Boy Lower Items ---
  if (id === 'lower-b5') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.5)">
          <Path d={`M-8,0 L8,0 L11,10 L1,10 L0,5 L-1,10 L-11,10 Z`} fill="#4CAF50" stroke="#2E7D32" />
          <Path d={`M-11,3 L-14,5 L-11,7`} fill="#8BC34A" />
          <Path d={`M11,3 L14,5 L11,7`} fill="#8BC34A" />
        </G>
      </Svg>
    );
  }
  if (id === 'lower-b6') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.5)">
          <Path d={`M-8,0 L8,0 L9,15 L2,15 L0,6 L-2,15 L-9,15 Z`} fill="#B0BEC5" stroke="#78909C" />
          <Rect x={-6} y={7} width={4} height={3} fill="#4FC3F7" rx={1} />
          <Rect x={2} y={7} width={4} height={3} fill="#4FC3F7" rx={1} />
        </G>
      </Svg>
    );
  }
  if (id === 'lower-b7') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.5)">
          <Path d={`M-8,0 L8,0 L9,15 L2,15 L0,6 L-2,15 L-9,15 Z`} fill="#F44336" stroke="#B71C1C" />
          <Line x1={-9} y1={12} x2={-2} y2={12} stroke="#FFEB3B" strokeWidth={1.5} />
          <Line x1={2} y1={12} x2={9} y2={12} stroke="#FFEB3B" strokeWidth={1.5} />
        </G>
      </Svg>
    );
  }
  if (id === 'lower-b8') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.5)">
          <Path d={`M-8,0 L8,0 L10,12 L1,12 L0,5 L-1,12 L-10,12 Z`} fill="#795548" stroke="#5D4037" />
          <Rect x={-5} y={5} width={4} height={4} fill="#A5D6A7" stroke="#388E3C" opacity={0.6} />
        </G>
      </Svg>
    );
  }
  if (id === 'lower-b9') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.5)">
          <Path d={`M-8,0 L8,0 L7,15 L1,15 L0,6 L-1,15 L-7,15 Z`} fill="#FFEB3B" stroke="#FBC02D" />
          <Path d={`M-4,8 L-6,11 L-2,11 L-4,14`} fill="none" stroke="#F44336" strokeWidth={1} />
          <Path d={`M4,8 L2,11 L6,11 L4,14`} fill="none" stroke="#F44336" strokeWidth={1} />
        </G>
      </Svg>
    );
  }

  // --- Newer Extra Girl Lower Items ---
  if (id === 'lower-g5') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.5)">
          <Path d={`M-10,0 L10,0 L18,10 Q0,15 -18,10 Z`} fill="#F48FB1" opacity={0.7} />
          <Path d={`M-8,0 L8,0 L14,8 Q0,12 -14,8 Z`} fill="#F06292" />
        </G>
      </Svg>
    );
  }
  if (id === 'lower-g6') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.5)">
          <Path d={`M-8,0 L8,0 L7,15 L1,15 L0,6 L-1,15 L-7,15 Z`} fill="#9C27B0" stroke="#7B1FA2" />
          <Path d={`M-7,10 Q-12,7 -7,13`} fill="#E1BEE7" />
          <Path d={`M7,10 Q12,7 7,13`} fill="#E1BEE7" />
        </G>
      </Svg>
    );
  }
  if (id === 'lower-g7') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.5)">
          <Path d={`M0,0 Q-10,3 -8,12 Q0,10 8,12 Q10,3 0,0 Z`} fill="#FFF" stroke="#FFD54F" />
          <Circle cx={0} cy={3} r={2} fill="#FFEB3B" />
        </G>
      </Svg>
    );
  }
  if (id === 'lower-g8') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.5)">
          <Path d={`M-8,0 L8,0 L9,15 L2,15 L0,6 L-2,15 L-9,15 Z`} fill="#00BCD4" stroke="#00838F" />
          <Circle cx={-5} cy={8} r={1} fill="#FFF" />
          <Circle cx={5} cy={12} r={0.8} fill="#FFF" />
          <Circle cx={-2} cy={14} r={0.7} fill="#FFF" />
        </G>
      </Svg>
    );
  }
  if (id === 'lower-g9') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.5)">
          <Path d={`M-10,0 L10,0 L16,15 Q0,18 -16,15 Z`} fill="#1A237E" />
          <Circle cx={-6} cy={6} r={0.8} fill="#FFF" />
          <Circle cx={8} cy={10} r={0.6} fill="#FFD700" />
          <Circle cx={-3} cy={12} r={1} fill="#BBDEFB" />
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

  // --- Newer Extra Boy Shoes ---
  if (id === 'shoes-b5') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.6)">
          <Path d={`M-10,0 L-10,10 L12,10 L12,4 Z`} fill="#4CAF50" stroke="#2E7D32" strokeWidth={1} />
          <Path d={`M8,6 L12,4 L12,8 Z`} fill="#FFF" />
        </G>
      </Svg>
    );
  }
  if (id === 'shoes-b6') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.6)">
          <Path d={`M-10,-5 L-10,10 L12,10 L12,4 L3,-5 Z`} fill="#F44336" stroke="#B71C1C" strokeWidth={1} />
          <Rect x={-10} y={-3} width={10} height={3} fill="#FFEB3B" />
        </G>
      </Svg>
    );
  }
  if (id === 'shoes-b7') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.6)">
          <Path d={`M-10,0 L-10,10 L12,10 L12,4 L4,0 Z`} fill="#FFEB3B" stroke="#FBC02D" strokeWidth={1} />
          <Path d={`M-2,2 L2,5 L-1,8`} fill="none" stroke="#F44336" strokeWidth={1} />
        </G>
      </Svg>
    );
  }
  if (id === 'shoes-b8') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.6)">
          <Path d={`M-10,-4 L-10,10 L12,10 L12,4 Z`} fill="#795548" stroke="#5D4037" strokeWidth={1} />
          <Rect x={-10} y={8} width={22} height={3} fill="#212121" />
        </G>
      </Svg>
    );
  }
  if (id === 'shoes-b9') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.6)">
          <Path d={`M-10,0 L-10,10 L12,10 L12,4 Z`} fill="#FFD700" stroke="#FBC02D" strokeWidth={1} />
          <Path d={`M2,2 L4,4 M3,2 L3,4`} stroke="#FFF" strokeWidth={1} />
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

  // --- Newer Extra Girl Shoes ---
  if (id === 'shoes-g5') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.6)">
          <Path d={`M-10,4 Q0,-2 12,4 L12,10 L-10,10 Z`} fill="#F06292" stroke="#D81B60" strokeWidth={1} />
          <Circle cx={0} cy={5} r={2} fill="#FFF" opacity={0.5} />
        </G>
      </Svg>
    );
  }
  if (id === 'shoes-g6') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.6)">
          <Path d={`M-6,2 L-6,10 L12,10 L12,4 Z`} fill="#9C27B0" stroke="#7B1FA2" strokeWidth={1.5} />
          <Path d={`M-6,4 Q-14,0 -6,10`} fill="#E1BEE7" stroke="#7B1FA2" strokeWidth={0.5} />
        </G>
      </Svg>
    );
  }
  if (id === 'shoes-g7') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.6)">
          <Path d={`M-10,0 L-10,10 L12,10 L12,4 Z`} fill="#FFF" stroke="#E0E0E0" strokeWidth={1} />
          <Circle cx={3} cy={5} r={4} fill="#FFEB3B" />
          <Path d={`M3,1 L3,9 M-1,5 L7,5`} stroke="#BDBDBD" strokeWidth={0.5} />
        </G>
      </Svg>
    );
  }
  if (id === 'shoes-g8') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.6)">
          <Path d={`M-10,-5 L-10,10 L12,10 L12,2 Z`} fill="#FF9800" stroke="#F57C00" strokeWidth={1} />
          <Line x1={-10} y1={0} x2={12} y2={0} stroke="#FFEB3B" strokeWidth={2} />
          <Line x1={-10} y1={5} x2={12} y2={5} stroke="#4CAF50" strokeWidth={2} />
        </G>
      </Svg>
    );
  }
  if (id === 'shoes-g9') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.6)">
          <Path d={`M-10,4 Q2,12 12,4 L12,10 L-10,10 Z`} fill="#1A237E" stroke="#0D47A1" strokeWidth={1} />
          <Circle cx={2} cy={7} r={1.5} fill="#FFD700" />
          <Circle cx={8} cy={6} r={1} fill="#FFF" />
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

  // --- Newer Extra Boy Backs ---
  if (id === 'back-b5') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 45) scale(1.4)">
          <Path d={`M0,0 Q-10,10 -35,20 Q-45,35 -5,15 Z`} fill="#4CAF50" stroke="#1B5E20" strokeWidth={1.5} />
          <Path d={`M-15,8 L-20,-2 L-25,11 Z`} fill="#FF9800" />
        </G>
      </Svg>
    );
  }
  if (id === 'back-b6') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.3)">
          <Path d={`M-5,0 Q-30,-20 -40,10 L-30,15 L-25,5`} fill="#90A4AE" stroke="#37474F" strokeWidth={2} />
          <Path d={`M5,0 Q30,-20 40,10 L30,15 L25,5`} fill="#90A4AE" stroke="#37474F" strokeWidth={2} />
          <Circle cx={-5} cy={0} r={5} fill="#546E7A" />
          <Circle cx={5} cy={0} r={5} fill="#546E7A" />
        </G>
      </Svg>
    );
  }
  if (id === 'back-b7') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.4)">
          <Ellipse cx={0} cy={0} rx={22} ry={25} fill="#2E7D32" stroke="#1B5E20" strokeWidth={2} />
          <Path d={`M-15,-10 L15,-10 M-18,0 L18,0 M-15,10 L15,10`} stroke="#1B5E20" strokeWidth={1} />
        </G>
      </Svg>
    );
  }
  if (id === 'back-b8') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.3)">
          <Path d={`M0,-5 Q-40,-45 -45,15 Q-20,35 0,5 Z`} fill="#FF5722" opacity={0.7} />
          <Path d={`M0,-5 Q40,-45 45,15 Q20,35 0,5 Z`} fill="#FF5722" opacity={0.7} />
          <Path d={`M0,0 Q-20,-20 -25,10 Z`} fill="#FFEB3B" />
          <Path d={`M0,0 Q20,-20 25,10 Z`} fill="#FFEB3B" />
        </G>
      </Svg>
    );
  }
  if (id === 'back-b9') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 45) scale(1.4)">
          <Rect x={-15} y={-10} width={30} height={35} rx={5} fill="#B0BEC5" stroke="#455A64" strokeWidth={1.5} />
          <Rect x={-12} y={25} width={8} height={10} fill="#37474F" />
          <Rect x={8} y={25} width={8} height={10} fill="#37474F" />
          <Path d={`M-12,35 L-16,45 L-6,35 Z`} fill="#00E5FF" />
          <Path d={`M8,35 L12,45 L4,35 Z`} fill="#00E5FF" />
        </G>
      </Svg>
    );
  }

  // --- Newer Extra Girl Backs ---
  if (id === 'back-g5') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 55) scale(1.2)">
          <Path d={`M0,0 Q-50,-40 -20,-55 L0,0 Z`} fill="#009688" opacity={0.6} />
          <Path d={`M0,0 Q50,-40 20,-55 L0,0 Z`} fill="#009688" opacity={0.6} />
          <Path d={`M0,0 Q-10,-70 10,-70 L0,0 Z`} fill="#009688" opacity={0.6} />
          <Circle cx={-20} cy={-45} r={4} fill="#00E5FF" />
          <Circle cx={20} cy={-45} r={4} fill="#00E5FF" />
          <Circle cx={0} cy={-60} r={4} fill="#00E5FF" />
        </G>
      </Svg>
    );
  }
  if (id === 'back-g6') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 45) scale(1.3)">
          <Path d={`M-10,-5 Q-40,15 -5,40 Z`} fill="#F48FB1" stroke="#D81B60" />
          <Path d={`M10,-5 Q40,15 5,40 Z`} fill="#F48FB1" stroke="#D81B60" />
          <Path d={`M0,-5 Q0,25 0,45 L-10,40 Z`} fill="#F06292" />
        </G>
      </Svg>
    );
  }
  if (id === 'back-g7') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 45) scale(1.3)">
          <Path d={`M-5,0 Q-40,20 -15,45`} fill="none" stroke="#FF5252" strokeWidth={5} strokeLinecap="round" opacity={0.7} />
          <Path d={`M0,0 Q40,20 15,45`} fill="none" stroke="#448AFF" strokeWidth={5} strokeLinecap="round" opacity={0.7} />
          <Path d={`M2,-5 Q0,40 10,50`} fill="none" stroke="#FFEB3B" strokeWidth={5} strokeLinecap="round" opacity={0.7} />
        </G>
      </Svg>
    );
  }
  if (id === 'back-g8') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.3)">
          <Path d={`M0,-5 Q-50,-50 -70,5 Q-40,25 0,10 Z`} fill="#FFF" stroke="#E0E0E0" strokeWidth={1} />
          <Path d={`M0,-5 Q50,-50 70,5 Q40,25 0,10 Z`} fill="#FFF" stroke="#E0E0E0" strokeWidth={1} />
        </G>
      </Svg>
    );
  }
  if (id === 'back-g9') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 40) scale(1.4)">
          <Path d={`M0,0 Q15,10 10,50 Q40,60 30,30 Z`} fill="#E1BEE7" stroke="#9C27B0" />
          <Circle cx={35} cy={20} r={3} fill="#FFEB3B" />
          <Circle cx={20} cy={55} r={2} fill="#00E5FF" />
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

  if (id === 'lower-dragon') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.8)">
          <Path d={`M-10,0 L10,0 L12,15 L2,15 L0,5 L-2,15 L-12,15 Z`} fill="#4CAF50" stroke="#2E7D32" strokeWidth={1} />
          <Path d="M-6,4 L-4,6 M4,4 L6,6" stroke="#FB8C00" strokeWidth={1} />
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

  if (id === 'balloons-penguin') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50)">
          <Path d="M0,25 Q10,40 0,45" fill="none" stroke="#9E9E9E" strokeWidth={2} />
          <Ellipse cx={0} cy={0} rx={22} ry={25} fill="#263238" />
          <Ellipse cx={0} cy={5} rx={16} ry={18} fill="#FFFFFF" />
          <Ellipse cx={-8} cy={-5} rx={4} ry={4} fill="#FFFFFF" />
          <Ellipse cx={8} cy={-5} rx={4} ry={4} fill="#FFFFFF" />
          <Circle cx={-8} cy={-5} r={2} fill="#000000" />
          <Circle cx={8} cy={-5} r={2} fill="#000000" />
          <Path d="M-4,2 L4,2 L0,8 Z" fill="#FF9800" />
        </G>
      </Svg>
    );
  }

  if (id === 'balloons-dog') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50)">
          <Path d="M0,25 Q10,40 0,45" fill="none" stroke="#9E9E9E" strokeWidth={2} />
          <Ellipse cx={0} cy={0} rx={22} ry={25} fill="#8D6E63" />
          <Ellipse cx={-20} cy={-15} rx={8} ry={12} fill="#5D4037" transform="rotate(-30 -20 -15)" />
          <Ellipse cx={20} cy={-15} rx={8} ry={12} fill="#5D4037" transform="rotate(30 20 -15)" />
          <Ellipse cx={0} cy={10} rx={12} ry={10} fill="#D7CCC8" />
          <Ellipse cx={-8} cy={-5} rx={3} ry={4} fill="#000000" />
          <Ellipse cx={8} cy={-5} rx={3} ry={4} fill="#000000" />
          <Circle cx={0} cy={8} r={3} fill="#000000" />
          <Path d="M-5,14 Q0,18 5,14" fill="none" stroke="#000000" strokeWidth={1.5} />
        </G>
      </Svg>
    );
  }

  if (id === 'balloons-cat') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50)">
          <Path d="M0,25 Q10,40 0,45" fill="none" stroke="#9E9E9E" strokeWidth={2} />
          <Path d="M-15,-15 L-20,-28 L-5,-20 Z" fill="#FFA726" />
          <Path d="M15,-15 L20,-28 L5,-20 Z" fill="#FFA726" />
          <Ellipse cx={0} cy={0} rx={22} ry={20} fill="#FFA726" />
          <Ellipse cx={-8} cy={-2} rx={3} ry={4} fill="#000000" />
          <Ellipse cx={8} cy={-2} rx={3} ry={4} fill="#000000" />
          <Path d="M-3,5 L3,5 L0,9 Z" fill="#F48FB1" />
          <Line x1={-10} y1={8} x2={-22} y2={5} stroke="#000" strokeWidth={1} />
          <Line x1={-10} y1={10} x2={-22} y2={10} stroke="#000" strokeWidth={1} />
          <Line x1={10} y1={8} x2={22} y2={5} stroke="#000" strokeWidth={1} />
          <Line x1={10} y1={10} x2={22} y2={10} stroke="#000" strokeWidth={1} />
        </G>
      </Svg>
    );
  }

  if (id === 'balloons-bunny') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 55)">
          <Path d="M0,20 Q10,35 0,40" fill="none" stroke="#9E9E9E" strokeWidth={2} />
          <Ellipse cx={-10} cy={-25} rx={6} ry={20} fill="#FFFFFF" transform="rotate(-15 -10 -25)" />
          <Ellipse cx={10} cy={-25} rx={6} ry={20} fill="#FFFFFF" transform="rotate(15 10 -25)" />
          <Ellipse cx={-10} cy={-25} rx={3} ry={15} fill="#F8BBD0" transform="rotate(-15 -10 -25)" />
          <Ellipse cx={10} cy={-25} rx={3} ry={15} fill="#F8BBD0" transform="rotate(15 10 -25)" />
          <Ellipse cx={0} cy={0} rx={22} ry={20} fill="#FFFFFF" />
          <Ellipse cx={-8} cy={-2} rx={3} ry={4} fill="#000000" />
          <Ellipse cx={8} cy={-2} rx={3} ry={4} fill="#000000" />
          <Circle cx={0} cy={4} r={2.5} fill="#F48FB1" />
          <Path d="M-5,8 Q0,11 5,8" fill="none" stroke="#000000" strokeWidth={1} />
        </G>
      </Svg>
    );
  }

  if (id === 'balloons-bear') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50)">
          <Path d="M0,25 Q10,40 0,45" fill="none" stroke="#9E9E9E" strokeWidth={2} />
          <Circle cx={-18} cy={-18} r={10} fill="#A1887F" />
          <Circle cx={18} cy={-18} r={10} fill="#A1887F" />
          <Circle cx={-18} cy={-18} r={5} fill="#D7CCC8" />
          <Circle cx={18} cy={-18} r={5} fill="#D7CCC8" />
          <Ellipse cx={0} cy={0} rx={24} ry={22} fill="#A1887F" />
          <Ellipse cx={0} cy={8} rx={12} ry={9} fill="#D7CCC8" />
          <Ellipse cx={-8} cy={-4} rx={3} ry={4} fill="#000000" />
          <Ellipse cx={8} cy={-4} rx={3} ry={4} fill="#000000" />
          <Circle cx={0} cy={5} r={3} fill="#4E342E" />
          <Path d="M-4,10 Q0,12 4,10" fill="none" stroke="#4E342E" strokeWidth={1.5} />
        </G>
      </Svg>
    );
  }

  if (id === 'balloons-star') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50)">
          <Path d="M0,25 Q10,40 0,45" fill="none" stroke="#9E9E9E" strokeWidth={2} />
          <Path d="M0,-25 L6,-10 L22,-8 L10,3 L13,18 L0,11 L-13,18 L-10,3 L-22,-8 L-6,-10 Z" fill="#FFEB3B" stroke="#F57F17" strokeWidth={1.5} />
          <Ellipse cx={-8} cy={0} rx={2} ry={3} fill="#000" />
          <Ellipse cx={8} cy={0} rx={2} ry={3} fill="#000" />
          <Path d="M-4,6 Q0,10 4,6" fill="none" stroke="#000" strokeWidth={1} />
        </G>
      </Svg>
    );
  }

  if (id === 'balloons-heart') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 55) scale(0.9)">
          <Path d="M0,28 Q10,43 0,48" fill="none" stroke="#9E9E9E" strokeWidth={2} />
          <Path d="M0,8 C0,8 -20,-12 -20,-24 C-20,-32 -10,-38 0,-24 C10,-38 20,-32 20,-24 C20,-12 0,8 0,8 Z" fill="#E91E63" stroke="#C2185B" strokeWidth={1.5} />
          <Ellipse cx={-7} cy={-16} rx={2} ry={3} fill="#FFF" opacity={0.8} />
          <Ellipse cx={7} cy={-16} rx={2} ry={3} fill="#FFF" opacity={0.6} />
        </G>
      </Svg>
    );
  }

  if (id === 'balloons-kuromi') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 55)">
          <Path d="M0,25 Q10,40 0,45" fill="none" stroke="#9E9E9E" strokeWidth={2} />
          {/* LEFT arrow/diamond ear — wide flat panel */}
          <Path d="M-8,-16 L-21,-15 L-18,-36 L-10,-20 Z" fill="#333" stroke="#000" strokeWidth={1.5} />
          {/* Ball tip on left ear */}
          <Circle cx={-18} cy={-37} r={3.5} fill="#333" stroke="#000" strokeWidth={1.2} />
          {/* RIGHT arrow/diamond ear */}
          <Path d="M8,-16 L21,-15 L18,-36 L10,-20 Z" fill="#333" stroke="#000" strokeWidth={1.5} />
          {/* Ball tip on right ear */}
          <Circle cx={18} cy={-37} r={3.5} fill="#333" stroke="#000" strokeWidth={1.2} />
          {/* Round black hood */}
          <Ellipse cx={0} cy={-2} rx={21} ry={21} fill="#333" stroke="#000" strokeWidth={1.5} />
          {/* White face — V-shaped opening */}
          <Path d="M-13,-2 Q-13,5 -10,10 Q-5,19 0,20 Q5,19 10,10 Q13,5 13,-2 Q10,-8 0,-9 Q-10,-8 -13,-2 Z" fill="#FFF" stroke="#000" strokeWidth={1} />
          {/* Pink skull */}
          <Circle cx={0} cy={-12} r={6} fill="#f76d9bff" />
          {/* Skull eyes */}
          <Ellipse cx={-2.5} cy={-13.5} rx={1.5} ry={2} fill="#333" />
          <Ellipse cx={2.5} cy={-13.5} rx={1.5} ry={2} fill="#333" />
          {/* Skull teeth */}
          <Path d="M-2,-9 L0,-7.5 L2,-9" fill="none" stroke="#333" strokeWidth={0.8} />
          {/* Purple eyes */}
          <Ellipse cx={-6} cy={4} rx={4.5} ry={3.5} fill="#000000ff" />
          <Ellipse cx={6} cy={4} rx={4.5} ry={3.5} fill="#000000ff" />
          <Circle cx={-4.5} cy={2.5} r={1.5} fill="#FFF" opacity={0.9} />
          <Circle cx={7.5} cy={2.5} r={1.5} fill="#FFF" opacity={0.9} />
          {/* Pink nose */}
          <Ellipse cx={0} cy={11} rx={1.5} ry={1} fill="#E91E63" />
          {/* Smirk */}
          <Path d="M-3,13 Q0,16 4,12" fill="none" stroke="#000" strokeWidth={1} />
        </G>
      </Svg>
    );
  }

  if (id === 'balloons-melody') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 55)">
          <Path d="M0,25 Q10,40 0,45" fill="none" stroke="#9E9E9E" strokeWidth={2} />
          {/* Left tall oval ear — long, going up-left */}
          <Ellipse cx={-10} cy={-32} rx={8} ry={21} fill="#F48FB1" stroke="#000" strokeWidth={1.5} transform="rotate(-15 -10 -32)" />
          {/* Right shorter round ear */}
          <Ellipse cx={15} cy={-15} rx={8} ry={12} fill="#F48FB1" stroke="#000" strokeWidth={1.5} transform="rotate(10 15 -15)" />
          {/* Pink round hood */}
          <Ellipse cx={0} cy={-1} rx={21} ry={21} fill="#F48FB1" stroke="#000" strokeWidth={1.5} />
          {/* White face — oval opening */}
          <Ellipse cx={0} cy={5} rx={14} ry={14} fill="#FFF" stroke="#000" strokeWidth={1} />
          {/* Yellow bow — left side */}
          <Path d="M-13,-15 Q-23,-23 -15,-10 Z" fill="#FFD600" stroke="#000" strokeWidth={0.8} />
          <Path d="M-13,-15 Q-5,-26 -11,-10 Z" fill="#FFD600" stroke="#000" strokeWidth={0.8} />
          <Circle cx={-13} cy={-15} r={2} fill="#F9A825" stroke="#000" strokeWidth={0.5} />
          {/* Large black oval eyes */}
          <Ellipse cx={-5} cy={3} rx={3.5} ry={4.5} fill="#000" />
          <Ellipse cx={5} cy={3} rx={3.5} ry={4.5} fill="#000" />
          {/* Small yellow nose */}
          <Ellipse cx={0} cy={11} rx={1.8} ry={1.3} fill="#FFD600" />
          {/* Smile */}
          <Path d="M-3,14 Q0,16 3,14" fill="none" stroke="#000" strokeWidth={0.8} />
        </G>
      </Svg>
    );
  }

  if (id === 'balloons-pompompurin') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 52)">
          <Path d="M0,28 Q10,43 0,48" fill="none" stroke="#9E9E9E" strokeWidth={2} />
          <Ellipse cx={-22} cy={3} rx={9} ry={14} fill="#FFF9C4" stroke="#000" strokeWidth={1.2} transform="rotate(15 -22 3)" />
          <Ellipse cx={22} cy={3} rx={9} ry={14} fill="#FFF9C4" stroke="#000" strokeWidth={1.2} transform="rotate(-15 22 3)" />
          <Ellipse cx={0} cy={0} rx={22} ry={22} fill="#FFF9C4" stroke="#000" strokeWidth={1.5} />
          <Ellipse cx={0} cy={-18} rx={13} ry={6} fill="#6D4C41" stroke="#000" strokeWidth={1} />
          <Ellipse cx={0} cy={-23} rx={2.5} ry={4} fill="#6D4C41" stroke="#000" strokeWidth={1} />
          <Circle cx={-7} cy={-2} r={2} fill="#000000" />
          <Circle cx={7} cy={-2} r={2} fill="#000000" />
          <Path d="M-1.5,5 L1.5,5 L0,7 Z" fill="#000000" />
          <Path d="M-4,9 Q-2,12 0,9 Q2,12 4,9" fill="none" stroke="#000" strokeWidth={1} />
        </G>
      </Svg>
    );
  }

  // --- Newer Extra Boy Balloons ---
  if (id === 'balloons-dino') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50)">
          <Path d="M0,25 Q10,40 0,45" fill="none" stroke="#9E9E9E" strokeWidth={2} />
          <Path d="M-15,-12 Q-18,-30 0,-30 Q18,-30 15,-12 L18,0 Q18,12 0,12 Q-18,12 -15,0 Z" fill="#4CAF50" stroke="#1B5E20" strokeWidth={1.5} />
          <Path d="M15,-12 L22,-18 L18,-6 Z" fill="#4CAF50" />
          <Circle cx={-5} cy={-10} r={2} fill="#000" />
          <Circle cx={5} cy={-10} r={2} fill="#000" />
        </G>
      </Svg>
    );
  }
  if (id === 'balloons-rocket') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50)">
          <Path d="M0,25 Q10,40 0,45" fill="none" stroke="#9E9E9E" strokeWidth={2} />
          <Path d="M0,-30 Q15,-30 15,0 L15,15 L-15,15 L-15,0 Q-15,-30 0,-30 Z" fill="#F44336" stroke="#B71C1C" strokeWidth={1.5} />
          <Path d="M-15,0 L-22,15 L-15,15 Z M15,0 L22,15 L15,15 Z" fill="#FFEB3B" />
          <Circle cx={0} cy={-5} r={5} fill="#BBDEFB" stroke="#1976D2" strokeWidth={1} />
        </G>
      </Svg>
    );
  }
  if (id === 'balloons-lion') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50)">
          <Path d="M0,25 Q10,40 0,45" fill="none" stroke="#9E9E9E" strokeWidth={2} />
          <Circle cx={0} cy={0} r={23} fill="#FF9800" stroke="#E65100" strokeWidth={1.5} />
          <Circle cx={0} cy={0} r={16} fill="#FFC107" stroke="#FFA000" strokeWidth={1} />
          <Circle cx={-7} cy={-3} r={2} fill="#000" />
          <Circle cx={7} cy={-3} r={2} fill="#000" />
          <Path d="M-1.5,4 L1.5,4 L0,6 Z" fill="#000" />
        </G>
      </Svg>
    );
  }
  if (id === 'balloons-whale') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50)">
          <Path d="M0,25 Q10,40 0,45" fill="none" stroke="#9E9E9E" strokeWidth={2} />
          <Path d="M-18,0 Q-18,-22 0,-22 Q18,-22 18,0 Q18,12 0,12 Q-18,12 -18,0 Z" fill="#03A9F4" stroke="#0288D1" strokeWidth={1.5} />
          <Path d="M15,0 L22,-6 L22,6 L15,0 Z" fill="#03A9F4" />
          <Circle cx={-8} cy={-3} r={2} fill="#000" />
        </G>
      </Svg>
    );
  }
  if (id === 'balloons-soccer') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50)">
          <Path d="M0,25 Q10,40 0,45" fill="none" stroke="#9E9E9E" strokeWidth={2} />
          <Circle cx={0} cy={0} r={20} fill="#FFF" stroke="#000" strokeWidth={1.5} />
          <Path d="M0,-8 L5,-3 L4,4 L-4,4 L-5,-3 Z" fill="#000" />
          <Path d="M0,-20 L0,-8 M12,-16 L5,-3 M19,-5 L5,-3 M16,12 L4,4 M0,20 L0,4 M-16,12 L-4,4 M-19,-5 L-5,-3 M-12,-16 L-5,-3" stroke="#000" strokeWidth={1} />
        </G>
      </Svg>
    );
  }

  // --- Newer Extra Girl Balloons ---
  if (id === 'balloons-unicorn') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50)">
          <Path d="M0,25 Q10,40 0,45" fill="none" stroke="#9E9E9E" strokeWidth={2} />
          <Circle cx={0} cy={2} r={18} fill="#FFF" stroke="#E1BEE7" strokeWidth={1.5} />
          <Path d="M0,-16 L4,-28 L-4,-28 Z" fill="#FFEB3B" stroke="#FBC02D" strokeWidth={1} />
          <Circle cx={-6} cy={0} r={2} fill="#000" />
          <Circle cx={6} cy={0} r={2} fill="#000" />
          <Circle cx={-12} cy={2} r={3} fill="#F8BBD0" opacity={0.6} />
          <Circle cx={12} cy={2} r={3} fill="#F8BBD0" opacity={0.6} />
        </G>
      </Svg>
    );
  }
  if (id === 'balloons-flower') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 45)">
          <Path d="M0,35 Q10,50 0,55" fill="none" stroke="#9E9E9E" strokeWidth={2} />
          <Circle cx={0} cy={-12} r={10} fill="#F06292" stroke="#D81B60" strokeWidth={1} />
          <Circle cx={12} cy={-6} r={10} fill="#F06292" stroke="#D81B60" strokeWidth={1} />
          <Circle cx={9} cy={9} r={10} fill="#F06292" stroke="#D81B60" strokeWidth={1} />
          <Circle cx={-9} cy={9} r={10} fill="#F06292" stroke="#D81B60" strokeWidth={1} />
          <Circle cx={-12} cy={-6} r={10} fill="#F06292" stroke="#D81B60" strokeWidth={1} />
          <Circle cx={0} cy={0} r={8} fill="#FFEB3B" stroke="#FBC02D" strokeWidth={1} />
        </G>
      </Svg>
    );
  }
  if (id === 'balloons-butterfly') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50)">
          <Path d="M0,25 Q10,40 0,45" fill="none" stroke="#9E9E9E" strokeWidth={2} />
          <Path d="M0,0 Q-20,-20 -25,0 Q-20,20 0,0 Z" fill="#9C27B0" stroke="#7B1FA2" strokeWidth={1.5} />
          <Path d="M0,0 Q20,-20 25,0 Q20,20 0,0 Z" fill="#9C27B0" stroke="#7B1FA2" strokeWidth={1.5} />
          <Ellipse cx={0} cy={0} rx={4} ry={10} fill="#BA68C8" />
          <Circle cx={-12} cy={-7} r={3} fill="#E1BEE7" />
          <Circle cx={12} cy={-7} r={3} fill="#E1BEE7" />
        </G>
      </Svg>
    );
  }
  if (id === 'balloons-panda') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50)">
          <Path d="M0,25 Q10,40 0,45" fill="none" stroke="#9E9E9E" strokeWidth={2} />
          <Circle cx={-14} cy={-14} r={7} fill="#212121" />
          <Circle cx={14} cy={-14} r={7} fill="#212121" />
          <Circle cx={0} cy={0} r={20} fill="#FFF" stroke="#212121" strokeWidth={1.5} />
          <Ellipse cx={-7} cy={-2} rx={5} ry={6} fill="#212121" />
          <Ellipse cx={7} cy={-2} rx={5} ry={6} fill="#212121" />
          <Circle cx={-7} cy={-3} r={1.5} fill="#FFF" />
          <Circle cx={7} cy={-3} r={1.5} fill="#FFF" />
        </G>
      </Svg>
    );
  }
  if (id === 'balloons-cloud') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50)">
          <Path d="M0,25 Q10,40 0,45" fill="none" stroke="#9E9E9E" strokeWidth={2} />
          <Circle cx={-12} cy={0} r={10} fill="#FFF" stroke="#E0E0E0" strokeWidth={0.5} />
          <Circle cx={12} cy={0} r={10} fill="#FFF" stroke="#E0E0E0" strokeWidth={0.5} />
          <Circle cx={0} cy={-7} r={12} fill="#FFF" stroke="#E0E0E0" strokeWidth={0.5} />
          <Circle cx={0} cy={7} r={10} fill="#FFF" stroke="#E0E0E0" strokeWidth={0.5} />
          <Circle cx={-5} cy={0} r={1.5} fill="#000" />
          <Circle cx={5} cy={0} r={1.5} fill="#000" />
          <Path d="M-3,4 Q0,7 3,4" fill="none" stroke="#000" strokeWidth={1} />
        </G>
      </Svg>
    );
  }

  // --- Boy Shirts (shirt-b1 to shirt-b5) ---
  if (id === 'shirt-b1') {
    // Galaxy Tee: dark blue shirt with stars and rocket
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.7)">
          {/* Body */}
          <Path d={`M-11,-8 L-11,10 Q0,14 11,10 L11,-8 Z`} fill="#1A237E" stroke="#0D47A1" strokeWidth={1} />
          {/* Sleeves */}
          <Path d={`M-17,-4 L-11,-8 L-11,2 L-17,5 Z`} fill="#1565C0" stroke="#0D47A1" strokeWidth={1} />
          <Path d={`M17,-4 L11,-8 L11,2 L17,5 Z`} fill="#1565C0" stroke="#0D47A1" strokeWidth={1} />
          {/* Stars */}
          <Circle cx={-4} cy={0} r={1.2} fill="#FFD700" />
          <Circle cx={3} cy={-4} r={1.5} fill="#FFD700" />
          <Circle cx={6} cy={4} r={1} fill="#FFF" />
          <Circle cx={-7} cy={5} r={0.8} fill="#FFF" />
          <Circle cx={0} cy={7} r={1} fill="#FFD700" />
          {/* Rocket */}
          <Path d={`M2,-8 Q4,-12 6,-8 L6,-4 L2,-4 Z`} fill="#FF5722" stroke="#D84315" strokeWidth={0.5} />
          <Path d={`M2,-4 L1,-2 M6,-4 L7,-2`} fill="none" stroke="#FF9800" strokeWidth={1} />
          <Circle cx={4} cy={-7} r={1} fill="#B3E5FC" />
        </G>
      </Svg>
    );
  }

  if (id === 'shirt-b2') {
    // Dino Roar Tee: bright green shirt with cute dino print
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.7)">
          {/* Body */}
          <Path d={`M-11,-8 L-11,10 Q0,14 11,10 L11,-8 Z`} fill="#43A047" stroke="#2E7D32" strokeWidth={1} />
          {/* Sleeves */}
          <Path d={`M-17,-4 L-11,-8 L-11,2 L-17,5 Z`} fill="#388E3C" stroke="#2E7D32" strokeWidth={1} />
          <Path d={`M17,-4 L11,-8 L11,2 L17,5 Z`} fill="#388E3C" stroke="#2E7D32" strokeWidth={1} />
          {/* Dino body */}
          <Ellipse cx={0} cy={2} rx={5} ry={4} fill="#A5D6A7" stroke="#66BB6A" strokeWidth={0.5} />
          {/* Dino head */}
          <Ellipse cx={4} cy={-3} rx={3.5} ry={3} fill="#A5D6A7" stroke="#66BB6A" strokeWidth={0.5} />
          {/* Dino eye */}
          <Circle cx={5.5} cy={-4} r={0.8} fill="#1B5E20" />
          {/* Dino spikes */}
          <Path d={`M-2,-1 L-3,-5 L-1,-2`} fill="#FFF176" stroke="#F9A825" strokeWidth={0.3} />
          <Path d={`M0,-2 L0,-6 L2,-2`} fill="#FFF176" stroke="#F9A825" strokeWidth={0.3} />
          {/* Dino mouth */}
          <Path d={`M5,-1 Q7,-2 6,0`} fill="none" stroke="#33691E" strokeWidth={0.5} />
          {/* "RAWR" text dots */}
          <Circle cx={-6} cy={8} r={1} fill="#FFF176" />
          <Circle cx={-3} cy={8} r={1} fill="#FFF176" />
          <Circle cx={0} cy={8} r={1} fill="#FFF176" />
        </G>
      </Svg>
    );
  }

  if (id === 'shirt-b3') {
    // Fire Player Jersey: red jersey with flame print and number 7
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.7)">
          {/* Body */}
          <Path d={`M-11,-8 L-11,10 Q0,14 11,10 L11,-8 Z`} fill="#D32F2F" stroke="#B71C1C" strokeWidth={1} />
          {/* Sleeves */}
          <Path d={`M-17,-4 L-11,-8 L-11,2 L-17,5 Z`} fill="#C62828" stroke="#B71C1C" strokeWidth={1} />
          <Path d={`M17,-4 L11,-8 L11,2 L17,5 Z`} fill="#C62828" stroke="#B71C1C" strokeWidth={1} />
          {/* White collar stripe */}
          <Path d={`M-4,-8 Q0,-10 4,-8 L3,-6 Q0,-8 -3,-6 Z`} fill="#FFF" />
          {/* Flame */}
          <Path d={`M0,5 Q-3,0 -1,-3 Q0,0 1,-5 Q3,0 2,-2 Q4,0 3,5 Z`} fill="#FF9800" stroke="#FF6F00" strokeWidth={0.5} />
          <Path d={`M0,5 Q-1,2 0,0 Q1,2 0,5 Z`} fill="#FFCC02" />
          {/* Number 7 */}
          <Path d={`M-8,2 L-6,-2 L-4,2`} fill="none" stroke="#FFF" strokeWidth={1.5} strokeLinecap="round" />
          <Line x1={-8} y1={-2} x2={-4} y2={-2} stroke="#FFF" strokeWidth={1.5} strokeLinecap="round" />
        </G>
      </Svg>
    );
  }

  if (id === 'shirt-b4') {
    // Cool Hoodie: blue hoodie with front pocket and face emoji
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.7)">
          {/* Body */}
          <Path d={`M-11,-8 L-11,10 Q0,14 11,10 L11,-8 Z`} fill="#1976D2" stroke="#0D47A1" strokeWidth={1} />
          {/* Sleeves */}
          <Path d={`M-17,-5 L-11,-8 L-11,3 L-18,6 Z`} fill="#1565C0" stroke="#0D47A1" strokeWidth={1} />
          <Path d={`M17,-5 L11,-8 L11,3 L18,6 Z`} fill="#1565C0" stroke="#0D47A1" strokeWidth={1} />
          {/* Hood */}
          <Path d={`M-5,-8 Q-8,-14 0,-14 Q8,-14 5,-8`} fill="#1565C0" stroke="#0D47A1" strokeWidth={1} />
          {/* Center zip */}
          <Line x1={0} y1={-8} x2={0} y2={10} stroke="#90CAF9" strokeWidth={1} strokeDasharray="1.5,1.5" />
          {/* Front pocket */}
          <Rect x={-5} y={3} width={10} height={5} rx={1.5} fill="#1565C0" stroke="#0D47A1" strokeWidth={0.5} />
          {/* Smiley on pocket */}
          <Circle cx={0} cy={5.5} r={2} fill="#FFEE58" stroke="#F9A825" strokeWidth={0.3} />
          <Circle cx={-0.7} cy={5} r={0.4} fill="#333" />
          <Circle cx={0.7} cy={5} r={0.4} fill="#333" />
          <Path d={`M-0.8,6.2 Q0,7 0.8,6.2`} fill="none" stroke="#333" strokeWidth={0.4} />
        </G>
      </Svg>
    );
  }

  if (id === 'shirt-b5') {
    // Space Hero: grey shirt with lightning bolt and star badge
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.7)">
          {/* Body */}
          <Path d={`M-11,-8 L-11,10 Q0,14 11,10 L11,-8 Z`} fill="#546E7A" stroke="#37474F" strokeWidth={1} />
          {/* Sleeves */}
          <Path d={`M-17,-4 L-11,-8 L-11,2 L-17,5 Z`} fill="#455A64" stroke="#37474F" strokeWidth={1} />
          <Path d={`M17,-4 L11,-8 L11,2 L17,5 Z`} fill="#455A64" stroke="#37474F" strokeWidth={1} />
          {/* Lightning bolt */}
          <Path d={`M2,-7 L-2,0 L1,0 L-2,7 L3,0 L0,0 Z`} fill="#FFD600" stroke="#FF8F00" strokeWidth={0.5} />
          {/* Star badge (left chest) */}
          <Path d={`M-8,-3 L-7,-1 L-5,-1 L-6.5,0 L-6,2 L-8,1 L-10,2 L-9.5,0 L-11,-1 L-9,-1 Z`} fill="#00E5FF" stroke="#0097A7" strokeWidth={0.3} />
          {/* Arm stripe */}
          <Line x1={-17} y1={2} x2={-11} y2={2} stroke="#00E5FF" strokeWidth={1.5} />
          <Line x1={11} y1={2} x2={17} y2={2} stroke="#00E5FF" strokeWidth={1.5} />
          {/* Bottom hem stripe */}
          <Path d={`M-11,9 Q0,13 11,9`} fill="none" stroke="#00E5FF" strokeWidth={1} />
        </G>
      </Svg>
    );
  }

  if (id === 'upper-dragon') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.7)">
          <Path d={`M-11,-8 L-11,10 Q0,14 11,10 L11,-8 Z`} fill="#4CAF50" stroke="#2E7D32" strokeWidth={1} />
          <Path d="M-5,-4 L0,-2 L5,-4 M-5,0 L0,2 L5,0" fill="none" stroke="#FB8C00" strokeWidth={0.5} opacity={0.6} />
        </G>
      </Svg>
    );
  }

  // --- Girl Shirts (shirt-g1 to shirt-g5) ---
  if (id === 'shirt-g1') {
    // Strawberry Tee: red shirt with cute strawberry print
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.7)">
          {/* Body */}
          <Path d={`M-10,-8 L-10,10 Q0,14 10,10 L10,-8 Z`} fill="#EF5350" stroke="#C62828" strokeWidth={1} />
          {/* Puff sleeves */}
          <Ellipse cx={-14} cy={-3} rx={5} ry={4} fill="#EF9A9A" stroke="#C62828" strokeWidth={0.8} />
          <Ellipse cx={14} cy={-3} rx={5} ry={4} fill="#EF9A9A" stroke="#C62828" strokeWidth={0.8} />
          {/* White collar */}
          <Path d={`M-4,-8 Q0,-11 4,-8 L3,-6 Q0,-9 -3,-6 Z`} fill="#FFF" />
          {/* Strawberry on chest */}
          <Path d={`M0,-3 Q-3.5,0 -3,4 Q0,6 3,4 Q3.5,0 0,-3 Z`} fill="#E53935" stroke="#B71C1C" strokeWidth={0.5} />
          {/* Seeds */}
          <Ellipse cx={-1} cy={1} rx={0.6} ry={0.9} fill="#FFCDD2" transform="rotate(-15 -1 1)" />
          <Ellipse cx={1} cy={2} rx={0.6} ry={0.9} fill="#FFCDD2" transform="rotate(10 1 2)" />
          <Ellipse cx={-0.5} cy={4} rx={0.6} ry={0.9} fill="#FFCDD2" />
          {/* Leaf */}
          <Path d={`M-1.5,-3 Q-3,-6 -0.5,-4 M0,-3 Q0,-7 0,-4 M1.5,-3 Q3,-6 0.5,-4`} fill="none" stroke="#4CAF50" strokeWidth={0.8} />
          {/* White dot pattern on sleeves */}
          <Circle cx={-14} cy={-4} r={0.8} fill="#FFF" opacity={0.7} />
          <Circle cx={14} cy={-4} r={0.8} fill="#FFF" opacity={0.7} />
        </G>
      </Svg>
    );
  }

  if (id === 'shirt-g2') {
    // Unicorn Top: pastel purple shirt with rainbow unicorn silhouette
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.7)">
          {/* Body */}
          <Path d={`M-10,-8 L-10,10 Q0,14 10,10 L10,-8 Z`} fill="#CE93D8" stroke="#AB47BC" strokeWidth={1} />
          {/* Puff sleeves */}
          <Ellipse cx={-14} cy={-3} rx={5} ry={4} fill="#E1BEE7" stroke="#AB47BC" strokeWidth={0.8} />
          <Ellipse cx={14} cy={-3} rx={5} ry={4} fill="#E1BEE7" stroke="#AB47BC" strokeWidth={0.8} />
          {/* Ruffle collar */}
          <Path d={`M-6,-8 Q-3,-11 0,-9 Q3,-11 6,-8 Q3,-6 0,-7 Q-3,-6 -6,-8 Z`} fill="#F3E5F5" stroke="#CE93D8" strokeWidth={0.5} />
          {/* Unicorn silhouette */}
          <Ellipse cx={0} cy={2} rx={4} ry={3} fill="#F8BBD0" stroke="#F48FB1" strokeWidth={0.5} />
          {/* Unicorn head */}
          <Circle cx={4} cy={-2} r={2.5} fill="#F8BBD0" stroke="#F48FB1" strokeWidth={0.5} />
          {/* Horn */}
          <Path d={`M4,-4.5 Q5,-8 4,-4.5 L3.5,-4.5 Z`} fill="#FFD700" stroke="#FFC107" strokeWidth={0.5} />
          {/* Ear */}
          <Path d={`M2.5,-4 Q1.5,-6 3,-4 Z`} fill="#F48FB1" />
          {/* Eye */}
          <Circle cx={5} cy={-2.5} r={0.5} fill="#7B1FA2" />
          {/* Rainbow tail */}
          <Path d={`M-4,2 Q-8,-1 -7,3`} fill="none" stroke="#FF5252" strokeWidth={0.8} />
          <Path d={`M-4,2 Q-9,0 -8,4`} fill="none" stroke="#FFEB3B" strokeWidth={0.8} />
          <Path d={`M-4,2 Q-10,1 -9,5`} fill="none" stroke="#69F0AE" strokeWidth={0.8} />
          {/* Star sparkles */}
          <Path d={`M7,5 L7.5,4 L8,5 L7,4.5 L8,4 L7.5,5 Z`} fill="#FFD700" />
          <Path d={`M-7,7 L-6.5,6 L-6,7 L-7,6.5 L-6,6 L-6.5,7 Z`} fill="#FF80AB" />
        </G>
      </Svg>
    );
  }

  if (id === 'shirt-g3') {
    // Flower Blouse: white blouse with flower embroidery
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.7)">
          {/* Body */}
          <Path d={`M-10,-8 L-10,10 Q0,14 10,10 L10,-8 Z`} fill="#F3E5F5" stroke="#CE93D8" strokeWidth={1} />
          {/* Puff sleeves */}
          <Ellipse cx={-14} cy={-3} rx={5} ry={4} fill="#FFF" stroke="#CE93D8" strokeWidth={0.8} />
          <Ellipse cx={14} cy={-3} rx={5} ry={4} fill="#FFF" stroke="#CE93D8" strokeWidth={0.8} />
          {/* Scallop collar */}
          <Path d={`M-6,-8 Q-4,-10 -2,-8 Q0,-10 2,-8 Q4,-10 6,-8`} fill="none" stroke="#AB47BC" strokeWidth={1} />
          {/* Big flower center */}
          <Circle cx={0} cy={2} r={2} fill="#FFD700" stroke="#FFC107" strokeWidth={0.5} />
          {/* Petals */}
          <Ellipse cx={0} cy={-1} rx={1.5} ry={2.5} fill="#F48FB1" opacity={0.9} />
          <Ellipse cx={0} cy={5} rx={1.5} ry={2.5} fill="#F48FB1" opacity={0.9} />
          <Ellipse cx={-3} cy={2} rx={2.5} ry={1.5} fill="#F48FB1" opacity={0.9} />
          <Ellipse cx={3} cy={2} rx={2.5} ry={1.5} fill="#F48FB1" opacity={0.9} />
          <Ellipse cx={-2} cy={-0.5} rx={1.5} ry={2.5} fill="#FF80AB" opacity={0.7} transform="rotate(45 -2 -0.5)" />
          <Ellipse cx={2} cy={-0.5} rx={1.5} ry={2.5} fill="#FF80AB" opacity={0.7} transform="rotate(-45 2 -0.5)" />
          <Ellipse cx={2} cy={4.5} rx={1.5} ry={2.5} fill="#FF80AB" opacity={0.7} transform="rotate(45 2 4.5)" />
          <Ellipse cx={-2} cy={4.5} rx={1.5} ry={2.5} fill="#FF80AB" opacity={0.7} transform="rotate(-45 -2 4.5)" />
          {/* Small flowers on side */}
          <Circle cx={-7} cy={6} r={1} fill="#FFD700" />
          <Circle cx={7} cy={6} r={1} fill="#FFD700" />
          <Circle cx={-7} cy={6} r={1.8} fill="none" stroke="#F48FB1" strokeWidth={0.8} />
          <Circle cx={7} cy={6} r={1.8} fill="none" stroke="#F48FB1" strokeWidth={0.8} />
        </G>
      </Svg>
    );
  }

  if (id === 'shirt-g4') {
    // Candy Sweater: pink sweater with candy/lollipop pattern
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.7)">
          {/* Body */}
          <Path d={`M-11,-8 L-11,10 Q0,14 11,10 L11,-8 Z`} fill="#F06292" stroke="#C2185B" strokeWidth={1} />
          {/* Sleeves */}
          <Path d={`M-17,-4 L-11,-8 L-11,2 L-17,5 Z`} fill="#E91E63" stroke="#C2185B" strokeWidth={1} />
          <Path d={`M17,-4 L11,-8 L11,2 L17,5 Z`} fill="#E91E63" stroke="#C2185B" strokeWidth={1} />
          {/* Ribbed collar */}
          <Rect x={-5} y={-9} width={10} height={3} rx={1} fill="#C2185B" />
          {/* Stripe pattern */}
          <Line x1={-11} y1={-2} x2={11} y2={-2} stroke="#FFCDD2" strokeWidth={1.5} />
          <Line x1={-11} y1={3} x2={11} y2={3} stroke="#FFCDD2" strokeWidth={1.5} />
          {/* Lollipop 1 */}
          <Circle cx={-4} cy={0} r={2.5} fill="#FFCC02" stroke="#FF8F00" strokeWidth={0.5} />
          <Path d={`M-4,2.5 Q-4,6 -3,7`} fill="none" stroke="#795548" strokeWidth={0.8} />
          <Path d={`M-4,-0.5 Q-2,0.5 -4,1.5 Q-6,0.5 -4,-0.5 Z`} fill="#FF5252" opacity={0.6} />
          {/* Lollipop 2 */}
          <Circle cx={5} cy={-4} r={2} fill="#69F0AE" stroke="#00C853" strokeWidth={0.5} />
          <Path d={`M5,-2 Q5,0 6,1`} fill="none" stroke="#795548" strokeWidth={0.8} />
          <Path d={`M5,-4.8 Q6.5,-3.5 5,-2.2 Q3.5,-3.5 5,-4.8 Z`} fill="#FF80AB" opacity={0.6} />
        </G>
      </Svg>
    );
  }

  if (id === 'shirt-g5') {
    // Butterfly Tee: teal shirt with big butterfly on front
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.7)">
          {/* Body */}
          <Path d={`M-10,-8 L-10,10 Q0,14 10,10 L10,-8 Z`} fill="#4DD0E1" stroke="#00ACC1" strokeWidth={1} />
          {/* Kimono-style sleeves */}
          <Path d={`M-18,-2 L-10,-8 L-10,4 L-18,8 Z`} fill="#80DEEA" stroke="#00ACC1" strokeWidth={0.8} />
          <Path d={`M18,-2 L10,-8 L10,4 L18,8 Z`} fill="#80DEEA" stroke="#00ACC1" strokeWidth={0.8} />
          {/* Collar */}
          <Path d={`M-3,-8 Q0,-7 3,-8`} fill="none" stroke="#00838F" strokeWidth={1} />
          {/* Butterfly top wings */}
          <Path d={`M0,-1 Q-5,-7 -8,-3 Q-6,2 0,-1 Z`} fill="#FF80AB" stroke="#F50057" strokeWidth={0.5} opacity={0.9} />
          <Path d={`M0,-1 Q5,-7 8,-3 Q6,2 0,-1 Z`} fill="#FF80AB" stroke="#F50057" strokeWidth={0.5} opacity={0.9} />
          {/* Butterfly bottom wings */}
          <Path d={`M0,-1 Q-6,1 -7,5 Q-3,6 0,2 Z`} fill="#FFB3C1" stroke="#F50057" strokeWidth={0.5} opacity={0.8} />
          <Path d={`M0,-1 Q6,1 7,5 Q3,6 0,2 Z`} fill="#FFB3C1" stroke="#F50057" strokeWidth={0.5} opacity={0.8} />
          {/* Wing pattern dots */}
          <Circle cx={-5} cy={-2} r={1} fill="#FFEB3B" />
          <Circle cx={5} cy={-2} r={1} fill="#FFEB3B" />
          <Circle cx={-5} cy={3} r={0.8} fill="#FFF" />
          <Circle cx={5} cy={3} r={0.8} fill="#FFF" />
          {/* Butterfly body */}
          <Ellipse cx={0} cy={1} rx={0.8} ry={3} fill="#6D4C41" />
          {/* Antennae */}
          <Path d={`M-1,-1 Q-4,-5 -3,-7`} fill="none" stroke="#6D4C41" strokeWidth={0.5} />
          <Path d={`M1,-1 Q4,-5 3,-7`} fill="none" stroke="#6D4C41" strokeWidth={0.5} />
          <Circle cx={-3} cy={-7} r={0.6} fill="#9C27B0" />
          <Circle cx={3} cy={-7} r={0.6} fill="#9C27B0" />
        </G>
      </Svg>
    );
  }

  // --- Boy Helmets (hat-b1 to hat-b5) ---
  if (id === 'hat-b1') {
    // Viking Helmet
    return (
      <Svg width={size} height={size} viewBox="-16 -16 32 32">
        <G>
          <Path d="M-10,-2 Q-10,-12 0,-12 Q10,-12 10,-2 Z" fill="#795548" stroke="#5D4037" strokeWidth={1.5} />
          <Path d="M-10,-6 Q-15,-15 -12,-18" fill="none" stroke="#FFD54F" strokeWidth={3} strokeLinecap="round" />
          <Path d="M10,-6 Q15,-15 12,-18" fill="none" stroke="#FFD54F" strokeWidth={3} strokeLinecap="round" />
          <Rect x={-11} y={-3} width={22} height={2} fill="#5D4037" />
        </G>
      </Svg>
    );
  }
  if (id === 'hat-b2') {
    // Astronaut Helmet
    return (
      <Svg width={size} height={size} viewBox="-16 -16 32 32">
        <G>
          <Path d="M-12,4 Q-12,-14 0,-14 Q12,-14 12,4 Q0,8 -12,4 Z" fill="#ECEFF1" stroke="#90A4AE" strokeWidth={2} />
          <Path d="M-8,-2 Q0,-5 8,-2 L7,4 Q0,6 -7,4 Z" fill="rgba(255,152,0,0.3)" stroke="#FF9800" strokeWidth={1} />
          <Line x1={5} y1={-14} x2={5} y2={-17} stroke="#90A4AE" strokeWidth={1.5} />
          <Circle cx={5} cy={-18} r={2} fill="#F44336" />
        </G>
      </Svg>
    );
  }
  if (id === 'hat-b3') {
    // Knight Helmet
    return (
      <Svg width={size} height={size} viewBox="-16 -16 32 32">
        <G>
          <Path d="M-10,3 Q-10,-12 0,-14 Q10,-12 10,3 Z" fill="#78909C" stroke="#546E7A" strokeWidth={1.5} />
          <Rect x={-7} y={-1} width={14} height={1.5} fill="#263238" />
          <Rect x={-5} y={1} width={10} height={1} fill="#263238" />
          <Path d="M0,-14 Q5,-18 8,-16 Q5,-15 0,-14 Z" fill="#F44336" />
          <Circle cx={-7} cy={-4} r={1.5} fill="#455A64" />
          <Circle cx={7} cy={-4} r={1.5} fill="#455A64" />
        </G>
      </Svg>
    );
  }
  if (id === 'hat-b4') {
    // Firefighter Helmet
    return (
      <Svg width={size} height={size} viewBox="-16 -16 32 32">
        <G>
          <Ellipse cx={0} cy={-3} rx={13} ry={3} fill="#D32F2F" />
          <Path d="M-9,-3 Q-9,-12 0,-13 Q9,-12 9,-3 Z" fill="#F44336" stroke="#C62828" strokeWidth={1} />
          <Circle cx={0} cy={-7} r={3} fill="#FFD700" stroke="#FFC107" strokeWidth={0.5} />
          <Circle cx={0} cy={-7} r={1.5} fill="#FFF" />
          <Path d="M-7,-3 L-9,0 L9,0 L7,-3" fill="#F44336" stroke="#C62828" strokeWidth={1} />
        </G>
      </Svg>
    );
  }
  if (id === 'hat-b5') {
    // Racing Helmet
    return (
      <Svg width={size} height={size} viewBox="-16 -16 32 32">
        <G>
          <Path d="M-10,3 Q-10,-12 0,-13 Q10,-12 10,3 L8,5 Q0,8 -8,5 Z" fill="#1565C0" stroke="#0D47A1" strokeWidth={1.5} />
          <Path d="M-8,0 Q0,-3 8,0 L7,4 Q0,6 -7,4 Z" fill="rgba(33,150,243,0.3)" stroke="#1976D2" strokeWidth={1} />
          <Line x1={0} y1={-13} x2={0} y2={8} stroke="#FFD600" strokeWidth={3} />
        </G>
      </Svg>
    );
  }

  if (id === 'hat-dragon') {
    return (
      <Svg width={size} height={size} viewBox="-16 -16 32 32">
        <G>
          {/* Main helmet shape - enlarged and more enclosing */}
          <Path d="M-14,8 Q-16,-18 0,-20 Q16,-18 14,8 Q0,15 -14,8 Z" fill="#4CAF50" stroke="#2E7D32" strokeWidth={1.5} />
          {/* Spikes */}
          <Path d="M-4,-18 L0,-24 L4,-18" fill="#FB8C00" stroke="#E65100" strokeWidth={0.5} />
          <Path d="M-12,-10 L-16,-16 L-8,-14" fill="#FB8C00" stroke="#E65100" strokeWidth={0.5} />
          <Path d="M12,-10 L16,-16 L8,-14" fill="#FB8C00" stroke="#E65100" strokeWidth={0.5} />
          {/* Eyes */}
          <Circle cx={-6} cy={-6} r={2.5} fill="#FFF" stroke="#2E7D32" strokeWidth={0.5} />
          <Circle cx={6} cy={-6} r={2.5} fill="#FFF" stroke="#2E7D32" strokeWidth={0.5} />
          <Circle cx={-6} cy={-6} r={1.2} fill="#000" />
          <Circle cx={6} cy={-6} r={1.2} fill="#000" />
        </G>
      </Svg>
    );
  }
  // --- Girl Helmets (hat-g1 to hat-g5) ---
  if (id === 'hat-g1') {
    // Bunny Ears Helmet
    return (
      <Svg width={size} height={size} viewBox="-16 -16 32 32">
        <G>
          <Path d="M-8,-1 Q-8,-10 0,-10 Q8,-10 8,-1 Z" fill="#F8BBD0" stroke="#F06292" strokeWidth={1} />
          <Ellipse cx={-4} cy={-15} rx={2.5} ry={7} fill="#F8BBD0" stroke="#F06292" strokeWidth={1} />
          <Ellipse cx={-4} cy={-15} rx={1.2} ry={4.5} fill="#FF80AB" />
          <Ellipse cx={4} cy={-15} rx={2.5} ry={7} fill="#F8BBD0" stroke="#F06292" strokeWidth={1} />
          <Ellipse cx={4} cy={-15} rx={1.2} ry={4.5} fill="#FF80AB" />
        </G>
      </Svg>
    );
  }
  if (id === 'hat-g2') {
    // Princess Tiara
    return (
      <Svg width={size} height={size} viewBox="-16 -16 32 32">
        <G>
          <Path d="M-9,-4 Q-9,-6 0,-7 Q9,-6 9,-4" fill="none" stroke="#FFD700" strokeWidth={3} />
          <Path d="M-6,-5 L-4,-12 L-2,-6" fill="#FFD700" stroke="#FFC107" strokeWidth={1} />
          <Path d="M-1,-6.5 L0,-15 L1,-6.5" fill="#FFD700" stroke="#FFC107" strokeWidth={1} />
          <Path d="M2,-6 L4,-12 L6,-5" fill="#FFD700" stroke="#FFC107" strokeWidth={1} />
          <Circle cx={0} cy={-13} r={1.5} fill="#E91E63" />
          <Circle cx={-4} cy={-10} r={1} fill="#00BCD4" />
          <Circle cx={4} cy={-10} r={1} fill="#00BCD4" />
        </G>
      </Svg>
    );
  }
  if (id === 'hat-g3') {
    // Unicorn Helmet
    return (
      <Svg width={size} height={size} viewBox="-16 -16 32 32">
        <G>
          <Path d="M-9,-2 Q-9,-11 0,-11 Q9,-11 9,-2 Z" fill="#E1BEE7" stroke="#CE93D8" strokeWidth={1} />
          <Path d="M-1,-11 L0,-18 L1,-11 Z" fill="#FFD700" stroke="#FFC107" strokeWidth={1} />
          <Path d="M9,-7 Q12,-4 11,1" fill="none" stroke="#FF5252" strokeWidth={2} />
          <Path d="M9,-5 Q13,-2 12,3" fill="none" stroke="#FFEB3B" strokeWidth={2} />
          <Path d="M9,-3 Q14,0 13,5" fill="none" stroke="#69F0AE" strokeWidth={2} />
        </G>
      </Svg>
    );
  }
  if (id === 'hat-g4') {
    // Flower Crown
    return (
      <Svg width={size} height={size} viewBox="-16 -16 32 32">
        <G>
          <Path d="M-10,-3 Q0,-9 10,-3" fill="none" stroke="#4CAF50" strokeWidth={2} />
          <Circle cx={-7} cy={-4} r={2.5} fill="#F06292" />
          <Circle cx={-7} cy={-4} r={1} fill="#FFD700" />
          <Circle cx={-3} cy={-6} r={3} fill="#FF80AB" />
          <Circle cx={-3} cy={-6} r={1.2} fill="#FFD700" />
          <Circle cx={1} cy={-7.5} r={3.5} fill="#E91E63" />
          <Circle cx={1} cy={-7.5} r={1.5} fill="#FFD700" />
          <Circle cx={5} cy={-6} r={3} fill="#FF80AB" />
          <Circle cx={5} cy={-6} r={1.2} fill="#FFD700" />
          <Circle cx={9} cy={-4} r={2.5} fill="#F06292" />
          <Circle cx={9} cy={-4} r={1} fill="#FFD700" />
        </G>
      </Svg>
    );
  }
  if (id === 'hat-g5') {
    // Cat Ears Helmet
    return (
      <Svg width={size} height={size} viewBox="-16 -16 32 32">
        <G>
          <Path d="M-8,-1 Q-8,-10 0,-10 Q8,-10 8,-1 Z" fill="#FF9800" stroke="#F57C00" strokeWidth={1} />
          <Path d="M-7,-8 L-8,-15 L-2,-9 Z" fill="#FF9800" stroke="#F57C00" strokeWidth={1} />
          <Path d="M-6,-9 L-7.5,-13 L-3,-9.5 Z" fill="#FFE0B2" />
          <Path d="M7,-8 L8,-15 L2,-9 Z" fill="#FF9800" stroke="#F57C00" strokeWidth={1} />
          <Path d="M6,-9 L7.5,-13 L3,-9.5 Z" fill="#FFE0B2" />
          <Circle cx={-3} cy={-4} r={1} fill="#5D4037" />
          <Circle cx={3} cy={-4} r={1} fill="#5D4037" />
        </G>
      </Svg>
    );
  }
  // --- Boy Hairstyles (hair-b6 to hair-b10) ---
  if (id === 'hair-b6') {
    // Spiky Blue
    return (
      <Svg width={size} height={size} viewBox="-16 -16 32 32">
        <G>
          <Path d="M-8,0 L-6,-12 L-2,-3 L0,-15 L2,-3 L6,-12 L8,0 Q0,-3 -8,0 Z" fill="#2196F3" stroke="#1565C0" strokeWidth={1} />
          <Path d="M-4,0 L-3,-8 L-1,-2" fill="none" stroke="#64B5F6" strokeWidth={1} />
          <Path d="M1,-2 L3,-9 L4,0" fill="none" stroke="#64B5F6" strokeWidth={1} />
        </G>
      </Svg>
    );
  }
  if (id === 'hair-b7') {
    // Curly Afro
    return (
      <Svg width={size} height={size} viewBox="-16 -16 32 32">
        <G>
          <Circle cx={0} cy={-4} r={12} fill="#5D4037" stroke="#3E2723" strokeWidth={1.5} />
          <Circle cx={-5} cy={-2} r={2.5} fill="none" stroke="#795548" strokeWidth={1} />
          <Circle cx={4} cy={-4} r={2} fill="none" stroke="#795548" strokeWidth={1} />
          <Circle cx={-2} cy={-9} r={2.5} fill="none" stroke="#795548" strokeWidth={1} />
          <Circle cx={3} cy={-11} r={2} fill="none" stroke="#795548" strokeWidth={1} />
          <Circle cx={7} cy={-6} r={1.8} fill="none" stroke="#795548" strokeWidth={1} />
          <Circle cx={-7} cy={-7} r={2} fill="none" stroke="#795548" strokeWidth={1} />
        </G>
      </Svg>
    );
  }
  if (id === 'hair-b8') {
    // Samurai Bun
    return (
      <Svg width={size} height={size} viewBox="-16 -16 32 32">
        <G>
          <Path d="M-8,0 Q-8,-4 -4,-5 L4,-5 Q8,-4 8,0 Q0,-3 -8,0 Z" fill="#263238" stroke="#000" strokeWidth={0.5} />
          <Path d="M-4,-5 Q-4,-10 0,-10 Q4,-10 4,-5 Z" fill="#212121" stroke="#000" strokeWidth={1} />
          <Circle cx={0} cy={-12} r={3} fill="#212121" stroke="#000" strokeWidth={1} />
          <Ellipse cx={0} cy={-9.5} rx={1.5} ry={0.7} fill="#F44336" />
        </G>
      </Svg>
    );
  }
  if (id === 'hair-b9') {
    // Red Fade
    return (
      <Svg width={size} height={size} viewBox="-16 -16 32 32">
        <G>
          <Path d="M-8,0 Q-8,-3 -5,-3 L5,-3 Q8,-3 8,0 Q0,-2 -8,0 Z" fill="#8D6E63" stroke="#5D4037" strokeWidth={0.5} />
          <Path d="M-5,-3 Q-5,-9 0,-9 Q5,-9 5,-3 Z" fill="#F44336" stroke="#D32F2F" strokeWidth={1} />
          <Line x1={-5} y1={-3} x2={5} y2={-3} stroke="#D32F2F" strokeWidth={1.5} />
        </G>
      </Svg>
    );
  }
  if (id === 'hair-b10') {
    // Wavy Blonde
    return (
      <Svg width={size} height={size} viewBox="-16 -16 32 32">
        <G>
          <Path d="M-9,3 Q-10,-4 -7,-8 Q-3,-10 0,-9 Q3,-10 7,-8 Q10,-4 9,3 Q5,-1 0,-2 Q-5,-1 -9,3 Z" fill="#FFD54F" stroke="#FFB300" strokeWidth={1} />
          <Path d="M-6,-1 Q-4,-4 -1,-1" fill="none" stroke="#FFC107" strokeWidth={1} />
          <Path d="M1,-2 Q4,-5 7,-2" fill="none" stroke="#FFC107" strokeWidth={1} />
        </G>
      </Svg>
    );
  }
  // --- Girl Hairstyles (hair-g6 to hair-g10) ---
  if (id === 'hair-g6') {
    // Super Curly Pink
    return (
      <Svg width={size} height={size} viewBox="-16 -16 32 32">
        <G>
          <Circle cx={-7} cy={-2} r={4} fill="#F48FB1" stroke="#E91E63" strokeWidth={0.8} />
          <Circle cx={7} cy={-2} r={4} fill="#F48FB1" stroke="#E91E63" strokeWidth={0.8} />
          <Circle cx={-4} cy={-6} r={4} fill="#F48FB1" stroke="#E91E63" strokeWidth={0.8} />
          <Circle cx={4} cy={-6} r={4} fill="#F48FB1" stroke="#E91E63" strokeWidth={0.8} />
          <Circle cx={0} cy={-9} r={4} fill="#F48FB1" stroke="#E91E63" strokeWidth={0.8} />
          <Circle cx={-8} cy={5} r={3} fill="#F48FB1" stroke="#E91E63" strokeWidth={0.5} />
          <Circle cx={8} cy={5} r={3} fill="#F48FB1" stroke="#E91E63" strokeWidth={0.5} />
        </G>
      </Svg>
    );
  }
  if (id === 'hair-g7') {
    // Long Purple
    return (
      <Svg width={size} height={size} viewBox="-16 -16 32 32">
        <G>
          <Path d="M-8,0 Q-8,-9 0,-9 Q8,-9 8,0 Q0,-4 -8,0 Z" fill="#7B1FA2" stroke="#6A1B9A" strokeWidth={1} />
          <Path d="M-8,0 Q-9,8 -7,14" fill="none" stroke="#7B1FA2" strokeWidth={4} strokeLinecap="round" />
          <Path d="M8,0 Q9,8 7,14" fill="none" stroke="#7B1FA2" strokeWidth={4} strokeLinecap="round" />
          <Path d="M-4,-4 Q-1,-7 2,-4" fill="none" stroke="#CE93D8" strokeWidth={1} />
        </G>
      </Svg>
    );
  }
  if (id === 'hair-g8') {
    // Space Buns
    return (
      <Svg width={size} height={size} viewBox="-16 -16 32 32">
        <G>
          <Path d="M-8,0 Q-8,-8 0,-8 Q8,-8 8,0 Q0,-4 -8,0 Z" fill="#E91E63" stroke="#C2185B" strokeWidth={1} />
          <Circle cx={-6} cy={-11} r={4} fill="#E91E63" stroke="#C2185B" strokeWidth={1} />
          <Path d="M-8,-13 Q-6,-10 -4,-13" fill="none" stroke="#F06292" strokeWidth={1} />
          <Circle cx={6} cy={-11} r={4} fill="#E91E63" stroke="#C2185B" strokeWidth={1} />
          <Path d="M4,-13 Q6,-10 8,-13" fill="none" stroke="#F06292" strokeWidth={1} />
        </G>
      </Svg>
    );
  }
  if (id === 'hair-g9') {
    // Rainbow Braid
    return (
      <Svg width={size} height={size} viewBox="-16 -16 32 32">
        <G>
          <Path d="M-8,0 Q-8,-9 0,-9 Q8,-9 8,0 Q0,-4 -8,0 Z" fill="#F44336" stroke="#D32F2F" strokeWidth={1} />
          <Path d="M5,2 Q7,5 4,8" fill="none" stroke="#FF9800" strokeWidth={3} strokeLinecap="round" />
          <Path d="M4,8 Q2,11 5,13" fill="none" stroke="#FFEB3B" strokeWidth={2.5} strokeLinecap="round" />
          <Path d="M5,13 Q7,15 5,17" fill="none" stroke="#4CAF50" strokeWidth={2} strokeLinecap="round" />
          <Circle cx={5} cy={18} r={1.5} fill="#E040FB" />
        </G>
      </Svg>
    );
  }
  if (id === 'hair-g10') {
    // Short Wavy Blue
    return (
      <Svg width={size} height={size} viewBox="-16 -16 32 32">
        <G>
          <Path d="M-9,4 Q-10,-2 -7,-7 Q-3,-10 0,-9 Q3,-10 7,-7 Q10,-2 9,4 Q6,2 3,3 Q0,5 -3,3 Q-6,2 -9,4 Z" fill="#29B6F6" stroke="#0288D1" strokeWidth={1} />
          <Path d="M-6,-1 Q-3,-4 -1,-1" fill="none" stroke="#4FC3F7" strokeWidth={1} />
          <Path d="M1,-2 Q4,-5 6,-2" fill="none" stroke="#4FC3F7" strokeWidth={1} />
        </G>
      </Svg>
    );
  }

  // --- Boy Glasses (glasses-b1 to glasses-b5) ---
  if (id === 'glasses-b1') {
    // Aviator Shades
    return (
      <Svg width={size} height={size} viewBox="-16 -16 32 32">
        <G>
          <Path d="M-12,-2 Q-12,-8 -6,-8 Q0,-8 0,-2 L-1,4 Q-6,6 -11,4 Z" fill="rgba(30,30,30,0.5)" stroke="#455A64" strokeWidth={1.5} />
          <Path d="M12,-2 Q12,-8 6,-8 Q0,-8 0,-2 L1,4 Q6,6 11,4 Z" fill="rgba(30,30,30,0.5)" stroke="#455A64" strokeWidth={1.5} />
          <Line x1={0} y1={-4} x2={0} y2={-4} stroke="#FFD700" strokeWidth={2} />
          <Line x1={-12} y1={-3} x2={-15} y2={-6} stroke="#455A64" strokeWidth={1.5} />
          <Line x1={12} y1={-3} x2={15} y2={-6} stroke="#455A64" strokeWidth={1.5} />
        </G>
      </Svg>
    );
  }
  if (id === 'glasses-b2') {
    // Pixel Specs
    return (
      <Svg width={size} height={size} viewBox="-16 -16 32 32">
        <G>
          <Rect x={-13} y={-5} width={11} height={8} fill="rgba(76,175,80,0.3)" stroke="#4CAF50" strokeWidth={2} />
          <Rect x={2} y={-5} width={11} height={8} fill="rgba(76,175,80,0.3)" stroke="#4CAF50" strokeWidth={2} />
          <Rect x={-1} y={-1} width={2} height={2} fill="#4CAF50" />
          <Rect x={-11} y={-3} width={3} height={3} fill="#FFF" opacity={0.4} />
        </G>
      </Svg>
    );
  }
  if (id === 'glasses-b3') {
    // Scientist Goggles
    return (
      <Svg width={size} height={size} viewBox="-16 -16 32 32">
        <G>
          <Circle cx={-7} cy={0} r={7} fill="rgba(255,152,0,0.15)" stroke="#FF9800" strokeWidth={2.5} />
          <Circle cx={7} cy={0} r={7} fill="rgba(255,152,0,0.15)" stroke="#FF9800" strokeWidth={2.5} />
          <Circle cx={-7} cy={0} r={4.5} fill="none" stroke="#FFB74D" strokeWidth={1} />
          <Circle cx={7} cy={0} r={4.5} fill="none" stroke="#FFB74D" strokeWidth={1} />
          <Line x1={0} y1={0} x2={0} y2={0} stroke="#FF9800" strokeWidth={2} />
          <Line x1={-14} y1={0} x2={-15} y2={-4} stroke="#795548" strokeWidth={2} />
          <Line x1={14} y1={0} x2={15} y2={-4} stroke="#795548" strokeWidth={2} />
        </G>
      </Svg>
    );
  }
  if (id === 'glasses-b4') {
    // Sports Visor
    return (
      <Svg width={size} height={size} viewBox="-16 -16 32 32">
        <G>
          <Path d="M-13,-3 Q0,-10 13,-3 L12,4 Q0,2 -12,4 Z" fill="rgba(33,150,243,0.4)" stroke="#1976D2" strokeWidth={1.5} />
          <Line x1={-13} y1={-3} x2={-15} y2={-7} stroke="#1976D2" strokeWidth={1.5} />
          <Line x1={13} y1={-3} x2={15} y2={-7} stroke="#1976D2" strokeWidth={1.5} />
        </G>
      </Svg>
    );
  }
  if (id === 'glasses-b5') {
    // 3D Glasses
    return (
      <Svg width={size} height={size} viewBox="-16 -16 32 32">
        <G>
          <Rect x={-13} y={-5} width={11} height={9} rx={2} fill="rgba(244,67,54,0.35)" stroke="#F44336" strokeWidth={1.5} />
          <Rect x={2} y={-5} width={11} height={9} rx={2} fill="rgba(33,150,243,0.35)" stroke="#2196F3" strokeWidth={1.5} />
          <Line x1={-2} y1={0} x2={2} y2={0} stroke="#37474F" strokeWidth={2} />
          <Line x1={-13} y1={0} x2={-15} y2={-4} stroke="#37474F" strokeWidth={1.5} />
          <Line x1={13} y1={0} x2={15} y2={-4} stroke="#37474F" strokeWidth={1.5} />
        </G>
      </Svg>
    );
  }
  // --- Girl Glasses (glasses-g1 to glasses-g5) ---
  if (id === 'glasses-g1') {
    // Heart Glasses
    return (
      <Svg width={size} height={size} viewBox="-16 -16 32 32">
        <G>
          <Path d="M-7,4 Q-14,-2 -10,-7 Q-7,-4 -4,-7 Q0,-2 -7,4 Z" fill="rgba(233,30,99,0.3)" stroke="#E91E63" strokeWidth={1.5} />
          <Path d="M7,4 Q0,-2 4,-7 Q7,-4 10,-7 Q14,-2 7,4 Z" fill="rgba(233,30,99,0.3)" stroke="#E91E63" strokeWidth={1.5} />
          <Line x1={-2} y1={0} x2={2} y2={0} stroke="#E91E63" strokeWidth={1.5} />
        </G>
      </Svg>
    );
  }
  if (id === 'glasses-g2') {
    // Star Sparkle Specs
    return (
      <Svg width={size} height={size} viewBox="-16 -16 32 32">
        <G>
          <Path d="M-7,-8 L-5.5,-3 L-1,-2 L-5,-0.5 L-4,5 L-7,2 L-10,5 L-9,-0.5 L-13,-2 L-8.5,-3 Z" fill="rgba(255,215,0,0.2)" stroke="#FFD700" strokeWidth={1.5} />
          <Path d="M7,-8 L8.5,-3 L13,-2 L9,-0.5 L10,5 L7,2 L4,5 L5,-0.5 L1,-2 L5.5,-3 Z" fill="rgba(255,215,0,0.2)" stroke="#FFD700" strokeWidth={1.5} />
          <Line x1={-1} y1={0} x2={1} y2={0} stroke="#FFD700" strokeWidth={1.5} />
        </G>
      </Svg>
    );
  }
  if (id === 'glasses-g3') {
    // Cat Eye Frames
    return (
      <Svg width={size} height={size} viewBox="-16 -16 32 32">
        <G>
          <Path d="M-12,3 L-14,-6 L0,-6 L-2,3 Z" fill="rgba(156,39,176,0.2)" stroke="#9C27B0" strokeWidth={1.5} />
          <Path d="M12,3 L14,-6 L0,-6 L2,3 Z" fill="rgba(156,39,176,0.2)" stroke="#9C27B0" strokeWidth={1.5} />
        </G>
      </Svg>
    );
  }
  if (id === 'glasses-g4') {
    // Flower Glasses
    return (
      <Svg width={size} height={size} viewBox="-16 -16 32 32">
        <G>
          <Circle cx={-7} cy={0} r={6} fill="rgba(255,152,0,0.15)" stroke="#FF9800" strokeWidth={1.5} />
          <Circle cx={7} cy={0} r={6} fill="rgba(255,152,0,0.15)" stroke="#FF9800" strokeWidth={1.5} />
          <Circle cx={-7} cy={-7} r={2} fill="#FFCC02" />
          <Circle cx={-13} cy={-2} r={2} fill="#FFCC02" />
          <Circle cx={-1} cy={-2} r={2} fill="#FFCC02" />
          <Circle cx={7} cy={-7} r={2} fill="#FFCC02" />
          <Circle cx={13} cy={-2} r={2} fill="#FFCC02" />
          <Circle cx={1} cy={-2} r={2} fill="#FFCC02" />
          <Line x1={-1} y1={0} x2={1} y2={0} stroke="#FF9800" strokeWidth={1.5} />
        </G>
      </Svg>
    );
  }
  if (id === 'glasses-g5') {
    // Rainbow Frames
    return (
      <Svg width={size} height={size} viewBox="-16 -16 32 32">
        <G>
          <Circle cx={-7} cy={0} r={7} fill="none" stroke="#FF5252" strokeWidth={1} />
          <Circle cx={-7} cy={0} r={5.5} fill="none" stroke="#FFEB3B" strokeWidth={1} />
          <Circle cx={-7} cy={0} r={4} fill="none" stroke="#4CAF50" strokeWidth={1} />
          <Circle cx={7} cy={0} r={7} fill="none" stroke="#2196F3" strokeWidth={1} />
          <Circle cx={7} cy={0} r={5.5} fill="none" stroke="#E040FB" strokeWidth={1} />
          <Circle cx={7} cy={0} r={4} fill="none" stroke="#FF9800" strokeWidth={1} />
          <Line x1={0} y1={0} x2={0} y2={0} stroke="#FF5252" strokeWidth={1.5} />
        </G>
      </Svg>
    );
  }
  // --- Boy Face Items (face-b1 to face-b5) ---
  if (id === 'face-b1') {
    // Pirate Eye Patch
    return (
      <Svg width={size} height={size} viewBox="-16 -16 32 32">
        <G>
          <Ellipse cx={4} cy={0} rx={7} ry={6} fill="#212121" stroke="#000" strokeWidth={1.5} />
          <Line x1={-3} y1={-4} x2={-12} y2={-10} stroke="#37474F" strokeWidth={1.5} />
          <Line x1={11} y1={-4} x2={14} y2={-10} stroke="#37474F" strokeWidth={1.5} />
          <Circle cx={4} cy={-1} r={2} fill="#FFF" />
          <Circle cx={3.5} cy={-1.5} r={0.6} fill="#000" />
          <Circle cx={4.5} cy={-1.5} r={0.6} fill="#000" />
        </G>
      </Svg>
    );
  }
  if (id === 'face-b2') {
    // Robot Visor
    return (
      <Svg width={size} height={size} viewBox="-16 -16 32 32">
        <G>
          <Path d="M-12,-3 L12,-3 L10,4 L-10,4 Z" fill="rgba(0,229,255,0.3)" stroke="#00E5FF" strokeWidth={2} />
          <Line x1={-8} y1={1} x2={8} y2={1} stroke="#00E5FF" strokeWidth={1.5} />
          <Circle cx={-5} cy={0} r={2} fill="#00E5FF" />
          <Circle cx={5} cy={0} r={2} fill="#00E5FF" />
        </G>
      </Svg>
    );
  }
  if (id === 'face-b3') {
    // War Paint
    return (
      <Svg width={size} height={size} viewBox="-16 -16 32 32">
        <G>
          <Line x1={-14} y1={-2} x2={-4} y2={-3} stroke="#1565C0" strokeWidth={3} strokeLinecap="round" />
          <Line x1={-14} y1={2} x2={-3} y2={1} stroke="#1565C0" strokeWidth={2.5} strokeLinecap="round" />
          <Line x1={-13} y1={6} x2={-5} y2={5} stroke="#1565C0" strokeWidth={2} strokeLinecap="round" />
          <Line x1={4} y1={-3} x2={14} y2={-2} stroke="#1565C0" strokeWidth={3} strokeLinecap="round" />
          <Line x1={3} y1={1} x2={14} y2={2} stroke="#1565C0" strokeWidth={2.5} strokeLinecap="round" />
          <Line x1={5} y1={5} x2={13} y2={6} stroke="#1565C0" strokeWidth={2} strokeLinecap="round" />
        </G>
      </Svg>
    );
  }
  if (id === 'face-b4') {
    // Ninja Mask
    return (
      <Svg width={size} height={size} viewBox="-16 -16 32 32">
        <G>
          <Path d="M-12,-2 Q-12,8 0,10 Q12,8 12,-2 L12,-6 L-12,-6 Z" fill="#212121" stroke="#000" strokeWidth={1} />
          <Line x1={-4} y1={2} x2={4} y2={2} stroke="#37474F" strokeWidth={1} strokeDasharray="2,2" />
          <Circle cx={-5} cy={-7} r={2.5} fill="#FFF" stroke="#000" strokeWidth={0.5} />
          <Circle cx={5} cy={-7} r={2.5} fill="#FFF" stroke="#000" strokeWidth={0.5} />
          <Circle cx={-5} cy={-7} r={1} fill="#000" />
          <Circle cx={5} cy={-7} r={1} fill="#000" />
        </G>
      </Svg>
    );
  }
  if (id === 'face-b5') {
    // Dragon Face Paint
    return (
      <Svg width={size} height={size} viewBox="-16 -16 32 32">
        <G>
          <Path d="M-10,0 Q-12,-3 -14,1 Q-12,4 -10,3 Z" fill="#4CAF50" stroke="#2E7D32" strokeWidth={0.8} />
          <Path d="M-7,1 Q-9,-2 -11,2 Q-9,5 -7,4 Z" fill="#66BB6A" stroke="#2E7D32" strokeWidth={0.5} />
          <Path d="M10,0 Q12,-3 14,1 Q12,4 10,3 Z" fill="#4CAF50" stroke="#2E7D32" strokeWidth={0.8} />
          <Path d="M7,1 Q9,-2 11,2 Q9,5 7,4 Z" fill="#66BB6A" stroke="#2E7D32" strokeWidth={0.5} />
          <Path d="M-8,-7 Q-5,-10 -2,-7" fill="none" stroke="#FF5722" strokeWidth={1.5} />
          <Path d="M2,-7 Q5,-10 8,-7" fill="none" stroke="#FF5722" strokeWidth={1.5} />
          <Circle cx={-5} cy={-4} r={2} fill="#FFEB3B" stroke="#FF9800" strokeWidth={0.5} />
          <Circle cx={5} cy={-4} r={2} fill="#FFEB3B" stroke="#FF9800" strokeWidth={0.5} />
          <Circle cx={-5} cy={-4} r={0.8} fill="#2E7D32" />
          <Circle cx={5} cy={-4} r={0.8} fill="#2E7D32" />
        </G>
      </Svg>
    );
  }
  // --- Girl Face Items (face-g1 to face-g5) ---
  if (id === 'face-g1') {
    // Butterfly Face Paint
    return (
      <Svg width={size} height={size} viewBox="-16 -16 32 32">
        <G>
          <Path d="M0,1 Q-7,-7 -10,0 Q-7,7 0,3 Z" fill="rgba(224,64,251,0.5)" stroke="#E040FB" strokeWidth={0.8} />
          <Path d="M0,1 Q7,-7 10,0 Q7,7 0,3 Z" fill="rgba(224,64,251,0.5)" stroke="#E040FB" strokeWidth={0.8} />
          <Ellipse cx={0} cy={2} rx={1} ry={3} fill="#7B1FA2" />
          <Circle cx={-6} cy={-1} r={1.5} fill="#FFEB3B" />
          <Circle cx={6} cy={-1} r={1.5} fill="#FFEB3B" />
          <Path d="M-1,0 Q-3,-5 -4,-6" fill="none" stroke="#7B1FA2" strokeWidth={0.5} />
          <Path d="M1,0 Q3,-5 4,-6" fill="none" stroke="#7B1FA2" strokeWidth={0.5} />
          <Circle cx={-4} cy={-6} r={0.8} fill="#9C27B0" />
          <Circle cx={4} cy={-6} r={0.8} fill="#9C27B0" />
        </G>
      </Svg>
    );
  }
  if (id === 'face-g2') {
    // Kitty Face
    return (
      <Svg width={size} height={size} viewBox="-16 -16 32 32">
        <G>
          <Path d="M-2,0 L2,0 L0,4 Z" fill="#F48FB1" />
          <Line x1={-3} y1={1} x2={-12} y2={-2} stroke="#795548" strokeWidth={0.8} />
          <Line x1={-3} y1={3} x2={-12} y2={3} stroke="#795548" strokeWidth={0.8} />
          <Line x1={-3} y1={5} x2={-12} y2={8} stroke="#795548" strokeWidth={0.8} />
          <Line x1={3} y1={1} x2={12} y2={-2} stroke="#795548" strokeWidth={0.8} />
          <Line x1={3} y1={3} x2={12} y2={3} stroke="#795548" strokeWidth={0.8} />
          <Line x1={3} y1={5} x2={12} y2={8} stroke="#795548" strokeWidth={0.8} />
          <Ellipse cx={-8} cy={5} rx={3} ry={1.5} fill="#FF8A80" opacity={0.6} />
          <Ellipse cx={8} cy={5} rx={3} ry={1.5} fill="#FF8A80" opacity={0.6} />
          <Circle cx={-4} cy={-4} r={2.5} fill="#FFF" stroke="#000" strokeWidth={0.5} />
          <Circle cx={4} cy={-4} r={2.5} fill="#FFF" stroke="#000" strokeWidth={0.5} />
          <Circle cx={-4} cy={-4} r={1.2} fill="#000" />
          <Circle cx={4} cy={-4} r={1.2} fill="#000" />
        </G>
      </Svg>
    );
  }
  if (id === 'face-g3') {
    // Rainbow Sparkle
    return (
      <Svg width={size} height={size} viewBox="-16 -16 32 32">
        <G>
          <Path d="M-12,5 Q-6,-3 0,5" fill="none" stroke="#FF5252" strokeWidth={2} />
          <Path d="M-11,4 Q-5.5,-2 0,4" fill="none" stroke="#FFEB3B" strokeWidth={2} />
          <Path d="M-10,3 Q-5,0 0,3" fill="none" stroke="#4CAF50" strokeWidth={2} />
          <Circle cx={6} cy={-2} r={2} fill="#FFD700" />
          <Circle cx={10} cy={2} r={1.5} fill="#FF80AB" />
          <Circle cx={8} cy={6} r={1.8} fill="#00BCD4" />
          <Circle cx={4} cy={4} r={1.2} fill="#E040FB" />
        </G>
      </Svg>
    );
  }
  if (id === 'face-g4') {
    // Flower Crown Paint
    return (
      <Svg width={size} height={size} viewBox="-16 -16 32 32">
        <G>
          <Path d="M-12,-4 Q0,-10 12,-4" fill="none" stroke="#4CAF50" strokeWidth={1} />
          <Circle cx={-8} cy={-5} r={3} fill="#F06292" />
          <Circle cx={-4} cy={-7} r={3.5} fill="#FF80AB" />
          <Circle cx={0} cy={-8} r={4} fill="#F48FB1" />
          <Circle cx={4} cy={-7} r={3.5} fill="#FF80AB" />
          <Circle cx={8} cy={-5} r={3} fill="#F06292" />
          <Circle cx={-8} cy={-5} r={1} fill="#FFD700" />
          <Circle cx={-4} cy={-7} r={1.2} fill="#FFD700" />
          <Circle cx={0} cy={-8} r={1.5} fill="#FFD700" />
          <Circle cx={4} cy={-7} r={1.2} fill="#FFD700" />
          <Circle cx={8} cy={-5} r={1} fill="#FFD700" />
        </G>
      </Svg>
    );
  }
  if (id === 'face-g5') {
    // Fairy Glitter
    return (
      <Svg width={size} height={size} viewBox="-16 -16 32 32">
        <G>
          <Circle cx={-7} cy={-5} r={1.8} fill="#E040FB" />
          <Circle cx={-3} cy={-8} r={1.3} fill="#FFD700" />
          <Circle cx={2} cy={-6} r={1.5} fill="#00E5FF" />
          <Circle cx={7} cy={-4} r={1.8} fill="#FF80AB" />
          <Circle cx={0} cy={-10} r={2} fill="#FFEB3B" />
          <Path d="M-9,3 Q-11,0 -9,5 Q-7,7 -5,4" fill="none" stroke="#E040FB" strokeWidth={1} />
          <Path d="M9,3 Q11,0 9,5 Q7,7 5,4" fill="none" stroke="#E040FB" strokeWidth={1} />
          <Circle cx={-3} cy={2} r={0.8} fill="#FFEB3B" />
          <Circle cx={3} cy={4} r={0.8} fill="#00E5FF" />
          <Circle cx={0} cy={6} r={0.8} fill="#FF80AB" />
        </G>
      </Svg>
    );
  }

  return <Ionicons name="shirt-outline" size={32} color={color} />;
});

export default AccessoryIcon;
