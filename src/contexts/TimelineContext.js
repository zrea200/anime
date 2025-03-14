import React, { createContext, useContext, useState, useEffect } from 'react';

const TimelineContext = createContext();

export const useTimeline = () => useContext(TimelineContext);

export const TimelineProvider = ({ children }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(60); // 默认60秒
  const [timeScale, setTimeScale] = useState(10); // 每秒对应的像素数
  
  // 播放控制
  useEffect(() => {
    let animationFrame;
    let lastTime = null;
    
    const updateTime = (timestamp) => {
      if (lastTime === null) {
        lastTime = timestamp;
      }
      
      const deltaTime = (timestamp - lastTime) / 1000; // 转换为秒
      lastTime = timestamp;
      
      setCurrentTime((prevTime) => {
        const newTime = prevTime + deltaTime;
        // 如果超过总时长，停止播放或循环
        if (newTime >= duration) {
          setIsPlaying(false);
          return 0; // 回到开始
        }
        return newTime;
      });
      
      if (isPlaying) {
        animationFrame = requestAnimationFrame(updateTime);
      }
    };
    
    if (isPlaying) {
      animationFrame = requestAnimationFrame(updateTime);
    }
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isPlaying, duration]);
  
  // 播放控制函数
  const play = () => setIsPlaying(true);
  const pause = () => setIsPlaying(false);
  const stop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };
  const seekTo = (time) => {
    setCurrentTime(Math.max(0, Math.min(time, duration)));
  };
  
  // 缩放控制
  const zoomIn = () => setTimeScale(prev => Math.min(prev * 1.2, 50));
  const zoomOut = () => setTimeScale(prev => Math.max(prev / 1.2, 5));
  
  const value = {
    currentTime,
    isPlaying,
    duration,
    timeScale,
    play,
    pause,
    stop,
    seekTo,
    zoomIn,
    zoomOut,
    setDuration,
  };
  
  return (
    <TimelineContext.Provider value={value}>
      {children}
    </TimelineContext.Provider>
  );
};