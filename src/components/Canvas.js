import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Circle, Image, Transformer } from 'react-konva';
import useImage from 'use-image';

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

  return (
    <>
      <Image
        image={image}
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}
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
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          // 重置缩放
          node.scaleX(1);
          node.scaleY(1);
          
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            // 设置最小尺寸
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
            rotation: node.rotation(),
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

  return (
    <>
      <Rect
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}
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
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          // 重置缩放
          node.scaleX(1);
          node.scaleY(1);
          
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            // 设置最小尺寸
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
            rotation: node.rotation(),
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

  return (
    <>
      <Circle
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}
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
          const scaleX = node.scaleX();

          // 重置缩放
          node.scaleX(1);
          node.scaleY(1);
          
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            // 对于圆形，我们使用x缩放来调整半径
            radius: Math.max(5, node.radius() * scaleX),
            rotation: node.rotation(),
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
const Canvas = ({ elements, selectedId, onSelect, onChange }) => {
  const stageRef = useRef();
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [stageDragging, setStageDragging] = useState(false);

  // 处理画布缩放
  const handleWheel = (e) => {
    e.evt.preventDefault();

    const scaleBy = 1.1;
    const stage = stageRef.current;
    const oldScale = stage.scaleX();

    // 获取鼠标相对于舞台的位置
    const mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
    };

    // 计算新的缩放级别
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

    // 限制缩放范围
    if (newScale < 0.1 || newScale > 5) return;

    // 设置新的舞台位置和缩放
    setStageScale(newScale);
    setStagePosition({
      x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
      y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale,
    });
  };

  // 处理画布拖动
  const handleDragStart = (e) => {
    // 确保只有在点击空白区域时才设置拖动状态
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setStageDragging(true);
    }
  };

  const handleDragEnd = (e) => {
    // 只有在真正拖动画布时才更新位置
    if (stageDragging) {
      setStageDragging(false);
      setStagePosition({
        x: e.target.x(),
        y: e.target.y(),
      });
    }
  };

  // 处理点击空白区域取消选择
  const checkDeselect = (e) => {
    // 点击空白区域取消选择
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      onSelect(null);
    }
  };

  return (
    <div className="canvas-container">
      <Stage
        width={window.innerWidth}
        height={window.innerHeight - 60} // 减去工具栏高度
        onWheel={handleWheel}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePosition.x}
        y={stagePosition.y}
        draggable // 允许画布拖动，但我们会在元素的onDragStart中阻止冒泡
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onMouseDown={checkDeselect}
        onTouchStart={checkDeselect}
        ref={stageRef}
      >
        <Layer>
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
      </Stage>
    </div>
  );
};

export default Canvas;
