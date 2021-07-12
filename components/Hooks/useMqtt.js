import { useState, useEffect, useCallback } from 'react';

import CryptoJS from 'crypto-js';
import mqtt from 'mqtt';
// import { common, mqtt } from "@/utils";

// import mqtt from '../../static/temp/mqtt.min.js';
// const mqtt = require('../../static/temp/mqtt.min.js');
const config = {
  serverUri: 'wss://mqtt-cn-oew1v488w0d.mqtt.aliyuncs.com',
  serverUriPro: 'wss://mqtt-cn-oew1v488w0d.mqtt.aliyuncs.com', //生产环境https 测试是ws  正式是wss
  instanceId: 'mqtt-cn-oew1v488w0d',
  accessKey: 'LTAI4G1BBMx6Z8WkZQisLusH',
  secretKey: 'b5JTFcgm4aSo2c0ZQ0U3hApDePyWdH',
  // child_topic: 'noman_equipment/driver/1990',
  // parent_topic: 'testSaas',
};

const useMqtt = () => {
  // 客户端实例
  const [client, setClient] = useState();
  const [connectionStatus, setConnectionStatus] = useState(false);
  useEffect(() => {
    // init();
  }, []);

  const init = async () => {
    // console.log(client);
    console.log('==========mqtt初始化==========');
    const { userId } = localStorage;
    const username = 'Signature|' + config.accessKey + '|' + config.instanceId;
    const clientId = `GID_pound@@@${userId}${+new Date()}`;
    const password = CryptoJS.HmacSHA1(clientId, config.secretKey).toString(CryptoJS.enc.Base64);

    const options = {
      username: username,
      password: password,
      clientId: clientId,
      keepalive: 90,
      connectTimeout: 3000,
    };

    const serverUri = window.location.protocol === 'https:' ? config.serverUriPro : config.serverUri;
    const _client = mqtt.connect(serverUri, options);

    // 连接成功
    _client.on('connect', () => {
      setConnectionStatus(true);
      console.log('连接成功');
    });

    _client.on('disconnect', () => {
      setConnectionStatus(false);
      console.log('断开连接');
    });

    _client.on('reconnect', () => {
      setConnectionStatus(false);
      console.log('重新连接');
      // _client.end();
      // setTimeout(() => {
      //   init();
      // },10);
      // _client.end();
      // setClient(null);
      // setTimeout(() => {
      //   init();
      // }, 10);
    });

    _client.on('error', e => {
      console.log('错误', e);
    });

    _client.on('disconnect', e => {
      console.log('disconnect', e);
    });

    _client.on('offline', e => {
      console.log('offline', e);
      // _client.end();
      // setClient(null);
      // setTimeout(() => {
      //   init();
      // }, 10);
    });

    // 监听连接关闭事件（小程序不支持）
    _client.on('end', function () {
      console.log('客户端主动关闭连接！');
    });

    // 监听断开连接事件（小程序不支持）
    _client.on('close', function () {
      console.log('close连接断开了！');
    });

    setClient(_client);

    return new Promise((resolve, reject) => {
      resolve(_client);
    });
  };

  return {
    client,
    connectionStatus,
    init,
  };
};

// useMqtt = createModel(useMqtt);
export default useMqtt;
