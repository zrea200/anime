import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Group } from 'react-konva';
import TimelineMarkers from './timeline/TimelineMarkers';
import TimelinePlayhead from './timeline/TimelinePlayhead';
import TimelineTrack from './timeline/TimelineTrack';
import TimelineControls from './timeline/TimelineControls';
import { timeToX, xToTime, formatTime } from './timeline/TimelineUtils';

/**
 * 时间轴组件
 * 
 * @param {Object} props
 * @param {Array} props.tracks - 轨道数组
 * @param {Array} props.elements - 元素数组
 * @param {number} props.currentTime - 当前时间（秒）
 * @param {number} props.totalDuration - 总时长（秒）
 * @param {Function} props.onTimeChange - 时间变化的回调函数
 * @param {Function} props.onDurationChange - 时长变化的回调函数
 * @param {number} props.timeScale - 时间轴缩放级别
 * @param {Function} props.onTimeScaleChange - 缩放级别变化的回调函数
 * @param {boolean} props.isPlaying - 是否正在播放
 * @param {number} props.frameRate - 帧率
 * @param {Function} props.onUpdateElement - 更新元素的回调函数
 * @param {string|null} props.selectedId - 当前选中的元素ID
 * @param {Function} props.onSelect - 选择元素的回调函数
 */
