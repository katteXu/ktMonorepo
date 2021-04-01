import { useState, useEffect } from 'react';
import styles from './equipmentManagement.less';
import { Modal } from 'antd';
import { QuestionCircleFilled } from '@ant-design/icons';
import { useRTTask } from '@components/Hooks';
import { Format } from '@utils/common';

const Index = props => {
  const { data } = props;
  const [stop, setStop] = useState(false);
  const { start, destory } = useRTTask({ interval: 2000 });
  const [total, setTotal] = useState([0, 0]);
  const onclickStop = () => {
    Modal.confirm({
      icon: <QuestionCircleFilled />,
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
      icon: <QuestionCircleFilled />,
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
    // start({
    //   api: () => {
    //     return getDetail(1231);
    //   },
    //   callback: res => {
    //     console.log(res);
    //   },
    // });
    // return destory();
  }, []);
  return (
    <>
      <div className={styles.row}>
        <div className={styles.col}>
          <div className={styles.label}>运行状态：</div>
          <div className={styles.text} style={{ color: '#66BD7E' }}>
            {/* 运行中 */}
            {data.runStatusZn}
          </div>
          {/* <div
            // className={styles.fontcolorblue}
            style={{ marginLeft: 12, color: data.runStatus ? '#E44040' : '#3D86EF', cursor: 'pointer' }}
            onClick={() => {
              data.runStatus ? onclickStop() : onclickOpen();
            }}>
            {data.runStatus ? '开始' : '停止'}
          </div> */}
        </div>
        <div className={styles.col}>
          <span className={styles.label}>连接状态：</span>
          <span className={styles.text}>{data.connectionStatusZn || '-'}</span>
        </div>
        <div className={styles.col}></div>
      </div>
      <div className={styles.row}>
        <div className={styles.col}>
          <span className={styles.label}>昨日发货总量：</span>
          <span className={styles.text}>{Format.weight(data.dataOut) || '-'}</span>
        </div>
        <div className={styles.col}>
          <span className={styles.label}>昨日收货总量：</span>
          <span className={styles.text}>{Format.weight(data.dataIn) || '-'}</span>
        </div>
        <div className={styles.col}></div>
      </div>
    </>
  );
};

export default Index;
