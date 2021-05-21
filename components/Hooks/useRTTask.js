import { useEffect, useRef } from 'react';

/**
 * 获取实时数据的hooks
 * @param {Object} option 对象参数
 * @param {String} option.mode 模式 (request 轮询请求，mqtt 长连接推送)
 * @param {Promise} option.api 匹配接口
 * @param {String} option.sub 订阅接口
 * @param {Number} option.interval 轮询间隔(毫秒 default 1000)
 * @param {myCallback} option.onChange 回调函数
 */
const useRTTask = ({ mode = 'request', interval = 2000 } = {}) => {
  const timeoutRef = useRef(null);

  useEffect(() => {
    return destory;
  }, []);

  // 轮询请求
  const _request = async ({ api, callback }) => {
    const res = await api();
    callback(res);
    timeoutRef.current = setTimeout(() => _request({ api, callback }), interval);
  };

  // 注销
  const destory = () => {
    clearTimeout(timeoutRef.current);
  };

  // 启动轮询
  const start = ({ api, callback }) => {
    if (mode === 'request') {
      _request({ api, callback });
    } else {
      console.log(`轮询失败，当前模式为${mode}`);
    }
  };

  // 开始订阅
  const subscribe = () => {};

  return { start, subscribe, destory };
};

export default useRTTask;