const Timeline = ({
  tracks,
  elements,
  currentTime,
  totalDuration,
  onTimeChange,
  onDurationChange,
  timeScale,
  onTimeScaleChange,
  isPlaying,
  frameRate,
  onUpdateElement,
  selectedId: externalSelectedId,
  onSelect: externalOnSelect
}) => {
  // 引用和状态
  const stageRef = useRef();
  const containerRef = useRef();
  const [stageWidth, setStageWidth] = useState(800);
  const [stageHeight, setStageHeight] = useState(200);
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
  const [draggedElementId, setDraggedElementId] = useState(null);
  const [dragType, setDragType] = useState(null); // 'start', 'end', 'move'
  const [initialDragData, setInitialDragData] = useState(null);
  const [hoveredHandle, setHoveredHandle] = useState(null); // 格式: "elementId-left" 或 "elementId-right"
  const [selectedElementId, setSelectedElementId] = useState(null); // 当前选中的元素ID
  
  // 从App.js获取当前活动轨道ID
  const activeTrackId = tracks.length > 0 ? tracks[0].id : null;

  // 时间轴常量
  const TIMELINE_PADDING = 10;
  const TRACK_HEIGHT = 40;
  const TRACK_PADDING = 5;
  const HEADER_HEIGHT = 30;
  const TIME_MARKER_HEIGHT = 15;
  const PLAYHEAD_COLOR = '#ff0000';
  const TIMELINE_BG_COLOR = '#2c2c2c';
  const TRACK_BG_COLOR = '#3c3c3c';
  const TRACK_ACTIVE_COLOR = '#4c4c4c';
  const CLIP_COLOR = '#6c6c6c';
  const CLIP_SELECTED_COLOR = '#8c8c8c';
  const TEXT_COLOR = '#ffffff';

  // 计算时间轴宽度（秒数 * 缩放级别 * 100）
  // 确保时间轴宽度至少等于容器宽度，这样时间轴就会顶到最结尾的位置
  const timelineWidth = Math.max(stageWidth - TIMELINE_PADDING * 2, totalDuration * timeScale * 100);

  // 调整舞台大小以适应容器
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setStageWidth(containerRef.current.offsetWidth);
        setStageHeight(containerRef.current.offsetHeight);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // 时间和坐标转换函数
  const timeToXWithContext = (time) => {
    return timeToX(time, totalDuration, timelineWidth, TIMELINE_PADDING);
  };

  const xToTimeWithContext = (x) => {
    return xToTime(x, totalDuration, timelineWidth, TIMELINE_PADDING);
  };

  const formatTimeWithContext = (seconds) => {
    return formatTime(seconds, timeScale);
  };

  // 处理播放头拖动
  const handlePlayheadDragStart = () => {
    setIsDraggingPlayhead(true);
  };

  const handlePlayheadDragMove = (e) => {
    if (!isDraggingPlayhead) return;
    
    const stage = e.target.getStage();
    const pointerX = stage.getPointerPosition().x;
    const newTime = xToTimeWithContext(pointerX);
    
    onTimeChange(newTime);
  };

  const handlePlayheadDragEnd = () => {
    setIsDraggingPlayhead(false);
  };

  // 处理元素片段拖动
  const handleClipDragStart = (e, elementId, type) => {
    e.cancelBubble = true; // 阻止事件冒泡
    
    const element = elements.find(el => el.id === elementId);
    if (!element) return;
    
    setDraggedElementId(elementId);
    setDragType(type);
    setInitialDragData({
      time: element.time || 0,
      duration: element.duration || 5,
      pointerX: e.target.getStage().getPointerPosition().x
    });
    
    // 设置当前选中的元素
    setSelectedElementId(elementId);
  };

  const handleClipDragMove = (e) => {
    if (!draggedElementId || !dragType || !initialDragData) return;
    
    const stage = e.target.getStage();
    const pointerX = stage.getPointerPosition().x;
    const pointerY = stage.getPointerPosition().y;
    const deltaX = pointerX - initialDragData.pointerX;
    const deltaTime = (deltaX / (timelineWidth - TIMELINE_PADDING * 2)) * totalDuration;
    
    const element = elements.find(el => el.id === draggedElementId);
    if (!element) return;
    
    let newAttrs = {};
    
    // 确保不超过时间轴范围
    const maxTime = totalDuration;
    
    if (dragType === 'start') {
      // 调整开始时间和持续时间
      const newStartTime = Math.max(0, Math.min(maxTime - 0.5, initialDragData.time + deltaTime));
      const newDuration = Math.max(0.5, initialDragData.duration - (newStartTime - initialDragData.time));
      
      // 确保结束时间不超过总时长
      const endTime = newStartTime + newDuration;
      if (endTime > maxTime) {
        newAttrs = {
          time: newStartTime,
          duration: maxTime - newStartTime
        };
      } else {
        newAttrs = {
          time: newStartTime,
          duration: newDuration
        };
      }
    } else if (dragType === 'end') {
      // 只调整持续时间
      // 确保结束时间不超过总时长
      const maxDuration = maxTime - initialDragData.time;
      const newDuration = Math.min(maxDuration, Math.max(0.5, initialDragData.duration + deltaTime));
      
      newAttrs = {
        duration: newDuration
      };
    } else if (dragType === 'move') {
      // 移动整个片段
      // 确保片段不会超出轨道范围
      const newStartTime = Math.max(0, initialDragData.time + deltaTime);
      
      // 确保片段结束时间不超过总时长
      const endTime = newStartTime + initialDragData.duration;
      if (endTime > maxTime) {
        newAttrs = {
          time: maxTime - initialDragData.duration
        };
      } else {
        newAttrs = {
          time: newStartTime
        };
      }
      
      // 检测是否需要更改轨道
      // 计算当前指针位置对应的轨道索引
      const trackIndex = Math.floor((pointerY - HEADER_HEIGHT) / TRACK_HEIGHT);
      
      // 确保轨道索引在有效范围内
      if (trackIndex >= 0 && trackIndex < tracks.length) {
        const newTrackId = tracks[trackIndex].id;
        
        // 更新轨道ID
        if (newAttrs.time !== undefined) {
          newAttrs.trackId = newTrackId;
        } else {
          newAttrs = {
            ...newAttrs,
            time: newStartTime,
            trackId: newTrackId
          };
        }
      } else {
        if (newAttrs.time === undefined) {
          newAttrs = {
            ...newAttrs,
            time: newStartTime
          };
        }
      }
    }
    
    onUpdateElement(draggedElementId, newAttrs);
  };

  const handleClipDragEnd = () => {
    setDraggedElementId(null);
    setDragType(null);
    setInitialDragData(null);
  };

  // 处理时间轴缩放
  const handleWheel = (e) => {
    e.evt.preventDefault();
    
    const scaleBy = 1.1;
    const newScale = e.evt.deltaY < 0 
      ? Math.min(5, timeScale * scaleBy) 
      : Math.max(0.5, timeScale / scaleBy);
    
    onTimeScaleChange(newScale);
  };

  // 处理鼠标悬停在调整手柄上
  const handleHandleHover = (elementId, handleType, isHovered) => {
    if (isHovered) {
      setHoveredHandle(`${elementId}-${handleType}`);
      document.body.style.cursor = handleType === 'left' ? 'w-resize' : 'e-resize';
    } else if (hoveredHandle === `${elementId}-${handleType}`) {
      setHoveredHandle(null);
      document.body.style.cursor = 'default';
    }
  };
  
  // 处理元素选中
  const handleClipSelect = (elementId) => {
    const newSelectedId = elementId === selectedElementId ? null : elementId;
    setSelectedElementId(newSelectedId);
    // 调用外部选择回调
    if (externalOnSelect) {
      externalOnSelect(newSelectedId);
    }
  };
  
  // 处理点击空白区域取消选中
  const handleBackgroundClick = (e) => {
    // 检查是否点击的是背景
    const clickedOnEmpty = e.target === e.target.getStage() || 
                          e.target.name() === 'background' ||
                          e.target.name() === 'track-background';
    if (clickedOnEmpty) {
      setSelectedElementId(null);
      // 调用外部选择回调
      if (externalOnSelect) {
        externalOnSelect(null);
      }
    }
  };

  // 同步外部选中状态
  useEffect(() => {
    if (externalSelectedId !== undefined && externalSelectedId !== selectedElementId) {
      setSelectedElementId(externalSelectedId);
    }
  }, [externalSelectedId]);

  return (
    <div className="timeline" ref={containerRef}>
      <TimelineControls 
        currentTime={currentTime}
        totalDuration={totalDuration}
        timeScale={timeScale}
        formatTime={formatTimeWithContext}
        onTimeScaleChange={onTimeScaleChange}
        onDurationChange={onDurationChange}
      />
      
      <div className="timeline-stage-container">
        <Stage
          width={stageWidth}
          height={stageHeight}
          ref={stageRef}
          onWheel={handleWheel}
          draggable={false} // 禁止拖动
        >
          <Layer>
            {/* 背景 */}
            <Rect
              x={0}
              y={0}
              width={timelineWidth}
              height={HEADER_HEIGHT + tracks.length * TRACK_HEIGHT}
              fill={TIMELINE_BG_COLOR}
              name="background"
              onClick={handleBackgroundClick}
            />
            
            {/* 时间刻度 */}
            <TimelineMarkers 
              totalDuration={totalDuration}
              timeScale={timeScale}
              timeToX={timeToXWithContext}
              formatTime={formatTimeWithContext}
              timeMarkerHeight={TIME_MARKER_HEIGHT}
              textColor={TEXT_COLOR}
            />
            
            {/* 轨道和元素片段 */}
            <Group>
              {tracks.map((track, index) => {
                const trackElements = elements.filter(el => el.trackId === track.id);
                
                return (
                  <TimelineTrack
                    key={`track-${track.id}`}
                    track={track}
                    index={index}
                    headerHeight={HEADER_HEIGHT}
                    trackHeight={TRACK_HEIGHT}
                    trackPadding={TRACK_PADDING}
                    timelineWidth={timelineWidth}
                    timelinePadding={TIMELINE_PADDING}
                    trackBgColor={TRACK_BG_COLOR}
                    trackActiveColor={TRACK_ACTIVE_COLOR}
                    textColor={TEXT_COLOR}
                    clipColor={CLIP_COLOR}
                    clipSelectedColor={CLIP_SELECTED_COLOR}
                    isActive={track.id === activeTrackId}
                    trackElements={trackElements}
                    draggedElementId={draggedElementId}
                    selectedElementId={selectedElementId}
                    hoveredHandle={hoveredHandle}
                    timeToX={timeToXWithContext}
                    totalDuration={totalDuration}
                    onDragStart={handleClipDragStart}
                    onDragMove={handleClipDragMove}
                    onDragEnd={handleClipDragEnd}
                    onHandleHover={handleHandleHover}
                    onClipSelect={handleClipSelect}
                    onBackgroundClick={handleBackgroundClick}
                  />
                );
              })}
            </Group>
            
            {/* 播放头 */}
            <TimelinePlayhead 
              x={timeToXWithContext(currentTime)}
              height={HEADER_HEIGHT + tracks.length * TRACK_HEIGHT}
              headerHeight={HEADER_HEIGHT}
              playheadColor={PLAYHEAD_COLOR}
              timelinePadding={TIMELINE_PADDING}
              timelineWidth={timelineWidth}
              onDragStart={handlePlayheadDragStart}
              onDragMove={handlePlayheadDragMove}
              onDragEnd={handlePlayheadDragEnd}
            />
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default Timeline;
