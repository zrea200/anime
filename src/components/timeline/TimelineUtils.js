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
