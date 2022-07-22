import { useState, useEffect } from 'react';
import styles from './equipmentManagement.less';
import { Modal } from 'antd';
import { useRTTask } from '@components/Hooks';

const Index = props => {
  const [stop, setStop] = useState(false);
  const { start, destory } = useRTTask({ interval: 2000 });
  const onclickStop = () => {
    Modal.confirm({
      // icon: <QuestionCircleFilled />,
      title: '确认停止运行吗？',
      onOk: async () => {
        setStop(true);
      },
      okText: '确认',
      cancelText: '取消',
    });
  };

  const onclickOpen = () => {
    Modal.confirm({
      // icon: <QuestionCircleFilled />,
      title: '确认运行吗？',
      onOk: async () => {
        setStop(false);
      },
      okText: '确认',
      cancelText: '取消',
    });
  };

  const getDetail = async () => {
    const params = {};
    // const res = await
    // if(res.Status===0){}
  };

  useEffect(() => {
    // getData()
    start({
      api: () => {
        return getDetail(1231);
      },
      callback: res => {
        console.log(res);
      },
    });
    return destory();
  }, []);
  return (
    <>
      <div className={styles.row}>
        <div className={styles.col}>
          <div className={styles.label}>运行状态：</div>
          <div className={styles.text} style={{ color: '#66BD7E' }}>
            {/* 运行中 */}
            {!stop ? '运行中' : '已停止'}
          </div>
          <div
            // className={styles.fontcolorblue}
            style={{ marginLeft: 12, color: !stop ? '#E44040' : '#477AEF' }}
            onClick={() => {
              !stop ? onclickStop() : onclickOpen();
            }}>
            {!stop ? '停止' : '开始'}
          </div>
        </div>
        <div className={styles.col}>
          <span className={styles.label}>连接状态：</span>
          <span className={styles.text}>正常</span>
        </div>
        <div className={styles.col}>
          <span className={styles.label}>本次运输总量：</span>
          <span className={styles.text}>123123123</span>
          <span className={styles.unitName}>吨</span>
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.col}>
          <span className={styles.label}>当前运转速度：</span>
          <span className={styles.text}>3</span>
          <span className={styles.unitName}>m/s</span>
        </div>
        <div className={styles.col}>
          <span className={styles.label}>当前运输货品：</span>
          <span className={styles.text}>海能原煤</span>
        </div>
        <div className={styles.col}></div>
      </div>
    </>
  );
};

export default Index;
