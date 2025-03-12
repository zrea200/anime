import React, { useState } from 'react';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import { v4 as uuidv4 } from 'uuid';

// 元素类型枚举
const ElementType = {
  RECTANGLE: 'rectangle',
  CIRCLE: 'circle',
  IMAGE: 'image'
};

function App() {
  // 存储画布上的所有元素
  const [elements, setElements] = useState([]);
  // 当前选中的元素ID
  const [selectedId, setSelectedId] = useState(null);

  // 添加矩形
  const addRectangle = () => {
    const newElement = {
      id: uuidv4(),
      type: ElementType.RECTANGLE,
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      fill: getRandomColor(),
      rotation: 0
    };
    setElements([...elements, newElement]);
  };

  // 添加圆形
  const addCircle = () => {
    const newElement = {
      id: uuidv4(),
      type: ElementType.CIRCLE,
      x: 100,
      y: 100,
      radius: 50,
      fill: getRandomColor(),
      rotation: 0
    };
    setElements([...elements, newElement]);
  };

  // 添加图片
  const addImage = (file) => {
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
        rotation: 0
      };
      
      setElements([...elements, newElement]);
    };
  };

  // 删除选中的元素
  const deleteSelected = () => {
    if (selectedId) {
      setElements(elements.filter(el => el.id !== selectedId));
      setSelectedId(null);
    }
  };

  // 更新元素属性（位置、大小、旋转等）
  const updateElement = (id, newAttrs) => {
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

  return (
    <div className="app-container">
      <Toolbar 
        onAddRectangle={addRectangle}
        onAddCircle={addCircle}
        onAddImage={addImage}
        onDelete={deleteSelected}
        hasSelection={!!selectedId}
      />
      <Canvas 
        elements={elements}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onChange={updateElement}
      />
    </div>
  );
}

export default App;
