import React from 'react';
import { useTimeline } from '../contexts/TimelineContext';

function PropertyPanel({ selectedElement, onChange, onAddAnimationTrack }) {
  // 使用 useTimeline hook 获取 timeline 上下文
  const timeline = useTimeline();
  
  // 添加 handlePropertyChange 函数
  const handlePropertyChange = (property, value) => {
    if (selectedElement) {
      onChange({ [property]: value });
    }
  };
  
  // 修改添加关键帧函数
  const addKeyframe = (property, value) => {
    if (!selectedElement) return;
    
    // 使用新的 onAddAnimationTrack 函数创建动画轨道
    if (onAddAnimationTrack) {
      onAddAnimationTrack(selectedElement.id, property, {
        startValue: value,
        endValue: value,
        startTime: timeline.currentTime,
        duration: 2 // 默认2秒动画
      });
    } else {
      // 保留原来的逻辑作为备用
      const newKeyframes = {
        ...(selectedElement.keyframes || {}),
        [property]: [
          ...(selectedElement.keyframes?.[property] || []),
          { time: timeline.currentTime, value: value }
        ].sort((a, b) => a.time - b.time)
      };
      
      onChange({
        keyframes: newKeyframes
      });
    }
  };
  
  // 渲染颜色选择器（如果元素是矩形或圆形）
  const renderColorPicker = () => {
    if (!selectedElement) return null;
    
    if (selectedElement.type === 'rectangle' || selectedElement.type === 'circle') {
      return (
        <div className="property-group">
          <label>颜色:</label>
          <input
            type="color"
            value={selectedElement.fill || '#ffffff'}
            onChange={(e) => handlePropertyChange('fill', e.target.value)}
          />
        </div>
      );
    }
    return null;
  };
  
  // 渲染特定元素类型的属性
  const renderTypeSpecificProperties = () => {
    if (!selectedElement) return null;
    
    if (selectedElement.type === 'circle') {
      return (
        <div className="property-group">
          <label>半径:</label>
          <input
            type="number"
            value={selectedElement.radius || 50}
            onChange={(e) => handlePropertyChange('radius', parseFloat(e.target.value))}
          />
          <button onClick={() => addKeyframe('radius', selectedElement.radius || 50)}>
            <span role="img" aria-label="添加关键帧">🔑</span>
          </button>
        </div>
      );
    }
    
    if (selectedElement.type === 'image') {
      return (
        <div className="property-group">
          <label>图片源:</label>
          <input
            type="text"
            value={selectedElement.src || ''}
            onChange={(e) => handlePropertyChange('src', e.target.value)}
            placeholder="输入图片URL"
          />
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div className="property-panel">
      <h3>属性</h3>
      {selectedElement ? (
        <div>
          <div className="property-group">
            <label>位置 X:</label>
            <input
              type="number"
              value={selectedElement.x || 0}
              onChange={(e) => handlePropertyChange('x', parseFloat(e.target.value))}
            />
            <button onClick={() => addKeyframe('x', selectedElement.x || 0)}>
              <span role="img" aria-label="添加关键帧">🔑</span>
            </button>
          </div>
          
          <div className="property-group">
            <label>位置 Y:</label>
            <input
              type="number"
              value={selectedElement.y || 0}
              onChange={(e) => handlePropertyChange('y', parseFloat(e.target.value))}
            />
            <button onClick={() => addKeyframe('y', selectedElement.y || 0)}>
              <span role="img" aria-label="添加关键帧">🔑</span>
            </button>
          </div>
          
          {selectedElement.type !== 'circle' && (
            <>
              <div className="property-group">
                <label>宽度:</label>
                <input
                  type="number"
                  value={selectedElement.width || 100}
                  onChange={(e) => handlePropertyChange('width', parseFloat(e.target.value))}
                />
                <button onClick={() => addKeyframe('width', selectedElement.width || 100)}>
                  <span role="img" aria-label="添加关键帧">🔑</span>
                </button>
              </div>
              
              <div className="property-group">
                <label>高度:</label>
                <input
                  type="number"
                  value={selectedElement.height || 100}
                  onChange={(e) => handlePropertyChange('height', parseFloat(e.target.value))}
                />
                <button onClick={() => addKeyframe('height', selectedElement.height || 100)}>
                  <span role="img" aria-label="添加关键帧">🔑</span>
                </button>
              </div>
            </>
          )}
          
          {renderTypeSpecificProperties()}
          {renderColorPicker()}
          
          <div className="property-group">
            <label>不透明度:</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={selectedElement.opacity || 1}
              onChange={(e) => handlePropertyChange('opacity', parseFloat(e.target.value))}
            />
            <span>{Math.round((selectedElement.opacity || 1) * 100)}%</span>
            <button onClick={() => addKeyframe('opacity', selectedElement.opacity || 1)}>
              <span role="img" aria-label="添加关键帧">🔑</span>
            </button>
          </div>
          
          <div className="property-group">
            <label>旋转:</label>
            <input
              type="number"
              value={selectedElement.rotation || 0}
              onChange={(e) => handlePropertyChange('rotation', parseFloat(e.target.value))}
            />
            <button onClick={() => addKeyframe('rotation', selectedElement.rotation || 0)}>
              <span role="img" aria-label="添加关键帧">🔑</span>
            </button>
          </div>
        </div>
      ) : (
        <p>请选择一个元素来编辑属性</p>
      )}
    </div>
  );
}

export default PropertyPanel;