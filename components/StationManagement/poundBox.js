import { useEffect, useState } from 'react';
import { Select, message } from 'antd';
import { station } from '@api';
import styles from './index.less';
// 用于局域网请求
import axios from 'axios';

const Status = [<span className={styles.disconnected}>未连接</span>, <span className={styles.connected}>已连接</span>];

const Index = props => {
  useEffect(() => {
    poundMachine_list();
  }, []);
  const { id, onReady, onChange, style, showWeight } = props;
  const [loading, setLoading] = useState(false);
  const [weight, setWeight] = useState(0);
  /**
   * 盒子连接状态
   * 未连接：0
   * 已连接：1
   */
  const [status, setStatus] = useState(0);
  const [poundMachineList, setPoundMachineList] = useState([]);

  // 更换磅机
  const handleChangePound = id => {
    const poundData = poundMachineList.find(item => item.id === id);
    onChange && onChange(poundData);
    getLocalNet(poundData.url);
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
  const getLocalNet = async url => {
    setLoading(true);
    const res = await axios.get(url).then(res => res.data);
    const _url = res.match(/URL=([\s\S]*?)"/)[1];

    try {
      const isConnect = await axios.get(_url).then(res => res.data);
      setLoading(false);

      // 模拟连接成功
      setStatus(1);
    } catch (e) {
      message.error('连接异常');
      setLoading(false);

      setStatus(1);
    }
  };

  useEffect(() => {
    const time = setInterval(() => {
      if (status === 1) {
        const _weight = (Math.random() * 40).toFixed(2);
        setWeight(_weight);

        onChange(_weight);
      }
    }, 3000);

    return () => {
      clearInterval(time);
    };
  }, [status]);

  return (
    <div className={styles['pound-box']} style={style}>
      <Select
        style={{ width: 220 }}
        placeholder="请选择磅机"
        onChange={handleChangePound}
        loading={loading}
        disabled={loading}>
        {poundMachineList.map(item => (
          <Select.Option key={item.id} value={item.id}>
            {item.remark}
          </Select.Option>
        ))}
      </Select>
      {!showWeight && (
        <div style={{ display: 'inline-block' }}>
          <div className={styles.status}>{loading ? <span>连接中...</span> : <span>{Status[status]}</span>}</div>
          <span className={styles.weight}>{weight || 0}吨</span>
        </div>
      )}
    </div>
  );
};

export default Index;
