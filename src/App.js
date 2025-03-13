import React, { useState, useEffect, useCallback } from 'react';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import LayerPanel from './components/LayerPanel';
import Timeline from './components/Timeline';
import { v4 as uuidv4 } from 'uuid';

// 元素类型枚举
const ElementType = {
  RECTANGLE: 'rectangle',
  CIRCLE: 'circle',
  IMAGE: 'image'
};

function App() {
  // 存储所有图层
  const [layers, setLayers] = useState([]);
  // 当前活动图层ID
  const [activeLayerId, setActiveLayerId] = useState(null);
  // 存储画布上的所有元素
  const [elements, setElements] = useState([]);
  // 当前选中的元素ID
  const [selectedId, setSelectedId] = useState(null);
  // 时间轴相关状态
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(30); // 默认30秒
  const [isPlaying, setIsPlaying] = useState(false);
  const [frameRate, setFrameRate] = useState(30); // 默认30fps
  const [timeScale, setTimeScale] = useState(1); // 时间轴缩放级别

  // 初始化默认轨道
  useEffect(() => {
    if (layers.length === 0) {
      const defaultLayer = {
        id: '1',
        name: '轨道 1',
        visible: true,
        locked: false,
        order: 0
      };
      setLayers([defaultLayer]);
      setActiveLayerId(defaultLayer.id);
    }
  }, [layers]);

  // 播放动画的逻辑
  useEffect(() => {
    let animationFrame;
    
    if (isPlaying) {
      const startTime = Date.now() - currentTime * 1000;
      
      const updateTime = () => {
        const newTime = (Date.now() - startTime) / 1000;
        
        if (newTime >= totalDuration) {
          // 到达结尾，重置到开始
          setCurrentTime(0);
          setIsPlaying(false);
        } else {
          setCurrentTime(newTime);
          animationFrame = requestAnimationFrame(updateTime);
        }
      };
      
      animationFrame = requestAnimationFrame(updateTime);
    }
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isPlaying, currentTime, totalDuration]);

  // 添加新轨道
  const addLayer = () => {
    const newLayer = {
      id: `${layers.length + 1}`,
      name: `轨道 ${layers.length + 1}`,
      visible: true,
      locked: false,
      order: layers.length
    };
    
    // 在当前选中图层上方插入
    const updatedLayers = [...layers];
    if (activeLayerId) {
      const activeIndex = layers.findIndex(layer => layer.id === activeLayerId);
      if (activeIndex !== -1) {
        // 更新所有受影响图层的顺序
        updatedLayers.forEach(layer => {
          if (layer.order > activeIndex) {
            layer.order += 1;
          }
        });
        newLayer.order = activeIndex + 1;
        updatedLayers.splice(activeIndex + 1, 0, newLayer);
      } else {
        updatedLayers.push(newLayer);
      }
    } else {
      updatedLayers.push(newLayer);
    }
    
    // 重新排序图层
    const sortedLayers = [...updatedLayers].sort((a, b) => a.order - b.order);
    
    setLayers(sortedLayers);
    setActiveLayerId(newLayer.id);
  };

  // 删除图层
  const deleteLayer = (layerId) => {
    if (layers.length <= 1) {
      // 至少保留一个图层
      return;
    }
    
    // 删除图层
    const updatedLayers = layers.filter(layer => layer.id !== layerId);
    
    // 删除该图层上的所有元素
    const updatedElements = elements.filter(el => el.layerId !== layerId);
    
    // 更新图层顺序
    updatedLayers.forEach((layer, index) => {
      layer.order = index;
    });
    
    // 如果删除的是当前活动图层，则选择另一个图层作为活动图层
    if (layerId === activeLayerId) {
      setActiveLayerId(updatedLayers.length > 0 ? updatedLayers[0].id : null);
    }
    
    // 如果删除的图层包含当前选中的元素，则取消选择
    const selectedElement = elements.find(el => el.id === selectedId);
    if (selectedElement && selectedElement.layerId === layerId) {
      setSelectedId(null);
    }
    
    setLayers(updatedLayers);
    setElements(updatedElements);
  };

  // 移动图层位置
  const moveLayer = (layerId, direction) => {
    const layerIndex = layers.findIndex(layer => layer.id === layerId);
    if (layerIndex === -1) return;
    
    const newIndex = direction === 'up' 
      ? Math.max(0, layerIndex - 1) 
      : Math.min(layers.length - 1, layerIndex + 1);
    
    if (newIndex === layerIndex) return;
    
    const updatedLayers = [...layers];
    const [movedLayer] = updatedLayers.splice(layerIndex, 1);
    updatedLayers.splice(newIndex, 0, movedLayer);
    
    // 更新所有图层的顺序
    updatedLayers.forEach((layer, index) => {
      layer.order = index;
    });
    
    setLayers(updatedLayers);
  };

  // 更新图层属性
  const updateLayer = (layerId, newAttrs) => {
    setLayers(
      layers.map(layer => {
        if (layer.id === layerId) {
          return {
            ...layer,
            ...newAttrs
          };
        }
        return layer;
      })
    );
  };

  // 添加矩形
  const addRectangle = () => {
    // 如果没有活动图层或活动图层被锁定，则不添加元素
    if (!activeLayerId || layers.find(l => l.id === activeLayerId)?.locked) {
      return;
    }
    
    const newElement = {
      id: uuidv4(),
      type: ElementType.RECTANGLE,
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      fill: getRandomColor(),
      rotation: 0,
      layerId: activeLayerId, // 关联到当前活动图层
      time: currentTime, // 添加时间属性
      duration: 5, // 默认持续5秒
      _isNew: true // 标记为新元素，用于居中放置
    };
    setElements([...elements, newElement]);
  };

  // 添加圆形
  const addCircle = () => {
    // 如果没有活动图层或活动图层被锁定，则不添加元素
    if (!activeLayerId || layers.find(l => l.id === activeLayerId)?.locked) {
      return;
    }
    
    const newElement = {
      id: uuidv4(),
      type: ElementType.CIRCLE,
      x: 100,
      y: 100,
      radius: 50,
      fill: getRandomColor(),
      rotation: 0,
      layerId: activeLayerId, // 关联到当前活动图层
      time: currentTime, // 添加时间属性
      duration: 5, // 默认持续5秒
      _isNew: true // 标记为新元素，用于居中放置
    };
    setElements([...elements, newElement]);
  };

  // 添加图片
  const addImage = (file) => {
    // 如果没有活动图层或活动图层被锁定，则不添加元素
    if (!activeLayerId || layers.find(l => l.id === activeLayerId)?.locked) {
      return;
    }
    
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    
    img.onload = () => {
      // 计算合适的尺寸，保持宽高比
      const maxSize = 300;
      let width = img.width;
      let height = img.height;
      
      if (width > height && width > maxSize) {
        height = (height / width) * maxSize;
        width = maxSize;
      } else if (height > maxSize) {
        width = (width / height) * maxSize;
        height = maxSize;
      }
      
      const newElement = {
        id: uuidv4(),
        type: ElementType.IMAGE,
        x: 100,
        y: 100,
        width,
        height,
        src: url,
        rotation: 0,
        layerId: activeLayerId, // 关联到当前活动图层
        time: currentTime, // 添加时间属性
        duration: 5, // 默认持续5秒
        _isNew: true // 标记为新元素，用于居中放置
      };
      
      setElements([...elements, newElement]);
    };
  };

  // 删除选中的元素
  const deleteSelected = () => {
    if (selectedId) {
      const selectedElement = elements.find(el => el.id === selectedId);
      if (selectedElement) {
        // 检查元素所在图层是否被锁定
        const layer = layers.find(l => l.id === selectedElement.layerId);
        if (layer && layer.locked) {
          return; // 如果图层被锁定，则不删除元素
        }
        
        setElements(elements.filter(el => el.id !== selectedId));
        setSelectedId(null);
      }
    }
  };

  // 更新元素属性（位置、大小、旋转等）
  const updateElement = (id, newAttrs) => {
    const element = elements.find(el => el.id === id);
    if (!element) return;
    
    // 检查元素所在图层是否被锁定
    const layer = layers.find(l => l.id === element.layerId);
    if (layer && layer.locked) {
      return; // 如果图层被锁定，则不更新元素
    }
    
    setElements(
      elements.map(el => {
        if (el.id === id) {
          return {
            ...el,
            ...newAttrs
          };
        }
        return el;
      })
    );
  };

  // 生成随机颜色
  const getRandomColor = () => {
    const colors = [
      '#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6', 
      '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
      '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A', 
      '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // 播放/暂停时间轴
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // 停止播放并回到起始位置
  const stopPlayback = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // 获取当前时间点应该显示的元素
  const getVisibleElements = useCallback(() => {
    return elements.filter(element => {
      // 检查元素所在图层是否可见
      const layer = layers.find(l => l.id === element.layerId);
      if (!layer || !layer.visible) return false;
      
      // 检查元素是否在当前时间点显示
      const elementStartTime = element.time || 0;
      const elementEndTime = elementStartTime + (element.duration || 5);
      return currentTime >= elementStartTime && currentTime <= elementEndTime;
    });
  }, [elements, layers, currentTime]);

  // 处理元素选择
  const handleSelect = (id) => {
    if (!id) {
      setSelectedId(null);
      return;
    }
    
    const element = elements.find(el => el.id === id);
    if (!element) return;
    
    // 检查元素所在图层是否被锁定
    const layer = layers.find(l => l.id === element.layerId);
    if (layer && layer.locked) {
      return; // 如果图层被锁定，则不选择元素
    }
    
    setSelectedId(id);
  };

  return (
    <div className="app-container">
      <Toolbar 
        onAddRectangle={addRectangle}
        onAddCircle={addCircle}
        onAddImage={addImage}
        onDelete={deleteSelected}
        hasSelection={!!selectedId}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        onStop={stopPlayback}
        currentTime={currentTime}
        frameRate={frameRate}
        onFrameRateChange={setFrameRate}
      />
      <div className="editor-layout">
        <div className="editor-main">
          <div className="canvas-area">
            <Canvas 
              elements={getVisibleElements()}
              selectedId={selectedId}
              onSelect={handleSelect}
              onChange={updateElement}
            />
          </div>
        </div>
        <div className="bottom-panel">
          <LayerPanel 
            layers={layers}
            activeLayerId={activeLayerId}
            onSelectLayer={setActiveLayerId}
            onAddLayer={addLayer}
            onDeleteLayer={deleteLayer}
            onMoveLayer={moveLayer}
            onUpdateLayer={updateLayer}
            elements={elements}
          />
          <Timeline 
            tracks={layers}
            elements={elements.map(el => ({
              ...el,
              trackId: el.layerId // 将layerId映射为trackId
            }))}
            currentTime={currentTime}
            totalDuration={totalDuration}
            onTimeChange={setCurrentTime}
            onDurationChange={setTotalDuration}
            timeScale={timeScale}
            onTimeScaleChange={setTimeScale}
            isPlaying={isPlaying}
            frameRate={frameRate}
            onUpdateElement={(id, newAttrs) => {
              // 如果有trackId，将其转换回layerId
              if (newAttrs.trackId) {
                const { trackId, ...rest } = newAttrs;
                updateElement(id, { ...rest, layerId: trackId });
              } else {
                updateElement(id, newAttrs);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
