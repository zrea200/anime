import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Circle, Image, Transformer, Text } from 'react-konva';
import useImage from 'use-image';
import { useTimeline } from '../contexts/TimelineContext';
import { interpolateValue } from './timeline/TimelineUtils';

/**
 * 图片元素组件
 */
const ImageElement = ({ shapeProps, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef();
  const trRef = useRef();
  const [image] = useImage(shapeProps.src);

  useEffect(() => {
    if (isSelected && trRef.current) {
      // 将变换器附加到选中的形状
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  // 处理额外属性
  const { opacity = 1, ...otherProps } = shapeProps;

  // 获取缩放属性，如果不存在则默认为1
  const scaleX = otherProps.scaleX !== undefined ? otherProps.scaleX : 1;
  const scaleY = otherProps.scaleY !== undefined ? otherProps.scaleY : 1;
  
  // 设置旋转原点为图片中心
  const offsetX = otherProps.width / 2;
  const offsetY = otherProps.height / 2;

  return (
    <>
      <Image
        image={image}
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...otherProps}
        opacity={opacity}
        scaleX={scaleX}
        scaleY={scaleY}
        offsetX={offsetX}
        offsetY={offsetY}
        draggable
        onDragStart={(e) => {
          // 阻止事件冒泡，防止触发Stage的拖动
          e.evt.stopPropagation();
        }}
        onDragEnd={(e) => {
          // 阻止事件冒泡，防止触发Stage的拖动
          e.evt.stopPropagation();
          
          // 更新元素位置
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          // 变换结束后更新属性
          const node = shapeRef.current;
          
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            scaleX: node.scaleX(),
            scaleY: node.scaleY()
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // 限制最小尺寸
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

/**
 * 矩形元素组件
 */
const RectangleElement = ({ shapeProps, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected && trRef.current) {
      // 将变换器附加到选中的形状
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  // 处理额外属性
  const { cornerRadius = 0, opacity = 1, ...otherProps } = shapeProps;

  // 获取缩放属性，如果不存在则默认为1
  const scaleX = otherProps.scaleX !== undefined ? otherProps.scaleX : 1;
  const scaleY = otherProps.scaleY !== undefined ? otherProps.scaleY : 1;
  
  // 设置旋转原点为矩形中心
  const offsetX = otherProps.width / 2;
  const offsetY = otherProps.height / 2;

  return (
    <>
      <Rect
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...otherProps}
        cornerRadius={cornerRadius}
        opacity={opacity}
        scaleX={scaleX}
        scaleY={scaleY}
        offsetX={offsetX}
        offsetY={offsetY}
        draggable
        onDragStart={(e) => {
          // 阻止事件冒泡，防止触发Stage的拖动
          e.evt.stopPropagation();
        }}
        onDragEnd={(e) => {
          // 阻止事件冒泡，防止触发Stage的拖动
          e.evt.stopPropagation();
          
          // 更新元素位置
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          // 变换结束后更新属性
          const node = shapeRef.current;
          
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            scaleX: node.scaleX(),
            scaleY: node.scaleY()
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // 限制最小尺寸
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

/**
 * 圆形元素组件
 */
const CircleElement = ({ shapeProps, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected && trRef.current) {
      // 将变换器附加到选中的形状
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  // 处理额外属性
  const { opacity = 1, ...otherProps } = shapeProps;

  // 获取缩放属性，如果不存在则默认为1
  const scaleX = otherProps.scaleX !== undefined ? otherProps.scaleX : 1;
  const scaleY = otherProps.scaleY !== undefined ? otherProps.scaleY : 1;

  return (
    <>
      <Circle
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...otherProps}
        opacity={opacity}
        scaleX={scaleX}
        scaleY={scaleY}
        draggable
        onDragStart={(e) => {
          // 阻止事件冒泡，防止触发Stage的拖动
          e.evt.stopPropagation();
        }}
        onDragEnd={(e) => {
          // 阻止事件冒泡，防止触发Stage的拖动
          e.evt.stopPropagation();
          
          // 更新元素位置
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          // 变换结束后更新属性
          const node = shapeRef.current;
          
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            scaleX: node.scaleX(),
            scaleY: node.scaleY()
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // 限制最小尺寸
            if (newBox.width < 10 || newBox.height < 10) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

/**
 * 画布组件
 * 
 * @param {Object} props
 * @param {Array} props.elements - 画布上的元素数组
 * @param {string|null} props.selectedId - 当前选中的元素ID
 * @param {Function} props.onSelect - 选择元素的回调函数
 * @param {Function} props.onChange - 元素属性变化的回调函数
 */
const Canvas = ({ elements: originalElements, selectedId, onSelect, onChange }) => {
  const stageRef = useRef();
  const containerRef = useRef();
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [stageDragging, setStageDragging] = useState(false);
  
  // 画布尺寸常量 - 16:9比例
  const CANVAS_WIDTH = 1920;
  const CANVAS_HEIGHT = 1080;
  
  // 处理元素位置，确保它们在画布区域内并居中导入
  const elements = originalElements.map(element => {
    // 如果是新添加的元素（没有x和y坐标或者是默认值100），则将其居中放置
    if (element.x === undefined || element.y === undefined || 
        (element.x === 100 && element.y === 100 && element._isNew)) {
      // 计算居中位置
      const centerX = CANVAS_WIDTH / 2 - (element.width || element.radius || 50) / 2;
      const centerY = CANVAS_HEIGHT / 2 - (element.height || element.radius || 50) / 2;
      
      // 更新元素位置到App组件
      onChange(element.id, {
        x: centerX,
        y: centerY,
        _isNew: false
      });
      
      // 返回更新后的元素
      const { _isNew, ...rest } = element;
      return {
        ...rest,
        x: centerX,
        y: centerY
      };
    }
    
    return element;
  });
  
  // 调整容器大小并计算初始缩放和位置
  useEffect(() => {
    const updateContainerSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;
        
        // 计算适合容器的缩放比例，保持16:9比例
        const scaleX = containerWidth / CANVAS_WIDTH;
        const scaleY = (containerHeight - 40) / CANVAS_HEIGHT; // 减去顶部和底部边距
        const scale = Math.min(scaleX, scaleY, 0.9); // 限制最大缩放，确保有边距
        
        // 设置缩放和居中位置
        setStageScale(scale);
        
        // 计算居中位置
        const x = (containerWidth - CANVAS_WIDTH * scale) / 2;
        const y = 20; // 顶部留出一些空间
        
        setStagePosition({ x, y });
      }
    };
    
    updateContainerSize();
    window.addEventListener('resize', updateContainerSize);
    return () => window.removeEventListener('resize', updateContainerSize);
  }, []);

  // 处理画布缩放
  const handleWheel = (e) => {
    e.evt.preventDefault();

    const scaleBy = 1.1;
    const oldScale = stageScale;
    const stage = stageRef.current;
    
    // 获取鼠标在容器中的位置
    const pointerPos = stage.getPointerPosition();
    
    // 计算鼠标相对于舞台的位置
    const mousePointTo = {
      x: (pointerPos.x - stagePosition.x) / oldScale,
      y: (pointerPos.y - stagePosition.y) / oldScale
    };

    // 计算新的缩放级别
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

    // 限制缩放范围
    if (newScale < 0.1 || newScale > 5) return;

    // 设置新的缩放级别
    setStageScale(newScale);
    
    // 计算新的位置，使鼠标指向的点保持在相同位置
    const newPos = {
      x: pointerPos.x - mousePointTo.x * newScale,
      y: pointerPos.y - mousePointTo.y * newScale
    };
    
    setStagePosition(newPos);
  };

  // 处理鼠标按下事件
  const handleMouseDown = (e) => {
    // 检查是否是鼠标中键 (button === 1)
    if (e.evt.button === 1) {
      e.evt.preventDefault();
      setStageDragging(true);
      
      // 记录鼠标初始位置
      const mousePos = {
        x: e.evt.clientX,
        y: e.evt.clientY
      };
      
      // 记录舞台初始位置
      const initialPos = { ...stagePosition };
      
      // 处理鼠标移动
      const handleMouseMove = (moveEvent) => {
        const dx = moveEvent.clientX - mousePos.x;
        const dy = moveEvent.clientY - mousePos.y;
        
        setStagePosition({
          x: initialPos.x + dx,
          y: initialPos.y + dy
        });
      };
      
      // 处理鼠标释放
      const handleMouseUp = () => {
        setStageDragging(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    // 点击空白区域取消选择
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      onSelect(null);
    }
  };

  return (
    <div className="canvas-container" ref={containerRef}>
      {/* 实际的Konva舞台 */}
      <Stage
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onWheel={handleWheel}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePosition.x}
        y={stagePosition.y}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        ref={stageRef}
      >
        {/* 背景层 */}
        <Layer>
          <Rect
            x={0}
            y={0}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            fill="white"
            stroke="#444"
            strokeWidth={1}
          />
        </Layer>
        
        {/* 元素层 */}
        <Layer
          clipFunc={(ctx) => {
            // 裁剪区域为画布大小，确保元素不会显示在画布外
            ctx.beginPath();
            ctx.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            ctx.closePath();
          }}
        >
          {elements.map((element) => {
            const isSelected = element.id === selectedId;
            
            // 根据元素类型渲染不同的组件
            if (element.type === 'rectangle') {
              return (
                <RectangleElement
                  key={element.id}
                  shapeProps={element}
                  isSelected={isSelected}
                  onSelect={() => onSelect(element.id)}
                  onChange={(newAttrs) => onChange(element.id, newAttrs)}
                />
              );
            } else if (element.type === 'circle') {
              return (
                <CircleElement
                  key={element.id}
                  shapeProps={element}
                  isSelected={isSelected}
                  onSelect={() => onSelect(element.id)}
                  onChange={(newAttrs) => onChange(element.id, newAttrs)}
                />
              );
            } else if (element.type === 'image') {
              return (
                <ImageElement
                  key={element.id}
                  shapeProps={element}
                  isSelected={isSelected}
                  onSelect={() => onSelect(element.id)}
                  onChange={(newAttrs) => onChange(element.id, newAttrs)}
                />
              );
            }
            return null;
          })}
        </Layer>
        
        {/* 信息层 */}
        <Layer>
          <Rect
            x={CANVAS_WIDTH - 120}
            y={CANVAS_HEIGHT - 30}
            width={110}
            height={20}
            fill="rgba(0, 0, 0, 0.5)"
            cornerRadius={4}
          />
          <Text
            x={CANVAS_WIDTH - 115}
            y={CANVAS_HEIGHT - 25}
            text="1920 x 1080"
            fontSize={12}
            fontFamily="monospace"
            fill="white"
          />
        </Layer>
      </Stage>
    </div>
  );
};

// 这里有一个 Canvas 函数被重复声明了
// 将第二个 Canvas 函数改名或合并到第一个函数中
// 原来的代码：
// function Canvas({ elements, selectedId, onSelect, onChange }) {
//   const { currentTime } = useTimeline();
//   
//   应用关键帧动画
//   const getAnimatedProps = (element) => {
//     if (!element.keyframes) {
//       return element;
//     }
//     
//     const animatedProps = { ...element };
//     
//     // 处理每个可能有关键帧的属性
//     const animatableProps = ['x', 'y', 'width', 'height', 'opacity', 'rotation'];
//     
//     animatableProps.forEach(prop => {
//       if (element.keyframes[prop]) {
//         animatedProps[prop] = interpolateValue(
//           element.keyframes[prop],
//           currentTime,
//           element[prop] || getDefaultValue(prop)
//         );
//       }
//     });
//     
//     return animatedProps;
//   };
//   
//   获取属性的默认值
//   const getDefaultValue = (prop) => {
//     const defaults = {
//       x: 0,
//       y: 0,
//       width: 100,
//       height: 100,
//       opacity: 1,
//       rotation: 0
//     };
//     
//     return defaults[prop] || 0;
//   };
//   
//   return (
//     <Stage width={width} height={height} ref={stageRef}>
//       <Layer>
//         {elements.map((element) => {
//           // 应用关键帧动画
//           const animatedElement = getAnimatedProps(element);
//           
//           使用animatedElement替代element进行渲染
//           const isSelected = element.id === selectedId;
//           
//           // 根据元素类型渲染不同的组件
//           if (element.type === 'rectangle') {
//             return (
//               <RectangleElement
//                 key={element.id}
//                 shapeProps={element}
//                 isSelected={isSelected}
//                 onSelect={() => onSelect(element.id)}
//                 onChange={(newAttrs) => onChange(element.id, newAttrs)}
//               />
//             );
//           } else if (element.type === 'circle') {
//             return (
//               <CircleElement
//                 key={element.id}
//                 shapeProps={element}
//                 isSelected={isSelected}
//                 onSelect={() => onSelect(element.id)}
//                 onChange={(newAttrs) => onChange(element.id, newAttrs)}
//               />
//             );
//           } else if (element.type === 'image') {
//             return (
//               <ImageElement
//                 key={element.id}
//                 shapeProps={element}
//                 isSelected={isSelected}
//                 onSelect={() => onSelect(element.id)}
//                 onChange={(newAttrs) => onChange(element.id, newAttrs)}
//               />
//             );
//           }
//           return null;
//         })}
//       </Layer>
//     </Stage>
//   );
// }

export default Canvas;
// export default AnimatedCanvas as Canvas;
