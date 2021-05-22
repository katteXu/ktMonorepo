import { useEffect } from 'react';
import styles from './equipmentManagement.less';
import { Format } from '@utils/common';

const Index = props => {
  const { data } = props;

  useEffect(() => {}, []);
  return (
    <>
      <div className={styles.row}>
        <div className={styles.col}>
          <div className={styles.label}>运行状态：</div>
          <div className={styles.text} style={{ color: '#66BD7E' }}>
            {/* 运行中 */}
            {data.runStatusZn}
          </div>
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
