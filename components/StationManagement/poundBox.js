import { useEffect, useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { Select, message } from 'antd';
import { station } from '@api';
import styles from './index.less';
// 用于局域网请求
import axios from 'axios';

const Status = [<span className={styles.disconnected}>未连接</span>, <span className={styles.connected}>已连接</span>];

const Index = (props, ref) => {
  const { id, onReady, onChange, style, showWeight, boxId } = props;
  const [loading, setLoading] = useState(false);
  const [weight, setWeight] = useState(0);
  /**
   * 盒子连接状态
   * 未连接：0
   * 已连接：1
   */
  const [status, setStatus] = useState(0);
  const timeoutRef = useRef();

  const [poundMachineList, setPoundMachineList] = useState([]);
  // 盒子地址
  const [boxUrl, setBoxUrl] = useState();
  //盒子
  const [mac, setMac] = useState();
  const [poundId, setPoundId] = useState();
  useEffect(() => {
    poundMachine_list();
  }, []);
  // 更换磅机
  const handleChangePound = id => {
    setLoading(true);
    setWeight(0);
    setStatus(0);
    const poundData = poundMachineList.find((item, index) => item.id === id);
    onChange && onChange(poundData);

    setPoundId(id);
    sessionStorage.setItem('isConnect', JSON.stringify(poundData));

    getLocalNet(poundData.deviceId);
  };

  //获取磅机列表
  const poundMachine_list = async () => {
    const res = await station.pound_machine_list();
    if (res.status === 0) {
      setPoundMachineList(res.result);
    } else {
      message.error(`${res.detail || res.description}`);
    }
  };

  // 获取本地盒子地址
  const getLocalNet = async deviceId => {
    setLoading(true);
    const params = {
      mac: deviceId,
    };
    const res = await station.returnIp({ params });
    if (res.status === 0) {
      const url = `http://${res.result}:5000/`;

      // const resPound = await axios.get(url).then(res => res.data);
      // console.log('======>', resPound);
      // console.log('======>', url);
      axios.defaults.timeout = 5000;
      try {
        // const _url = resPound.match(/URL=([\s\S]*?)"/)[1];
        // const isConnect = await axios.get(_url).then(res => res.data);
        const resPound = await axios.get(url).then(res => res.data);
        setLoading(false);

        // 模拟连接成功
        setBoxUrl(url);
        setMac(deviceId);
        setStatus(1);
      } catch (e) {
        message.error('连接异常');
        setLoading(false);
        setStatus(0);
        setWeight(0);
      }
    } else {
      message.error(`${res.detail || res.description}`);
    }
  };

  useEffect(() => {
    if (status === 1) {
      getWeight();
    }

    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, [status]);

  // 获取重量
  const getWeight = async () => {
    console.log(boxUrl);
    const res = await axios.get(`${boxUrl}weight`).then(res => res.data);
    setWeight(res.weight);
    onChange(res.weight);
    timeoutRef.current = setTimeout(async () => {
      getWeight();
    }, 1000);
  };

  useImperativeHandle(ref, () => ({
    initpdf: async data => {
      if (status === 1) {
        const params = {
          ...data,
          mac,
        };

        const res = await station.generate_pdf({ params });
        return res;
      }
    },
    print: async params => {
      const res = axios.post(`${boxUrl}print_pdf`, params).then(res => res.data);
      return res;
    },
    parallelPortPrint: async params => {
      const res = axios.post(`${boxUrl}parallelPortPrint`, params).then(res => res.data);
      return res;
    },
  }));
  useEffect(() => {
    if (props.boxId) {
      handleChangePound(props.boxId);
    }
  }, [poundMachineList]);

  return (
    <div className={styles['pound-box']} style={style}>
      <Select
        style={{ width: 220 }}
        placeholder="请选择磅机"
        onChange={handleChangePound}
        loading={loading}
        value={poundId}
        disabled={loading}>
        {poundMachineList.map(item => (
          <Select.Option key={item.id} value={item.id}>
            {item.remark}
          </Select.Option>
        ))}
      </Select>
      <div style={{ display: 'inline-block' }}>
        <div className={styles.status}>{loading ? <span>连接中...</span> : <span>{Status[status]}</span>}</div>
        {!showWeight && <span className={styles.weight}>{weight || 0}吨</span>}
      </div>
    </div>
  );
};

export default forwardRef(Index);
