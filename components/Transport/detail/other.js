import React from 'react';
import styles from './styles.less';
const Other = props => {
  const { createdAt, eachStatus, orderNo } = props.dataInfo;

  return (
    <div className={styles.floor}>
      <div className={styles.title}>其他信息</div>
      <div className={styles.row}>
        <div className={styles.label}>承运时间：</div>
        <div className={styles.data}>{createdAt || '-'}</div>
      </div>
      <div className={styles.row}>
        <div className={styles.label}>装货时间：</div>
        <div className={styles.data}>{(eachStatus && eachStatus[1].fullTime) || '-'}</div>
      </div>
      <div className={styles.row}>
        <div className={styles.label}>卸货时间：</div>
        <div className={styles.data}>{(eachStatus && eachStatus[2].fullTime) || '-'}</div>
      </div>
      <div className={styles.row}>
        <div className={styles.label}>结算时间：</div>
        {eachStatus[4].fullTime || '-'}
      </div>
      <div className={styles.row}>
        <div className={styles.label}>运单编号：</div>
        <div className={styles.data}>{orderNo || '-'}</div>
      </div>
    </div>
  );
};

export default Other;
