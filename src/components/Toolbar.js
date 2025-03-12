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
 */
const Toolbar = ({ onAddRectangle, onAddCircle, onAddImage, onDelete, hasSelection }) => {
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

  return (
    <div className="toolbar">
      <button onClick={onAddRectangle}>添加矩形</button>
      <button onClick={onAddCircle}>添加圆形</button>
      
      <label htmlFor="upload-image">
        添加图片
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
      >
        删除选中元素
      </button>
    </div>
  );
};

export default Toolbar;
