import React from 'react';
import { Group, Rect, Text } from 'react-konva';
import TimelineClip from './TimelineClip';
// 导入关键帧曲线组件
import KeyframeCurve from './KeyframeCurve';

/**
 * 时间轴轨道组件
 */
const TimelineTrack = ({
  track,
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
  trackElements,
  draggedElementId,
  selectedElementId,
  hoveredHandle,
  timeToX,
  totalDuration,
  onDragStart,
  onDragMove,
  onDragEnd,
  onHandleHover,
  onClipSelect,
  onBackgroundClick
}) => {
  const y = headerHeight + index * trackHeight;
  
  // 计算时间比例尺 - 每秒对应的像素数
  const timeScale = (timelineWidth - timelinePadding * 2) / totalDuration;
  
  return (
    <Group key={`track-${track.id}`}>
      {/* 轨道背景 */}
      <Rect
        x={0}
        y={y}
        width={timelineWidth}
        height={trackHeight}
        fill={isActive ? trackActiveColor : trackBgColor}
        stroke="#555"
        strokeWidth={1}
        name="track-background"
        onClick={onBackgroundClick}
      />
      
      {/* 轨道标签 */}
      <Text
        x={5}
        y={y + trackHeight / 2 - 7}
        text={`轨道 ${index + 1}`}
        fill={textColor}
        fontSize={12}
        width={100}
        ellipsis={true}
      />
      
      {/* 元素片段 */}
      {trackElements.map(element => {
        const startX = timeToX(element.time || 0);
        const duration = element.duration || 5;
        const width = (duration / totalDuration) * (timelineWidth - timelinePadding * 2);
        
        // 检查此元素的手柄是否处于悬停状态
        const isLeftHandleHovered = hoveredHandle === `${element.id}-left`;
        const isRightHandleHovered = hoveredHandle === `${element.id}-right`;
        
        return (
          <>
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
              isDragged={element.id === draggedElementId || element.id === selectedElementId}
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
              onClipClick={() => onClipSelect(element.id)}
              onMouseEnterLeftHandle={() => onHandleHover(element.id, 'left', true)}
              onMouseLeaveLeftHandle={() => onHandleHover(element.id, 'left', false)}
              onMouseEnterRightHandle={() => onHandleHover(element.id, 'right', true)}
              onMouseLeaveRightHandle={() => onHandleHover(element.id, 'right', false)}
              onDragStart={onDragStart}
              onDragMove={onDragMove}
              onDragEnd={onDragEnd}
            />
            
            {/* 添加关键帧曲线 */}
            {element.keyframes && (
              <>
                {element.keyframes.opacity && (
                  <KeyframeCurve 
                    keyframes={element.keyframes}
                    property="opacity"
                    trackHeight={trackHeight}
                    timeScale={timeScale}
                    trackWidth={timelineWidth}
                    startX={startX}
                  />
                )}
                {element.keyframes.x && (
                  <KeyframeCurve 
                    keyframes={element.keyframes}
                    property="x"
                    trackHeight={trackHeight}
                    timeScale={timeScale}
                    trackWidth={timelineWidth}
                    startX={startX}
                  />
                )}
                {/* 可以添加更多属性的曲线 */}
              </>
            )}
          </>
        );
      })}
    </Group>
  );
};

export default TimelineTrack;

const TrackTypes = {
  ELEMENT: 'element',    // 普通元素轨道
  ANIMATION: 'animation' // 动画曲线轨道
};
