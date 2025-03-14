import React, { useState, useEffect, useCallback } from 'react';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import LayerPanel from './components/LayerPanel';
import PropertyPanel from './components/PropertyPanel';
import Timeline from './components/Timeline';
import { v4 as uuidv4 } from 'uuid';
// tset
import { TimelineProvider } from './contexts/TimelineContext';
import KeyframeEditor from './components/KeyframeEditor';

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

  // 获取当前选中的元素
  const selectedElement = elements.find(el => el.id === selectedId);

  // 添加动画轨道状态
  const [animationTracks, setAnimationTracks] = useState([]);

  // 添加关键帧状态
  const [keyframeMode, setKeyframeMode] = useState(false);
  const [keyframeStage, setKeyframeStage] = useState('idle'); // 'idle', 'start', 'end'
  const [startKeyframe, setStartKeyframe] = useState(null);

  // 处理添加动画轨道的函数
  const handleAddAnimationTrack = (elementId, property, initialData = {}) => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;
    
    // 检查是否已经存在相同元素和属性的动画轨道
    const existingTrackIndex = animationTracks.findIndex(
      track => track.elementId === elementId && track.property === property
    );
    
    if (existingTrackIndex !== -1) {
      // 如果已存在，更新它
      const updatedTracks = [...animationTracks];
      updatedTracks[existingTrackIndex] = {
        ...updatedTracks[existingTrackIndex],
        ...initialData
      };
      setAnimationTracks(updatedTracks);
    } else {
      // 否则创建新轨道
      const newTrack = {
        id: uuidv4(),
        elementId,
        property,
        startTime: initialData.startTime || element.time || 0,
        duration: initialData.duration || 2,
        bezierPoints: [
          { x: 0, y: 0 },
          { x: 0.25, y: 0.1 },
          { x: 0.75, y: 0.9 },
          { x: 1, y: 1 }
        ],
        startValue: initialData.startValue !== undefined ? initialData.startValue : (element[property] || 0),
        endValue: initialData.endValue !== undefined ? initialData.endValue : (element[property] || 0)
      };
      
      setAnimationTracks(prev => [...prev, newTrack]);
    }
  };

  // 处理键盘事件
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && selectedId) {
        e.preventDefault(); // 防止页面滚动

        const element = elements.find(el => el.id === selectedId);
        if (!element) return;

        if (keyframeStage === 'idle') {
          // 开始记录关键帧 - 设置开始点
          setKeyframeMode(true);
          setKeyframeStage('start');
          
          // 记录开始关键帧，包括所有可能的属性
          setStartKeyframe({
            elementId: element.id,
            time: currentTime,
            properties: {
              x: element.x,
              y: element.y,
              width: element.width || (element.radius ? element.radius * 2 : 100),
              height: element.height || (element.radius ? element.radius * 2 : 100),
              radius: element.radius,
              opacity: element.opacity !== undefined ? element.opacity : 1,
              rotation: element.rotation || 0,
              fill: element.fill,
              stroke: element.stroke,
              strokeWidth: element.strokeWidth
            }
          });
        } 
        else if (keyframeStage === 'start') {
          // 设置结束点
          setKeyframeStage('end');
          
          // 记录结束关键帧并创建动画轨道
          if (startKeyframe && startKeyframe.elementId === element.id) {
            // 检查所有可能的属性变化
            const propertiesToCheck = [
              'x', 'y', 'width', 'height', 'radius', 
              'opacity', 'rotation', 'fill', 'stroke', 'strokeWidth'
            ];
            
            propertiesToCheck.forEach(property => {
              // 获取当前属性值，处理可能的undefined情况
              let currentValue;
              if (property === 'opacity' && element[property] === undefined) {
                currentValue = 1;
              } else if (property === 'rotation' && element[property] === undefined) {
                currentValue = 0;
              } else {
                currentValue = element[property];
              }
              
              // 获取起始属性值
              const startValue = startKeyframe.properties[property];
              
              // 如果属性存在且发生了变化，创建动画轨道
              if (currentValue !== undefined && startValue !== undefined && 
                  currentValue !== startValue) {
                // 创建新的动画轨道
                const newTrack = {
                  id: uuidv4(),
                  elementId: element.id,
                  property: property,
                  startTime: startKeyframe.time,
                  duration: currentTime - startKeyframe.time > 0 ? currentTime - startKeyframe.time : 1,
                  startValue: startValue,
                  endValue: currentValue,
                  bezierPoints: [
                    { x: 0, y: 0 },
                    { x: 0.25, y: 0.1 },
                    { x: 0.75, y: 0.9 },
                    { x: 1, y: 1 }
                  ]
                };
                
                // 添加到动画轨道列表
                setAnimationTracks(prev => [...prev, newTrack]);
              }
            });
            
            // 重置状态
            setKeyframeMode(false);
            setKeyframeStage('idle');
            setStartKeyframe(null);
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyframeStage, startKeyframe, selectedId, elements, currentTime, animationTracks]);

  // 贝塞尔曲线计算函数
  const calculateBezierValue = (points, t) => {
    if (!points || points.length < 4) return t; // 默认线性插值

    // 三次贝塞尔曲线公式: B(t) = (1-t)^3*P0.y + 3*(1-t)^2*t*P1.y + 3*(1-t)*t^2*P2.y + t^3*P3.y
    const p0 = points[0].y;
    const p1 = points[1].y;
    const p2 = points[2].y;
    const p3 = points[3].y;

    return Math.pow(1 - t, 3) * p0 +
      3 * Math.pow(1 - t, 2) * t * p1 +
      3 * (1 - t) * Math.pow(t, 2) * p2 +
      Math.pow(t, 3) * p3;
  };

  // 获取动画后的元素属性
  const getAnimatedProps = useCallback((element) => {
    if (!element) return null;

    // 查找与此元素相关的所有动画轨道
    const elementTracks = animationTracks.filter(track => track.elementId === element.id);
    if (elementTracks.length === 0) return element;

    // 创建动画后的元素副本
    const animatedElement = { ...element };

    // 应用每个轨道的动画效果
    elementTracks.forEach(track => {
      const { property, startTime, duration, bezierPoints, startValue, endValue } = track;

      // 检查当前时间是否在动画范围内
      if (currentTime >= startTime && currentTime <= startTime + duration) {
        // 计算动画进度 (0-1)
        const progress = (currentTime - startTime) / duration;

        // 使用贝塞尔曲线计算当前值
        const t = calculateBezierValue(bezierPoints, progress);

        // 线性插值计算当前属性值
        const value = startValue + (endValue - startValue) * t;

        // 应用动画值
        animatedElement[property] = value;
      }
    });

    return animatedElement;
  }, [animationTracks, currentTime]);

  // 获取当前时间点应该显示的元素（包含动画效果）
  const getVisibleElements = useCallback(() => {
    return elements.filter(element => {
      // 检查元素所在图层是否可见
      const layer = layers.find(l => l.id === element.layerId);
      if (!layer || !layer.visible) return false;

      // 检查元素是否在当前时间点显示
      const elementStartTime = element.time || 0;
      const elementEndTime = elementStartTime + (element.duration || 5);
      return currentTime >= elementStartTime && currentTime <= elementEndTime;
    }).map(element => {
      // 应用动画效果
      return getAnimatedProps(element);
    });
  }, [elements, layers, currentTime, getAnimatedProps]);

  const handleSelect = (id) => {
    setSelectedId(id);
  };

  return (
    <TimelineProvider>
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
          keyframeMode={keyframeMode}
          keyframeStage={keyframeStage}
          onToggleKeyframeMode={() => {
            if (!keyframeMode) {
              setKeyframeMode(true);
              setKeyframeStage('start');
            } else {
              setKeyframeMode(false);
              setKeyframeStage('idle');
              setStartKeyframe(null);
            }
          }}
        />
        <div className="editor-layout">
          <div className="editor-main">
            <div className="main-content">
              <div className="canvas-area">
                <Canvas
                  elements={getVisibleElements()}
                  selectedId={selectedId}
                  onSelect={handleSelect}
                  onChange={updateElement}
                />
              </div>
              <div className="property-area">
                <PropertyPanel
                  selectedElement={selectedElement}
                  onChange={(newAttrs) => selectedElement && updateElement(selectedElement.id, newAttrs)}
                  elements={elements}
                  onAddAnimationTrack={(property, value) => {
                    if (selectedElement) {
                      handleAddAnimationTrack(selectedElement.id, property, {
                        startValue: value,
                        endValue: value
                      });
                    }
                  }}
                />
                {selectedElement && (
                  <KeyframeEditor
                    selectedElement={selectedElement}
                    updateElement={(newAttrs) => updateElement(selectedElement.id, newAttrs)}
                  />
                )}
              </div>
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
              animationTracks={animationTracks} // 添加动画轨道
              onUpdateAnimationTrack={(trackId, newAttrs) => {
                setAnimationTracks(prev =>
                  prev.map(track => track.id === trackId ? { ...track, ...newAttrs } : track)
                );
              }}
              onDeleteAnimationTrack={(trackId) => {
                setAnimationTracks(prev => prev.filter(track => track.id !== trackId));
              }}
              currentTime={currentTime}
              totalDuration={totalDuration}
              onTimeChange={setCurrentTime}
              onDurationChange={setTotalDuration}
              timeScale={timeScale}
              onTimeScaleChange={setTimeScale}
              isPlaying={isPlaying}
              frameRate={frameRate}
              selectedId={selectedId}
              onSelect={handleSelect}
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

        {/* 添加关键帧模式指示器 */}
        {keyframeMode && (
          <div className="keyframe-indicator">
            <div className="keyframe-indicator-inner">
              <span>
                {keyframeStage === 'start' 
                  ? '已设置开始点，请调整元素并再次按空格键设置结束点' 
                  : '正在记录关键帧'}
              </span>
              <span className="blink">●</span>
            </div>
          </div>
        )}
      </div>
    </TimelineProvider>
  );
}

export default App;