import { useState, useCallback, useEffect } from 'react';
import styles from './index.less';

const Index = ({ allWeught }) => {
  const [info, setInfo] = useState({});
  useEffect(() => {
    setInfo(allWeught);
  }, [allWeught]);
  return (
    <div className={styles.abnormal}>
      {allWeught && allWeught.totalWeight && (
        <div className={styles.abnormalRow}>
          <span>毛重</span>
          <span className={styles.abnormalInfo}>{info.totalWeight}吨</span>
        </div>
      )}
      {allWeught && allWeught.carWeight && (
        <div className={styles.abnormalRow}>
          <span>皮重</span>
          <span className={styles.abnormalInfo}>{info.carWeight}吨</span>
        </div>
      )}
      {allWeught && allWeught.goodsWeight && (
        <div className={styles.abnormalRow}>
          <span>净重</span>
          <span className={styles.abnormalInfo}>{info.goodsWeight}吨</span>
        </div>
      )}
    </div>
  );
};

export default Index;
