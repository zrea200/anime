import React, { useRef } from 'react';

/**
 * 工具栏组件
 * 
 * @param {Object} props
 * @param {Function} props.onAddRectangle - 添加矩形的回调函数
 * @param {Function} props.onAddCircle - 添加圆形的回调函数
 * @param {Function} props.onAddImage - 添加图片的回调函数
 * @param {Function} props.onDelete - 删除选中元素的回调函数
 * @param {boolean} props.hasSelection - 是否有选中的元素
 * @param {boolean} props.isPlaying - 是否正在播放
 * @param {Function} props.onTogglePlay - 切换播放/暂停的回调函数
 * @param {Function} props.onStop - 停止播放的回调函数
 * @param {number} props.currentTime - 当前时间（秒）
 * @param {number} props.frameRate - 帧率
 * @param {Function} props.onFrameRateChange - 帧率变化的回调函数
 */
// 在Toolbar组件中添加keyframeStage属性
function Toolbar({ 
  onAddRectangle, 
  onAddCircle, 
  onAddImage, 
  onDelete, 
  hasSelection,
  isPlaying,
  onTogglePlay,
  onStop,
  currentTime,
  frameRate,
  onFrameRateChange,
  keyframeMode,
  keyframeStage,
  onToggleKeyframeMode
}) {
  const fileInputRef = useRef(null);

  // 处理图片上传
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.match('image.*')) {
      onAddImage(file);
    }
    // 重置文件输入，以便可以再次选择同一文件
    e.target.value = '';
  };

  // 格式化时间为 MM:SS 格式
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="toolbar">
      <div className="toolbar-section drawing-tools">
        <button onClick={onAddRectangle} title="添加矩形">
          <i className="fa fa-square-o"></i>
        </button>
        <button onClick={onAddCircle} title="添加圆形">
          <i className="fa fa-circle-o"></i>
        </button>
        
        <label htmlFor="upload-image" title="添加图片">
          <i className="fa fa-picture-o"></i>
          <input
            id="upload-image"
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageUpload}
          />
        </label>
        
        <button 
          onClick={onDelete} 
          disabled={!hasSelection}
          style={{ opacity: hasSelection ? 1 : 0.5 }}
          title="删除选中元素"
        >
          <i className="fa fa-trash"></i>
        </button>
      </div>
      
      <div className="toolbar-section playback-controls">
        <button onClick={onTogglePlay} title={isPlaying ? "暂停" : "播放"}>
          <i className={`fa ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
        </button>
        <button onClick={onStop} title="停止">
          <i className="fa fa-stop"></i>
        </button>
        <div className="time-display" title="当前时间">
          {formatTime(currentTime)}
        </div>
        <div className="framerate-control">
          <label htmlFor="framerate">帧率:</label>
          <select 
            id="framerate" 
            value={frameRate} 
            onChange={(e) => onFrameRateChange(Number(e.target.value))}
          >
            <option value="24">24 fps</option>
            <option value="30">30 fps</option>
            <option value="60">60 fps</option>
          </select>
        </div>
        
        {/* 修改关键帧模式按钮 */}
        {hasSelection && (
          <button 
            className={`toolbar-button ${keyframeMode ? 'active' : ''} ${keyframeStage === 'start' ? 'keyframe-start' : ''}`} 
            onClick={onToggleKeyframeMode}
            title={keyframeStage === 'start' ? '设置结束点 (空格键)' : '开始关键帧模式 (空格键)'}
          >
            <i className="fa fa-key"></i>
          </button>
        )}
      </div>
    </div>
  );
};

export default Toolbar;
