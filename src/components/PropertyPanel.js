import React, { useState, useEffect } from 'react';

/**
 * 属性面板组件
 * 
 * @param {Object} props
 * @param {Object|null} props.selectedElement - 当前选中的元素
 * @param {Function} props.onChange - 元素属性变化的回调函数
 * @param {Array} props.elements - 所有元素数组
 */
const PropertyPanel = ({ selectedElement, onChange, elements }) => {
  // 锁定宽高比状态和临时输入值 - 必须在组件顶层声明所有Hooks
  const [aspectRatioLocked, setAspectRatioLocked] = useState(false);
  const [inputValues, setInputValues] = useState({});
  
  // 当选中元素变化时，重置输入值
  useEffect(() => {
    if (selectedElement) {
      setInputValues({});
    }
  }, [selectedElement?.id]);
  
  // 如果没有选中元素，显示空状态
  if (!selectedElement) {
    return (
      <div className="property-panel">
        <div className="property-panel-header">
          <h3>属性</h3>
        </div>
        <div className="property-panel-empty">
          <p>请选择一个元素以编辑其属性</p>
        </div>
      </div>
    );
  }

  // 处理属性变化
  const handleChange = (newAttrs) => {
    onChange(selectedElement.id, {
      ...selectedElement,
      ...newAttrs
    });
  };

  // 处理输入框变化
  const handleInputChange = (property, value) => {
    // 更新输入框显示值
    setInputValues({
      ...inputValues,
      [property]: value
    });
    
    // 如果输入为空，不更新实际属性
    if (value === '' || value === '-') {
      return;
    }
    
    // 尝试转换为数字
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    
    // 更新属性
    handleChange({ [property]: numValue });
  };

  // 处理数值输入变化
  const handleNumberChange = (property, value, min = null, max = null) => {
    // 更新输入框显示值
    setInputValues({
      ...inputValues,
      [property]: value
    });
    
    // 如果输入为空，不更新实际属性
    if (value === '' || value === '-') {
      return;
    }
    
    let numValue = parseFloat(value);
    
    // 验证是否为有效数字
    if (isNaN(numValue)) return;
    
    // 应用最小/最大限制
    if (min !== null && numValue < min) numValue = min;
    if (max !== null && numValue > max) numValue = max;
    
    handleChange({ [property]: numValue });
  };

  // 处理滑块变化
  const handleSliderChange = (property, value, min = 0, max = 100) => {
    let numValue = parseFloat(value);
    
    // 验证是否为有效数字
    if (isNaN(numValue)) return;
    
    // 应用最小/最大限制
    if (numValue < min) numValue = min;
    if (numValue > max) numValue = max;
    
    handleChange({ [property]: numValue });
    
    // 更新输入框显示值
    setInputValues({
      ...inputValues,
      [property]: numValue
    });
  };

  // 处理颜色变化
  const handleColorChange = (property, value) => {
    handleChange({ [property]: value });
  };

  // 处理键盘微调
  const handleKeyDown = (e, property, step = 1, min = null, max = null) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      
      const currentValue = selectedElement[property] || 0;
      let newValue = currentValue;
      
      if (e.key === 'ArrowUp') {
        newValue += step;
      } else if (e.key === 'ArrowDown') {
        newValue -= step;
      }
      
      // 应用最小/最大限制
      if (min !== null && newValue < min) newValue = min;
      if (max !== null && newValue > max) newValue = max;
      
      handleChange({ [property]: newValue });
      
      // 更新输入框显示值
      setInputValues({
        ...inputValues,
        [property]: newValue
      });
    }
  };

  // 处理尺寸变化，考虑宽高比锁定
  const handleSizeChange = (property, value) => {
    // 更新输入框显示值
    setInputValues({
      ...inputValues,
      [property]: value
    });
    
    // 如果输入为空，不更新实际属性
    if (value === '' || value === '-') {
      return;
    }
    
    let numValue = parseFloat(value);
    
    // 验证是否为有效数字
    if (isNaN(numValue) || numValue < 5) return;
    
    if (aspectRatioLocked) {
      // 如果锁定了宽高比
      const isWidth = property === 'width';
      const otherProperty = isWidth ? 'height' : 'width';
      const otherValue = selectedElement[otherProperty];
      
      // 计算当前宽高比
      const aspectRatio = isWidth 
        ? selectedElement.width / selectedElement.height 
        : selectedElement.height / selectedElement.width;
      
      // 根据宽高比计算新的值
      const newOtherValue = isWidth 
        ? numValue / aspectRatio 
        : numValue * aspectRatio;
      
      handleChange({ 
        [property]: numValue,
        [otherProperty]: Math.round(newOtherValue)
      });
      
      // 更新另一个输入框的显示值
      setInputValues({
        ...inputValues,
        [property]: numValue,
        [otherProperty]: Math.round(newOtherValue)
      });
    } else {
      // 如果没有锁定宽高比，只更新当前属性
      handleChange({ [property]: numValue });
    }
  };

  // 处理缩放变化，考虑宽高比锁定
  const handleScaleChange = (property, value) => {
    // 计算实际缩放值（输入是百分比）
    const scaleValue = value / 100;
    
    // 更新输入框显示值
    setInputValues({
      ...inputValues,
      [property]: value
    });
    
    // 如果输入为空，不更新实际属性
    if (value === '' || value === '-') {
      return;
    }
    
    let numValue = parseFloat(scaleValue);
    
    // 验证是否为有效数字
    if (isNaN(numValue) || numValue < 0.1) return;
    
    if (aspectRatioLocked) {
      // 如果锁定了宽高比
      const isX = property === 'scaleX';
      const otherProperty = isX ? 'scaleY' : 'scaleX';
      
      handleChange({ 
        [property]: numValue,
        [otherProperty]: numValue
      });
      
      // 更新另一个输入框的显示值
      setInputValues({
        ...inputValues,
        [property]: value,
        [otherProperty]: Math.round(numValue * 100)
      });
    } else {
      // 如果没有锁定宽高比，只更新当前属性
      handleChange({ [property]: numValue });
    }
  };

  // 获取输入框显示值
  const getInputValue = (property, defaultValue, factor = 1, precision = 1) => {
    if (inputValues[property] !== undefined) {
      return inputValues[property];
    }
    
    const value = selectedElement[property];
    if (value === undefined) {
      return defaultValue;
    }
    
    return Math.round(value * factor * Math.pow(10, precision)) / Math.pow(10, precision);
  };

  // 渲染位置编辑器
  const renderPositionEditor = () => (
    <div className="property-group">
      <div className="property-group-header">
        <h4>位置</h4>
      </div>
      <div className="property-group-content">
        <div className="property-row">
          <label>X:</label>
          <div className="number-input-container">
            <button 
              className="number-input-button"
              onClick={() => handleNumberChange('x', selectedElement.x - 1)}
            >-</button>
            <input
              type="text"
              value={getInputValue('x', 0)}
              onChange={(e) => handleNumberChange('x', e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'x', 1)}
            />
            <button 
              className="number-input-button"
              onClick={() => handleNumberChange('x', selectedElement.x + 1)}
            >+</button>
          </div>
        </div>
        <div className="property-row">
          <label>Y:</label>
          <div className="number-input-container">
            <button 
              className="number-input-button"
              onClick={() => handleNumberChange('y', selectedElement.y - 1)}
            >-</button>
            <input
              type="text"
              value={getInputValue('y', 0)}
              onChange={(e) => handleNumberChange('y', e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'y', 1)}
            />
            <button 
              className="number-input-button"
              onClick={() => handleNumberChange('y', selectedElement.y + 1)}
            >+</button>
          </div>
        </div>
      </div>
    </div>
  );

  // 渲染尺寸编辑器
  const renderSizeEditor = () => {
    // 对于圆形，显示半径编辑器
    if (selectedElement.type === 'circle') {
      return (
        <div className="property-group">
          <div className="property-group-header">
            <h4>尺寸</h4>
          </div>
          <div className="property-group-content">
            <div className="property-row">
              <label>半径:</label>
              <div className="number-input-container">
                <button 
                  className="number-input-button"
                  onClick={() => handleNumberChange('radius', selectedElement.radius - 1, 5)}
                >-</button>
                <input
                  type="text"
                  value={getInputValue('radius', 50)}
                  onChange={(e) => handleNumberChange('radius', e.target.value, 5)}
                  onKeyDown={(e) => handleKeyDown(e, 'radius', 1, 5)}
                />
                <button 
                  className="number-input-button"
                  onClick={() => handleNumberChange('radius', selectedElement.radius + 1)}
                >+</button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // 对于矩形和图片，显示宽度和高度编辑器
    return (
      <div className="property-group">
        <div className="property-group-header">
          <h4>尺寸</h4>
          <button 
            className={`aspect-ratio-lock ${aspectRatioLocked ? 'locked' : 'unlocked'}`}
            onClick={() => setAspectRatioLocked(!aspectRatioLocked)}
            title={aspectRatioLocked ? "解锁宽高比" : "锁定宽高比"}
          >
            <i className={`fa ${aspectRatioLocked ? 'fa-lock' : 'fa-unlock'}`}></i>
          </button>
        </div>
        <div className="property-group-content">
          <div className="property-row">
            <label>宽度:</label>
            <div className="number-input-container">
              <button 
                className="number-input-button"
                onClick={() => handleSizeChange('width', selectedElement.width - 1)}
              >-</button>
              <input
                type="text"
                value={getInputValue('width', 100)}
                onChange={(e) => handleSizeChange('width', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'width', 1, 5)}
              />
              <button 
                className="number-input-button"
                onClick={() => handleSizeChange('width', selectedElement.width + 1)}
              >+</button>
            </div>
          </div>
          <div className="property-row">
            <label>高度:</label>
            <div className="number-input-container">
              <button 
                className="number-input-button"
                onClick={() => handleSizeChange('height', selectedElement.height - 1)}
              >-</button>
              <input
                type="text"
                value={getInputValue('height', 100)}
                onChange={(e) => handleSizeChange('height', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'height', 1, 5)}
              />
              <button 
                className="number-input-button"
                onClick={() => handleSizeChange('height', selectedElement.height + 1)}
              >+</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染旋转编辑器
  const renderRotationEditor = () => {
    // 获取当前旋转角度，如果不存在则默认为0
    const rotation = selectedElement.rotation !== undefined ? selectedElement.rotation : 0;
    
    return (
      <div className="property-group">
        <div className="property-group-header">
          <h4>旋转</h4>
        </div>
        <div className="property-group-content">
          <div className="property-row">
            <label>角度:</label>
            <div className="number-input-container">
              <button 
                className="number-input-button"
                onClick={() => handleNumberChange('rotation', rotation - 1)}
              >-</button>
              <input
                type="text"
                value={getInputValue('rotation', 0)}
                onChange={(e) => handleNumberChange('rotation', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'rotation', 1)}
              />
              <button 
                className="number-input-button"
                onClick={() => handleNumberChange('rotation', rotation + 1)}
              >+</button>
            </div>
          </div>
          <div className="rotation-slider-container">
            <div className="rotation-slider">
              <div 
                className="rotation-handle" 
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                <div className="rotation-indicator"></div>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={rotation}
                onChange={(e) => handleNumberChange('rotation', e.target.value)}
                className="rotation-range"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染不透明度编辑器
  const renderOpacityEditor = () => {
    // 获取当前不透明度，如果不存在则默认为1
    const opacity = selectedElement.opacity !== undefined ? selectedElement.opacity : 1;
    
    return (
      <div className="property-group">
        <div className="property-group-header">
          <h4>不透明度</h4>
        </div>
        <div className="property-group-content">
          <div className="property-row">
            <label>{Math.round(opacity * 100)}%</label>
            <div className="slider-container">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={opacity}
                onChange={(e) => handleSliderChange('opacity', e.target.value, 0, 1)}
                className="opacity-slider"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染填充颜色编辑器（仅适用于形状）
  const renderFillEditor = () => {
    if (selectedElement.type === 'image') return null;
    
    return (
      <div className="property-group">
        <div className="property-group-header">
          <h4>填充</h4>
        </div>
        <div className="property-group-content">
          <div className="property-row">
            <label>颜色:</label>
            <div className="color-picker-container">
              <div 
                className="color-preview" 
                style={{ backgroundColor: selectedElement.fill }}
              ></div>
              <input
                type="color"
                value={selectedElement.fill}
                onChange={(e) => handleColorChange('fill', e.target.value)}
                className="color-picker"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染描边编辑器（仅适用于形状）
  const renderStrokeEditor = () => {
    if (selectedElement.type === 'image') return null;
    
    // 获取当前描边属性，如果不存在则设置默认值
    const stroke = selectedElement.stroke || '';
    const strokeWidth = selectedElement.strokeWidth || 0;
    
    return (
      <div className="property-group">
        <div className="property-group-header">
          <h4>描边</h4>
        </div>
        <div className="property-group-content">
          <div className="property-row">
            <label>颜色:</label>
            <div className="color-picker-container">
              <div 
                className="color-preview" 
                style={{ backgroundColor: stroke || 'transparent' }}
              ></div>
              <input
                type="color"
                value={stroke || '#000000'}
                onChange={(e) => handleColorChange('stroke', e.target.value)}
                className="color-picker"
              />
            </div>
            <button 
              className="reset-button" 
              onClick={() => {
                handleChange({ 
                  stroke: '', 
                  strokeWidth: 0 
                });
              }}
              title="移除描边"
            >
              <i className="fa fa-times"></i>
            </button>
          </div>
          <div className="property-row">
            <label>宽度:</label>
            <div className="number-input-container">
              <button 
                className="number-input-button"
                onClick={() => handleNumberChange('strokeWidth', Math.max(0, strokeWidth - 1))}
              >-</button>
              <input
                type="text"
                value={getInputValue('strokeWidth', 0)}
                min="0"
                onChange={(e) => handleNumberChange('strokeWidth', e.target.value, 0)}
                onKeyDown={(e) => handleKeyDown(e, 'strokeWidth', 1, 0)}
              />
              <button 
                className="number-input-button"
                onClick={() => handleNumberChange('strokeWidth', strokeWidth + 1)}
              >+</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染圆角编辑器（仅适用于矩形）
  const renderCornerRadiusEditor = () => {
    if (selectedElement.type !== 'rectangle') return null;
    
    // 获取当前圆角半径，如果不存在则默认为0
    const cornerRadius = selectedElement.cornerRadius || 0;
    
    return (
      <div className="property-group">
        <div className="property-group-header">
          <h4>圆角</h4>
        </div>
        <div className="property-group-content">
          <div className="property-row">
            <label>半径:</label>
            <div className="number-input-container">
              <button 
                className="number-input-button"
                onClick={() => handleNumberChange('cornerRadius', Math.max(0, cornerRadius - 1))}
              >-</button>
              <input
                type="text"
                value={getInputValue('cornerRadius', 0)}
                min="0"
                onChange={(e) => handleNumberChange('cornerRadius', e.target.value, 0)}
                onKeyDown={(e) => handleKeyDown(e, 'cornerRadius', 1, 0)}
              />
              <button 
                className="number-input-button"
                onClick={() => handleNumberChange('cornerRadius', cornerRadius + 1)}
              >+</button>
            </div>
          </div>
          <div className="slider-container">
            <input
              type="range"
              min="0"
              max={Math.min(selectedElement.width / 2, selectedElement.height / 2)}
              value={cornerRadius}
              onChange={(e) => handleNumberChange('cornerRadius', e.target.value, 0)}
              className="corner-radius-slider"
            />
          </div>
        </div>
      </div>
    );
  };

  // 渲染缩放编辑器
  const renderScaleEditor = () => {
    // 获取当前缩放比例，如果不存在则默认为1（100%）
    const scaleX = selectedElement.scaleX !== undefined ? selectedElement.scaleX : 1;
    const scaleY = selectedElement.scaleY !== undefined ? selectedElement.scaleY : 1;
    
    return (
      <div className="property-group">
        <div className="property-group-header">
          <h4>缩放</h4>
          <button 
            className={`aspect-ratio-lock ${aspectRatioLocked ? 'locked' : 'unlocked'}`}
            onClick={() => setAspectRatioLocked(!aspectRatioLocked)}
            title={aspectRatioLocked ? "解锁宽高比" : "锁定宽高比"}
          >
            <i className={`fa ${aspectRatioLocked ? 'fa-lock' : 'fa-unlock'}`}></i>
          </button>
        </div>
        <div className="property-group-content">
          <div className="property-row">
            <label>X:</label>
            <div className="number-input-container">
              <button 
                className="number-input-button"
                onClick={() => handleScaleChange('scaleX', Math.round((scaleX - 0.1) * 100))}
              >-</button>
              <input
                type="text"
                value={getInputValue('scaleX', 100, 100, 0)}
                onChange={(e) => handleScaleChange('scaleX', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'scaleX', 0.1, 0.1)}
              />
              <button 
                className="number-input-button"
                onClick={() => handleScaleChange('scaleX', Math.round((scaleX + 0.1) * 100))}
              >+</button>
            </div>
            <span className="unit">%</span>
          </div>
          <div className="property-row">
            <label>Y:</label>
            <div className="number-input-container">
              <button 
                className="number-input-button"
                onClick={() => handleScaleChange('scaleY', Math.round((scaleY - 0.1) * 100))}
              >-</button>
              <input
                type="text"
                value={getInputValue('scaleY', 100, 100, 0)}
                onChange={(e) => handleScaleChange('scaleY', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'scaleY', 0.1, 0.1)}
              />
              <button 
                className="number-input-button"
                onClick={() => handleScaleChange('scaleY', Math.round((scaleY + 0.1) * 100))}
              >+</button>
            </div>
            <span className="unit">%</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="property-panel">
      <div className="property-panel-header">
        <h3>属性</h3>
      </div>
      <div className="property-panel-content">
        {renderPositionEditor()}
        {renderSizeEditor()}
        {renderRotationEditor()}
        {renderScaleEditor()}
        {renderOpacityEditor()}
        {renderFillEditor()}
        {renderStrokeEditor()}
        {renderCornerRadiusEditor()}
      </div>
    </div>
  );
};

export default PropertyPanel;
