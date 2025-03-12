import React from 'react';
import { Group, Line, Rect } from 'react-konva';

/**
 * 时间轴播放头组件
 */
const TimelinePlayhead = ({ 
  x, 
  height, 
  headerHeight, 
  playheadColor, 
  timelinePadding, 
  timelineWidth,
  onDragStart, 
  onDragMove, 
  onDragEnd 
}) => {
  return (
    <Group
      x={x}
      draggable
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      dragBoundFunc={(pos) => {
        // 只允许水平拖动，垂直位置固定
        return {
          x: Math.max(timelinePadding, Math.min(timelineWidth - timelinePadding, pos.x)),
          y: 0 // 固定垂直位置
        };
      }}
    >
      {/* 播放头线 */}
      <Line
        points={[0, 0, 0, height]}
        stroke={playheadColor}
        strokeWidth={2}
      />
      
      {/* 播放头顶部控制区域 */}
      <Rect
        x={-10}
        y={0}
        width={20}
        height={headerHeight}
        fill={playheadColor}
        opacity={0.8}
      />
      
      {/* 增加点击区域，但保持透明 */}
      <Rect
        x={-15}
        y={0}
        width={30}
        height={headerHeight}
        fill="transparent"
      />
    </Group>
  );
};

export default TimelinePlayhead;
