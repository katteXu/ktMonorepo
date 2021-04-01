import { useEffect, useRef, useState } from 'react';

/**
 * 获取实时数据的hooks
 * @param {Object} option 对象参数
 * @param {String} option.mode 模式 (request 轮询请求，mqtt 长连接推送)
 * @param {Number} option.interval 轮询间隔(毫秒 default 1000)
 */
const useRTTask = ({ mode = 'request', interval = 2000 } = {}) => {
  const timeoutRef = useRef(null);
  const topicUnsubscribeRef = useRef(null);
  useEffect(() => {
    return destory;
  }, []);

  // 轮询请求
  const _request = async ({ api, callback }) => {
    const res = await api();
    callback && callback(res);
    timeoutRef.current = setTimeout(() => _request({ api, callback }), interval);
  };

  // 注销
  const destory = () => {
    // 取消轮询
    clearTimeout(timeoutRef.current);
    // 取消订阅
    topicUnsubscribeRef.current && topicUnsubscribeRef.current();
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
  // const subscribe = ({ topic, callback }) => {
  //   if (mode === 'mqtt') {
  //     const client = window.mqttClient;
  //     // 监听信息
  //     const _handleMessage = (_topic, msg) => {
  //       callback && callback(msg.toString());
  //     };
  //     client.on('message', _handleMessage);

  //     // 订阅主题
  //     client.subscribe(topic, { qos: 0 }, () => {
  //       console.warn('subscribe success');
  //       topicUnsubscribeRef.current = () => {
  //         client.unsubscribe(topic, { qos: 0 });
  //         client.off('message', _handleMessage);
  //       };
  //     });
  //   } else {
  //     console.log(`订阅失败，当前模式为${mode}`);
  //   }
  // };

  return { start, destory };
};

export default useRTTask;
