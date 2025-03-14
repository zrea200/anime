import React, { useState, useRef } from 'react';

const BezierEditor = ({ points, onChange }) => {
  // 控制点状态
  const [controlPoints, setControlPoints] = useState(points || [
    { x: 0, y: 0 },     // 起点
    { x: 0.25, y: 0.1 }, // 控制点1
    { x: 0.75, y: 0.9 }, // 控制点2
    { x: 1, y: 1 }      // 终点
  ]);

  // 拖拽控制点逻辑
  const handlePointDrag = (index, newPos) => {
    const newPoints = [...controlPoints];
    newPoints[index] = newPos;
    setControlPoints(newPoints);
    onChange(newPoints);
  };

  // 渲染贝塞尔曲线
  return (
    <svg className="bezier-editor">
      {/* 绘制曲线 */}
      <path
        d={`M ${controlPoints[0].x} ${controlPoints[0].y} 
            C ${controlPoints[1].x} ${controlPoints[1].y},
              ${controlPoints[2].x} ${controlPoints[2].y},
              ${controlPoints[3].x} ${controlPoints[3].y}`}
        fill="none"
        stroke="#2196F3"
      />
      
      {/* 控制点 */}
      {controlPoints.map((point, index) => (
        <circle
          key={index}
          cx={point.x}
          cy={point.y}
          r={4}
          fill={index === 0 || index === 3 ? "#f44336" : "#2196F3"}
          draggable
          onDrag={(e) => handlePointDrag(index, {
            x: e.clientX,
            y: e.clientY
          })}
        />
      ))}
    </svg>
  );
};

export default BezierEditor;