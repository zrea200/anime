import React from 'react';

const KeyframeCurve = ({ keyframes, property, trackHeight, timeScale, trackWidth, startX = 0 }) => {
  if (!keyframes || !keyframes[property] || keyframes[property].length < 2) {
    return null;
  }
  
  const points = keyframes[property].map(kf => {
    const x = startX + (kf.time * timeScale);
    // 将值映射到轨道高度范围内
    const normalizedValue = property === 'opacity' 
      ? kf.value 
      : (kf.value % 1000) / 1000; // 简单归一化，实际项目中可能需要更复杂的逻辑
    
    const y = trackHeight - (normalizedValue * trackHeight * 0.8) - (trackHeight * 0.1);
    return { x, y };
  });
  
  // 生成SVG路径
  let pathData = `M ${points[0].x} ${points[0].y}`;
  
  for (let i = 1; i < points.length; i++) {
    // 使用贝塞尔曲线连接点
    const prevPoint = points[i-1];
    const currPoint = points[i];
    const cpX1 = prevPoint.x + (currPoint.x - prevPoint.x) / 3;
    const cpX2 = prevPoint.x + (currPoint.x - prevPoint.x) * 2 / 3;
    
    pathData += ` C ${cpX1} ${prevPoint.y}, ${cpX2} ${currPoint.y}, ${currPoint.x} ${currPoint.y}`;
  }
  
  return (
    <svg 
      width={trackWidth} 
      height={trackHeight} 
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
    >
      <path
        d={pathData}
        stroke={getPropertyColor(property)}
        strokeWidth="2"
        fill="none"
      />
      {points.map((point, index) => (
        <circle
          key={index}
          cx={point.x}
          cy={point.y}
          r="4"
          fill={getPropertyColor(property)}
        />
      ))}
    </svg>
  );
};

// 为不同属性分配不同颜色
const getPropertyColor = (property) => {
  const colors = {
    x: '#FF5722',
    y: '#4CAF50',
    width: '#2196F3',
    height: '#9C27B0',
    opacity: '#FFEB3B'
  };
  
  return colors[property] || '#000000';
};

export default KeyframeCurve;