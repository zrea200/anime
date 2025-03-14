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
  onClipClick,
  onMouseEnterLeftHandle,
  onMouseLeaveLeftHandle,
  onMouseEnterRightHandle,
  onMouseLeaveRightHandle,
  onDragStart,
  onDragMove,
  onDragEnd
}) => {
  // 内部组件高度
  const clipHeight = trackHeight - trackPadding * 2;
  const clipY = y + trackPadding;
  
  // 处理鼠标移动，检测是否在边缘
  const handleMouseMove = (e) => {
    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();
    
    // 获取片段在舞台上的绝对位置
    const clipPos = e.target.getAbsolutePosition();
    
    // 计算鼠标相对于片段的位置
    const relativeX = pointerPos.x - clipPos.x;
    
    // 边缘检测区域宽度
    const edgeWidth = 10;
    
    if (relativeX <= edgeWidth) {
      // 左边缘
      document.body.style.cursor = 'w-resize';
      onMouseEnterLeftHandle && onMouseEnterLeftHandle();
    } else if (relativeX >= width - edgeWidth) {
      // 右边缘
      document.body.style.cursor = 'e-resize';
      onMouseEnterRightHandle && onMouseEnterRightHandle();
    } else {
      // 中间区域
      document.body.style.cursor = 'move';
      onMouseEnterClip && onMouseEnterClip();
    }
  };
  
  // 处理鼠标离开
  const handleMouseLeave = () => {
    document.body.style.cursor = 'default';
    onMouseLeaveClip && onMouseLeaveClip();
    onMouseLeaveLeftHandle && onMouseLeaveLeftHandle();
    onMouseLeaveRightHandle && onMouseLeaveRightHandle();
  };

  return (
    <Group>
      {/* 片段主体 */}
      <Rect
        x={startX}
        y={clipY}
        width={width}
        height={clipHeight}
        fill={isDragged ? clipSelectedColor : clipColor}
        cornerRadius={3}
        stroke={isDragged ? "#fff" : "#888"}
        strokeWidth={1}
        draggable
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => {
          e.cancelBubble = true; // 阻止事件冒泡
          onClipClick && onClipClick();
        }}
        onDragStart={(e) => {
          // 获取鼠标相对于片段的位置
          const stage = e.target.getStage();
          const pointerPos = stage.getPointerPosition();
          const clipPos = e.target.getAbsolutePosition();
          const relativeX = pointerPos.x - clipPos.x;
          
          // 边缘检测区域宽度
          const edgeWidth = 10;
          
          if (relativeX <= edgeWidth) {
            // 左边缘 - 调整开始时间
            onDragStart(e, element.id, 'start');
          } else if (relativeX >= width - edgeWidth) {
            // 右边缘 - 调整结束时间
            onDragStart(e, element.id, 'end');
          } else {
            // 中间区域 - 移动整个片段
            onDragStart(e, element.id, 'move');
          }
        }}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
        dragBoundFunc={(pos) => {
          // 获取当前拖动类型
          const dragType = document.body.style.cursor;
          
          if (dragType === 'w-resize') {
            // 左边缘 - 调整开始时间
            // 只允许水平拖动，且不能超过右边界
            return {
              x: Math.max(timelinePadding, Math.min(startX + width - 20, pos.x)),
              y: clipY // 固定垂直位置
            };
          } else if (dragType === 'e-resize') {
            // 右边缘 - 调整结束时间
            // 只允许水平拖动，且不能超过左边界和时间轴范围
            return {
              x: startX, // 保持左边缘位置不变
              y: clipY // 固定垂直位置
            };
          } else {
            // 中间区域 - 移动整个片段
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
          }
        }}
      />
      
      {/* 片段标签 */}
      <Text
        x={startX + 5}
        y={clipY + clipHeight / 2 - 7}
        text={element.type}
        fill="#fff"
        fontSize={10}
        width={Math.max(0, width - 10)}
        ellipsis={true}
        listening={false} // 不监听事件，让事件穿透到下面的Rect
      />
    </Group>
  );
};

export default TimelineClip;
