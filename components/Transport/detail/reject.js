import React from 'react';
import styles from './styles.less';
const RejectReason = props => {
  const { reject_reason } = props.dataInfo;

  return (
    <div className={styles.floor}>
      <div className={styles.title}>驳回原因</div>
      <div className={styles['reject-reason']}>{reject_reason}</div>
    </div>
  );
};
export default RejectReason;
