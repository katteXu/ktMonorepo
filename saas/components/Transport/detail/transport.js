import React from 'react';
import styles from './styles.less';
import { Format } from '@utils/common';
const Transport = props => {
  const { unitName, goodsWeight, arrivalGoodsWeight, loss } = props.dataInfo;

  return (
    <div className={styles.floor}>
      <div className={styles.title}>运输信息</div>
      <div className={styles.row}>
        <div className={styles.label}>发货净重：</div>
        <div className={styles.data}>{goodsWeight ? `${Format.weight(goodsWeight)} ${unitName || '吨'}` : '-'}</div>
      </div>
      <div className={styles.row}>
        <div className={styles.label}>收货净重：</div>
        <div className={styles.data}>
          {arrivalGoodsWeight ? `${Format.weight(arrivalGoodsWeight)} ${unitName || '吨'}` : '-'}
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.label}>路损：</div>
        <div className={styles.data}>{arrivalGoodsWeight ? `${Format.weight(loss)} ${unitName || '吨'}` : '-'}</div>
      </div>
    </div>
  );
};

export default Transport;
