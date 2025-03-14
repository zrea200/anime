import React from 'react';
import { useTimeline } from '../contexts/TimelineContext';

function KeyframeEditor({ selectedElement, updateElement }) {
  // 确保使用 currentTime 变量，或者不声明它
  const { currentTime } = useTimeline();
  
  if (!selectedElement) {
    return null;
  }
  
  const { keyframes = {} } = selectedElement;
  
  // 获取所有关键帧的属性
  const properties = Object.keys(keyframes);
  
  // 删除关键帧
  const deleteKeyframe = (property, time) => {
    const updatedKeyframes = { ...keyframes };
    updatedKeyframes[property] = keyframes[property].filter(kf => kf.time !== time);
    
    // 如果该属性没有关键帧了，删除该属性
    if (updatedKeyframes[property].length === 0) {
      delete updatedKeyframes[property];
    }
    
    updateElement({
      ...selectedElement,
      keyframes: updatedKeyframes
    });
  };
  
  // 更新关键帧值
  const updateKeyframeValue = (property, time, newValue) => {
    const updatedKeyframes = { ...keyframes };
    const keyframeIndex = updatedKeyframes[property].findIndex(kf => kf.time === time);
    
    if (keyframeIndex !== -1) {
      updatedKeyframes[property][keyframeIndex] = {
        ...updatedKeyframes[property][keyframeIndex],
        value: parseFloat(newValue)
      };
      
      updateElement({
        ...selectedElement,
        keyframes: updatedKeyframes
      });
    }
  };
  
  return (
    <div className="keyframe-editor">
      <h3>关键帧编辑器</h3>
      
      {properties.length === 0 ? (
        <p>没有关键帧</p>
      ) : (
        <div>
          {properties.map(property => (
            <div key={property} className="keyframe-property">
              <h4>{getPropertyLabel(property)}</h4>
              <table className="keyframe-table">
                <thead>
                  <tr>
                    <th>时间</th>
                    <th>值</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {keyframes[property].map((kf, index) => (
                    <tr key={index}>
                      <td>{kf.time.toFixed(2)}s</td>
                      <td>
                        <input
                          type="number"
                          value={kf.value}
                          onChange={(e) => updateKeyframeValue(property, kf.time, e.target.value)}
                          step={property === 'opacity' ? 0.1 : 1}
                        />
                      </td>
                      <td>
                        <button onClick={() => deleteKeyframe(property, kf.time)}>
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 获取属性的显示名称
const getPropertyLabel = (property) => {
  const labels = {
    x: '位置 X',
    y: '位置 Y',
    width: '宽度',
    height: '高度',
    opacity: '不透明度'
  };
  
  return labels[property] || property;
};

export default KeyframeEditor;