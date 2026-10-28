import React from 'react';
import { RectangleHorizontal, Circle, Type, Image as ImageIcon, Star, Hexagon, Layers, Spline, AudioLines } from 'lucide-react';

const ICONS: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  rect: RectangleHorizontal, ellipse: Circle, text: Type, image: ImageIcon, star: Star, polygon: Hexagon, group: Layers, path: Spline, audio: AudioLines,
};

export const LayerIcon: React.FC<{ type: string; size?: number }> = ({ type, size = 14 }) => {
  const Icon = ICONS[type] || RectangleHorizontal;
  return <Icon size={size} strokeWidth={1.75} />;
};
