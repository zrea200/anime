import React from 'react';
import { Group, Line, Text } from 'react-konva';

/**
 * 时间轴刻度标记组件
 */
const TimelineMarkers = ({ 
  totalDuration, 
  timeScale, 
  timeToX, 
  formatTime, 
  timeMarkerHeight, 
  textColor 
}) => {
  const SECONDS_MARKER_INTERVAL = 1; // 每1秒一个刻度
  
  const renderMarkers = () => {
    const markers = [];
    const secondsInterval = SECONDS_MARKER_INTERVAL / timeScale;
    const numMarkers = Math.ceil(totalDuration / secondsInterval);
    
    for (let i = 0; i <= numMarkers; i++) {
      const time = i * secondsInterval;
      if (time > totalDuration) break;
      
      const x = timeToX(time);
      const isMajor = i % 5 === 0; // 每5个刻度一个主刻度
      
      markers.push(
        <Group key={`marker-${i}`}>
          <Line
            points={[x, 0, x, isMajor ? timeMarkerHeight : timeMarkerHeight / 2]}
            stroke={textColor}
            strokeWidth={isMajor ? 2 : 1}
          />
          {isMajor && (
            <Text
              x={x - 10}
              y={timeMarkerHeight + 2}
              text={formatTime(time)}
              fill={textColor}
              fontSize={10}
              align="center"
              width={20}
            />
          )}
        </Group>
      );
    }
    
    return markers;
  };

  return (
    <Group y={5}>
      {renderMarkers()}
    </Group>
  );
};

export default TimelineMarkers;
