import React, { useState } from 'react';
import { Stage, Layer, Rect } from 'react-konva';

/**
 * 轨道面板组件
 * 
 * @param {Object} props
 * @param {Array} props.layers - 轨道数组
 * @param {string} props.activeLayerId - 当前活动轨道ID
 * @param {Function} props.onSelectLayer - 选择轨道的回调函数
 * @param {Function} props.onAddLayer - 添加轨道的回调函数
 * @param {Function} props.onDeleteLayer - 删除轨道的回调函数
 * @param {Function} props.onMoveLayer - 移动轨道的回调函数
 * @param {Function} props.onUpdateLayer - 更新轨道的回调函数
 * @param {Array} props.elements - 元素数组，用于生成轨道缩略图
 */
const LayerPanel = ({ 
  layers, 
  activeLayerId, 
  onSelectLayer, 
  onAddLayer, 
  onDeleteLayer, 
  onMoveLayer, 
  onUpdateLayer,
  elements
}) => {
  // 编辑图层名称的状态
  const [editingLayerId, setEditingLayerId] = useState(null);
  const [editingName, setEditingName] = useState('');

  // 开始编辑轨道名称
  const startEditing = (layer) => {
    setEditingLayerId(layer.id);
    setEditingName(layer.name);
  };

  // 保存编辑后的轨道名称
  const saveLayerName = () => {
    if (editingLayerId) {
      onUpdateLayer(editingLayerId, { name: editingName });
      setEditingLayerId(null);
    }
  };

  // 取消编辑
  const cancelEditing = () => {
    setEditingLayerId(null);
  };

  // 处理键盘事件
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      saveLayerName();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  // 生成轨道缩略图
  const renderLayerThumbnail = (layerId) => {
    // 获取该图层的所有元素
    const layerElements = elements.filter(el => el.layerId === layerId);
    
    if (layerElements.length === 0) {
      return (
        <div className="layer-thumbnail empty">
          <span>空轨道</span>
        </div>
      );
    }
    
    // 创建一个小型画布作为缩略图
    return (
      <div className="layer-thumbnail">
        <Stage width={50} height={30}>
          <Layer>
            {layerElements.map(element => {
              // 简化的缩略图渲染，只显示矩形表示
              return (
                <Rect
                  key={element.id}
                  x={5}
                  y={5}
                  width={40}
                  height={20}
                  fill={element.fill || '#cccccc'}
                />
              );
            })}
          </Layer>
        </Stage>
      </div>
    );
  };

  return (
    <div className="layer-panel">
      <div className="layer-panel-header">
        <h3>轨道</h3>
        <div className="layer-controls">
          <button onClick={onAddLayer} title="添加轨道">
            <i className="fa fa-plus"></i>
          </button>
          <button 
            onClick={() => activeLayerId && onDeleteLayer(activeLayerId)} 
            disabled={!activeLayerId || layers.length <= 1}
            title="删除轨道"
          >
            <i className="fa fa-trash"></i>
          </button>
          <button 
            onClick={() => activeLayerId && onMoveLayer(activeLayerId, 'up')} 
            disabled={!activeLayerId || layers.findIndex(l => l.id === activeLayerId) === 0}
            title="上移轨道"
          >
            <i className="fa fa-arrow-up"></i>
          </button>
          <button 
            onClick={() => activeLayerId && onMoveLayer(activeLayerId, 'down')} 
            disabled={!activeLayerId || layers.findIndex(l => l.id === activeLayerId) === layers.length - 1}
            title="下移轨道"
          >
            <i className="fa fa-arrow-down"></i>
          </button>
        </div>
      </div>
      
      <div className="layer-list">
        {layers.map(layer => (
          <div 
            key={layer.id} 
            className={`layer-item ${layer.id === activeLayerId ? 'active' : ''}`}
            onClick={() => onSelectLayer(layer.id)}
          >
            {renderLayerThumbnail(layer.id)}
            
            <div className="layer-info">
              {editingLayerId === layer.id ? (
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={saveLayerName}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
              ) : (
                <div className="layer-name" onDoubleClick={() => startEditing(layer)}>
                  {layer.name}
                </div>
              )}
            </div>
            
            <div className="layer-actions">
              <button 
                className={`visibility-toggle ${layer.visible ? 'visible' : 'hidden'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateLayer(layer.id, { visible: !layer.visible });
                }}
                title={layer.visible ? "隐藏轨道" : "显示轨道"}
              >
                <i className={`fa ${layer.visible ? 'fa-eye' : 'fa-eye-slash'}`}></i>
              </button>
              
              <button 
                className={`lock-toggle ${layer.locked ? 'locked' : 'unlocked'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateLayer(layer.id, { locked: !layer.locked });
                }}
                title={layer.locked ? "解锁轨道" : "锁定轨道"}
              >
                <i className={`fa ${layer.locked ? 'fa-lock' : 'fa-unlock'}`}></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LayerPanel;
