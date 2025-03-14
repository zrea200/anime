/**
 * 将时间转换为x坐标
 * 
 * @param {number} time - 时间（秒）
 * @param {number} totalDuration - 总时长（秒）
 * @param {number} timelineWidth - 时间轴宽度
 * @param {number} padding - 时间轴内边距
 * @returns {number} x坐标
 */
export const timeToX = (time, totalDuration, timelineWidth, padding) => {
  return padding + (time / totalDuration) * (timelineWidth - padding * 2);
};

/**
 * 将x坐标转换为时间
 * 
 * @param {number} x - x坐标
 * @param {number} totalDuration - 总时长（秒）
 * @param {number} timelineWidth - 时间轴宽度
 * @param {number} padding - 时间轴内边距
 * @returns {number} 时间（秒）
 */
export const xToTime = (x, totalDuration, timelineWidth, padding) => {
  const time = ((x - padding) / (timelineWidth - padding * 2)) * totalDuration;
  return Math.max(0, Math.min(totalDuration, time));
};

/**
 * 格式化时间为 MM:SS 或 MM:SS.ms
 * 
 * @param {number} seconds - 时间（秒）
 * @param {number} timeScale - 时间轴缩放级别
 * @returns {string} 格式化后的时间
 */
export const formatTime = (seconds, timeScale) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  
  if (timeScale >= 2) {
    // 高缩放级别时显示毫秒
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  } else {
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
};

/**
 * 根据当前时间和关键帧计算属性值
 * @param {Array} keyframes 关键帧数组
 * @param {number} currentTime 当前时间
 * @param {*} defaultValue 默认值
 * @returns {*} 计算后的属性值
 */
export const interpolateValue = (keyframes, currentTime, defaultValue) => {
  if (!keyframes || keyframes.length === 0) {
    return defaultValue;
  }
  
  // 如果当前时间小于第一个关键帧时间，返回第一个关键帧的值
  if (currentTime <= keyframes[0].time) {
    return keyframes[0].value;
  }
  
  // 如果当前时间大于最后一个关键帧时间，返回最后一个关键帧的值
  if (currentTime >= keyframes[keyframes.length - 1].time) {
    return keyframes[keyframes.length - 1].value;
  }
  
  // 找到当前时间所在的两个关键帧
  let startFrame = keyframes[0];
  let endFrame = keyframes[1];
  
  for (let i = 1; i < keyframes.length; i++) {
    if (currentTime <= keyframes[i].time) {
      startFrame = keyframes[i - 1];
      endFrame = keyframes[i];
      break;
    }
  }
  
  // 计算两个关键帧之间的插值
  const timeDiff = endFrame.time - startFrame.time;
  const progress = (currentTime - startFrame.time) / timeDiff;
  
  // 贝塞尔曲线插值（这里使用简单的三次贝塞尔曲线）
  // 可以根据需要调整控制点来改变曲线形状
  return bezierInterpolation(startFrame.value, endFrame.value, progress);
};

/**
 * 贝塞尔曲线插值
 * @param {number} startValue 起始值
 * @param {number} endValue 结束值
 * @param {number} t 进度 (0-1)
 * @returns {number} 插值结果
 */
const bezierInterpolation = (startValue, endValue, t) => {
  // 这里使用一个简单的缓动函数，可以根据需要调整
  // 淡出效果的贝塞尔曲线
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
  
  // 应用缓动函数
  const easedT = easeOutCubic(t);
  
  // 线性插值
  return startValue + (endValue - startValue) * easedT;
};
