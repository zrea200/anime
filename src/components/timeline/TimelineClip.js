import React from 'react';
import { Group, Rect, Text } from 'react-konva';

/**
 * 时间轴片段组件
 */
const TimelineClip = ({
  element,
  startX,
  y,
  width,
  trackHeight,
  trackPadding,
  timelinePadding,
  timelineWidth,
  isDragged,
  clipColor,
  clipSelectedColor,
  isLeftHandleHovered,
  isRightHandleHovered,
  onMouseEnterClip,
  onMouseLeaveClip,
  onMouseEnterLeftHandle,
  onMouseLeaveLeftHandle,
  onMouseEnterRightHandle,
  onMouseLeaveRightHandle,
  onDragStart,
  onDragMove,
  onDragEnd
}) => {
  return (
    <Group
      onMouseEnter={onMouseEnterClip}
      onMouseLeave={onMouseLeaveClip}
    >
      {/* 片段主体 */}
      <Rect
        x={startX}
        y={y + trackPadding}
        width={width}
        height={trackHeight - trackPadding * 2}
        fill={isDragged ? clipSelectedColor : clipColor}
        cornerRadius={3}
        stroke={isDragged ? "#fff" : "#888"}
        strokeWidth={1}
        draggable
        onMouseEnter={onMouseEnterClip}
        onMouseLeave={onMouseLeaveClip}
        onDragStart={(e) => onDragStart(e, element.id, 'move')}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
        dragBoundFunc={(pos) => {
          // 允许水平和垂直拖动，但垂直方向只能在轨道位置
          // 计算当前鼠标位置对应的轨道索引
          const headerHeight = 30; // 时间轴头部高度
          const mouseY = pos.y;
          
          // 计算鼠标位置对应的轨道索引（从0开始）
          const trackIndex = Math.max(0, Math.floor((mouseY - headerHeight) / trackHeight));
          
          // 计算对应轨道的Y坐标
          const trackY = headerHeight + trackIndex * trackHeight + trackPadding;
          
          return {
            x: Math.max(timelinePadding, Math.min(timelineWidth - width - timelinePadding, pos.x)),
            y: trackY // 贴合到对应轨道
          };
        }}
      />
      
      {/* 片段标签 */}
      <Text
        x={startX + 5}
        y={y + trackHeight / 2 - 7}
        text={element.type}
        fill="#fff"
        fontSize={10}
        width={Math.max(0, width - 10)}
        ellipsis={true}
        onMouseEnter={onMouseEnterClip}
        onMouseLeave={onMouseLeaveClip}
        listening={true}
      />
      
      {/* 左侧调整区域 - 鼠标悬停检测和拖动 */}
      <Rect
        x={startX}
        y={y + trackPadding}
        width={10}
        height={trackHeight - trackPadding * 2}
        fill={isLeftHandleHovered ? "rgba(255,255,255,0.3)" : "transparent"}
        onMouseEnter={onMouseEnterLeftHandle}
        onMouseLeave={onMouseLeaveLeftHandle}
        draggable
        onDragStart={(e) => onDragStart(e, element.id, 'start')}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
          dragBoundFunc={(pos) => {
            // 只允许在轨道内水平拖动，且不能超过右边界
            return {
              x: Math.max(timelinePadding, Math.min(startX + width - 10, pos.x)),
              y: pos.y // 保持当前垂直位置
            };
          }}
      />
      
      {/* 右侧调整区域 - 鼠标悬停检测和拖动 */}
      <Rect
        x={startX + width - 10}
        y={y + trackPadding}
        width={10}
        height={trackHeight - trackPadding * 2}
        fill={isRightHandleHovered ? "rgba(255,255,255,0.3)" : "transparent"}
        onMouseEnter={onMouseEnterRightHandle}
        onMouseLeave={onMouseLeaveRightHandle}
        draggable
        onDragStart={(e) => onDragStart(e, element.id, 'end')}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
          dragBoundFunc={(pos) => {
            // 只允许在轨道内水平拖动，且不能超过左边界
            return {
              x: Math.max(startX + 10, Math.min(timelineWidth - timelinePadding, pos.x)),
              y: pos.y // 保持当前垂直位置
            };
          }}
      />
    </Group>
  );
};

export default TimelineClip;
