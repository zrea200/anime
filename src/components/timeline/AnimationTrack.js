import React from 'react';
import { Group, Rect, Text, Path, Circle, Line } from 'react-konva';

function AnimationTrack({ 
  track, 
  element, 
  currentTime, 
  timeScale, 
  trackHeight = 40,
  trackY,
  onUpdate, 
  onDelete 
}) {
  const { id, property, elementId, startTime, duration, bezierPoints } = track;
  
  // 计算轨道位置和尺寸
  const trackWidth = duration * timeScale * 100; // 与元素轨道保持一致的缩放
  const trackX = startTime * timeScale * 100;
  
  // 将贝塞尔点转换为画布坐标
  const getCanvasPoints = () => {
    return bezierPoints.map(point => ({
      x: trackX + point.x * trackWidth,
      y: trackY + trackHeight / 2 + (0.5 - point.y) * trackHeight
    }));
  };
  
  const points = getCanvasPoints();
  
  // 生成贝塞尔曲线路径数据
  const generateBezierPath = () => {
    if (points.length < 4) return '';
    
    // 创建贝塞尔曲线路径
    let pathData = `M ${points[0].x} ${points[0].y}`;
    
    // 使用三次贝塞尔曲线
    pathData += ` C ${points[1].x} ${points[1].y}, ${points[2].x} ${points[2].y}, ${points[3].x} ${points[3].y}`;
    
    return pathData;
  };
  
  // 显示当前值的指示器
  const getCurrentValueIndicator = () => {
    if (currentTime < startTime || currentTime > startTime + duration) {
      return null;
    }
    
    // 计算当前时间在轨道上的位置
    const progress = (currentTime - startTime) / duration;
    const x = trackX + progress * trackWidth;
    
    // 使用贝塞尔曲线计算当前值的Y位置
    const t = progress;
    const p0 = points[0];
    const p1 = points[1];
    const p2 = points[2];
    const p3 = points[3];
    
    const y = Math.pow(1-t, 3) * p0.y + 
              3 * Math.pow(1-t, 2) * t * p1.y + 
              3 * (1-t) * Math.pow(t, 2) * p2.y + 
              Math.pow(t, 3) * p3.y;
    
    return (
      <Circle
        x={x}
        y={y}
        radius={6}
        fill="#FFEB3B"
        stroke="#000"
        strokeWidth={1}
      />
    );
  };
  
  return (
    <Group>
      {/* 轨道背景 */}
      <Rect
        x={trackX}
        y={trackY}
        width={trackWidth}
        height={trackHeight}
        fill="#1a1a1a"
        stroke="#333"
        strokeWidth={1}
      />
      
      {/* 属性名称 */}
      <Text
        x={trackX + 5}
        y={trackY + 5}
        text={`${property}`}
        fill="#fff"
        fontSize={12}
      />
      
      {/* 贝塞尔曲线 */}
      <Path
        data={generateBezierPath()}
        stroke={getPropertyColor(property)}
        strokeWidth={2}
        lineCap="round"
        lineJoin="round"
      />
      
      {/* 控制点连线 */}
      <Line
        points={[
          points[0].x, points[0].y,
          points[1].x, points[1].y,
          points[2].x, points[2].y,
          points[3].x, points[3].y
        ]}
        stroke="#555"
        strokeWidth={1}
        dash={[2, 2]}
        opacity={0.5}
      />
      
      {/* 控制点 */}
      {points.map((point, index) => (
        <Circle
          key={index}
          x={point.x}
          y={point.y}
          radius={4}
          fill={index === 0 || index === points.length - 1 ? "#f44336" : "#2196F3"}
          draggable
          onDragMove={(e) => {
            const newPoints = [...bezierPoints];
            const pos = e.target.position();
            
            // 更新控制点位置
            newPoints[index] = {
              x: Math.max(0, Math.min(1, (pos.x - trackX) / trackWidth)),
              y: Math.max(0, Math.min(1, 0.5 - (pos.y - trackY - trackHeight / 2) / trackHeight))
            };
            
            onUpdate({ bezierPoints: newPoints });
          }}
        />
      ))}
      
      {/* 当前值指示器 */}
      {getCurrentValueIndicator()}
      
      {/* 删除按钮 */}
      <Group
        x={trackX + trackWidth - 20}
        y={trackY + 5}
        onMouseEnter={() => { document.body.style.cursor = 'pointer'; }}
        onMouseLeave={() => { document.body.style.cursor = 'default'; }}
        onClick={onDelete}
      >
        <Circle radius={8} fill="#f44336" />
        <Text text="×" x={-4} y={-6} fill="#fff" fontSize={12} />
      </Group>
    </Group>
  );
}

// 为不同属性分配不同颜色
const getPropertyColor = (property) => {
  const colors = {
    x: '#FF5722',
    y: '#4CAF50',
    width: '#2196F3',
    height: '#9C27B0',
    opacity: '#FFEB3B',
    rotation: '#00BCD4'
  };
  
  return colors[property] || '#FFFFFF';
};

export default AnimationTrack;