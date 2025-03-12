import React from 'react';

/**
 * 时间轴控制面板组件
 */
const TimelineControls = ({
  currentTime,
  totalDuration,
  timeScale,
  formatTime,
  onTimeScaleChange,
  onDurationChange
}) => {
  return (
    <div className="timeline-controls">
      <div className="time-display">{formatTime(currentTime)}</div>
      <div className="zoom-controls">
        <button 
          onClick={() => onTimeScaleChange(Math.max(0.5, timeScale / 1.5))}
          title="缩小"
        >
          <i className="fa fa-search-minus"></i>
        </button>
        <button 
          onClick={() => onTimeScaleChange(Math.min(5, timeScale * 1.5))}
          title="放大"
        >
          <i className="fa fa-search-plus"></i>
        </button>
      </div>
      <div className="duration-control">
        <label>总时长: </label>
        <input 
          type="number" 
          min="1" 
          max="300" 
          value={totalDuration}
          onChange={(e) => onDurationChange(Number(e.target.value))}
        />
        <span>秒</span>
      </div>
    </div>
  );
};

export default TimelineControls;
