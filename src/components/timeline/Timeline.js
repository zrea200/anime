import React, { useState } from 'react';
import TimelineTrack from './TimelineTrack';
import AnimationTrack from './AnimationTrack'; // 新建这个组件

function Timeline({ elements, tracks, onTrackUpdate }) {
  const [animationTracks, setAnimationTracks] = useState([]);
  
  // 添加动画轨道
  const handleAddAnimationTrack = (elementId, property, initialData) => {
    const parentElement = elements.find(el => el.id === elementId);
    if (!parentElement) return;
    
    const newTrack = {
      id: `animation-${elementId}-${property}-${Date.now()}`,
      type: 'animation',
      elementId: elementId,
      property: property,
      startTime: parentElement.time || 0,
      duration: parentElement.duration || 5,
      bezierPoints: [
        { x: 0, y: 0 },
        { x: 0.25, y: 0.1 },
        { x: 0.75, y: 0.9 },
        { x: 1, y: 1 }
      ],
      startValue: initialData.startValue,
      endValue: initialData.endValue
    };
    
    setAnimationTracks(prev => [...prev, newTrack]);
  };
  
  return (
    <div className="timeline">
      {/* 现有轨道 */}
      {tracks.map((track, index) => (
        <TimelineTrack
          key={track.id}
          track={track}
          // ... 其他属性
        />
      ))}
      
      {/* 动画轨道 */}
      {animationTracks.map((track, index) => (
        <AnimationTrack
          key={track.id}
          track={track}
          onBezierChange={(points) => {
            setAnimationTracks(prev => prev.map(t => 
              t.id === track.id ? { ...t, bezierPoints: points } : t
            ));
          }}
        />
      ))}
    </div>
  );
}