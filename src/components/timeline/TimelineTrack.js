import React from 'react';
import { Group, Rect, Text } from 'react-konva';
import TimelineClip from './TimelineClip';

/**
 * 时间轴轨道组件
 */
const TimelineTrack = ({
  layer,
  index,
  headerHeight,
  trackHeight,
  trackPadding,
  timelineWidth,
  timelinePadding,
  trackBgColor,
  trackActiveColor,
  textColor,
  clipColor,
  clipSelectedColor,
  isActive,
  layerElements,
  draggedElementId,
  hoveredHandle,
  timeToX,
  totalDuration,
  onDragStart,
  onDragMove,
  onDragEnd,
  onHandleHover
}) => {
  const y = headerHeight + index * trackHeight;
  
  return (
    <Group key={`track-${layer.id}`}>
      {/* 轨道背景 */}
      <Rect
        x={0}
        y={y}
        width={timelineWidth}
        height={trackHeight}
        fill={isActive ? trackActiveColor : trackBgColor}
        stroke="#555"
        strokeWidth={1}
      />
      
      {/* 轨道标签 */}
      <Text
        x={5}
        y={y + trackHeight / 2 - 7}
        text={layer.name}
        fill={textColor}
        fontSize={12}
        width={100}
        ellipsis={true}
      />
      
      {/* 元素片段 */}
      {layerElements.map(element => {
        const startX = timeToX(element.time || 0);
        const duration = element.duration || 5;
        const width = (duration / totalDuration) * (timelineWidth - timelinePadding * 2);
        
        // 检查此元素的手柄是否处于悬停状态
        const isLeftHandleHovered = hoveredHandle === `${element.id}-left`;
        const isRightHandleHovered = hoveredHandle === `${element.id}-right`;
        
        return (
          <TimelineClip
            key={`clip-${element.id}`}
            element={element}
            startX={startX}
            y={y}
            width={width}
            trackHeight={trackHeight}
            trackPadding={trackPadding}
            timelinePadding={timelinePadding}
            timelineWidth={timelineWidth}
            isDragged={element.id === draggedElementId}
            clipColor={clipColor}
            clipSelectedColor={clipSelectedColor}
            isLeftHandleHovered={isLeftHandleHovered}
            isRightHandleHovered={isRightHandleHovered}
            onMouseEnterClip={() => {
              document.body.style.cursor = 'move';
            }}
            onMouseLeaveClip={() => {
              document.body.style.cursor = 'default';
            }}
            onMouseEnterLeftHandle={() => onHandleHover(element.id, 'left', true)}
            onMouseLeaveLeftHandle={() => onHandleHover(element.id, 'left', false)}
            onMouseEnterRightHandle={() => onHandleHover(element.id, 'right', true)}
            onMouseLeaveRightHandle={() => onHandleHover(element.id, 'right', false)}
            onDragStart={onDragStart}
            onDragMove={onDragMove}
            onDragEnd={onDragEnd}
          />
        );
      })}
    </Group>
  );
};

export default TimelineTrack;
