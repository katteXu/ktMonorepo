import styles from './equipmentManagement.less';
import { useEffect, useState } from 'react';
import { QuestionCircleFilled } from '@ant-design/icons';
import { product } from '@api';

const Index = data => {
  const [dataInfo, setDataInfo] = useState({});
  const onclickStop = () => {
    Modal.confirm({
      icon: <QuestionCircleFilled />,
      title: '确认停止运行吗？',
      onOk: async () => {
        const params = {
          did,
          status: 1,
        };
        const res = await product.operateDeviceRunOrStop({ params });
        if (res.status === 0) {
          refreshData();
        } else {
          message.error(res.detail || res.description);
        }
      },
      okText: '确认',
      cancelText: '取消',
    });
  };

  const onclickOpen = () => {
    Modal.confirm({
      icon: <QuestionCircleFilled />,
      title: '确认运行吗？',
      onOk: async () => {
        const params = {
          did,
          status: 0,
        };
        const res = await product.operateDeviceRunOrStop({ params });
        if (res.status === 0) {
          refreshData();
        } else {
          message.error(res.detail || res.description);
        }
      },
      okText: '确认',
      cancelText: '取消',
    });
  };

  useEffect(() => {
    setDataInfo(data);
  }, [data]);
  return (
    <>
      <div className={styles.row}>
        <div className={styles.col}>
          <span className={styles.label}>运行状态：</span>
          <span className={styles.text} style={{ color: '#66BD7E' }}>
            {dataInfo.runStatusZn}
          </span>
          <span
            className={styles.mainColor}
            style={{ marginLeft: 12 }}
            onClick={() => {
              true ? onclickStop() : onclickOpen();
            }}>
            {true ? '停止' : '开始'}
          </span>
        </div>
        <div className={styles.col}>
          <span className={styles.label}>连接状态：</span>
          <span className={styles.text}>{dataInfo.connectionStatusZn}</span>
        </div>
        <div className={styles.col}>
          <span className={styles.label}>当前旋流口直径:</span>
          <span className={styles.text}>1.6cm</span>
        </div>
      </div>
    </>
  );
};

export default Index;
