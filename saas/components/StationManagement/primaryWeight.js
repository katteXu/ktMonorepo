import { useState, useEffect } from 'react';
import { ChildTitle } from '@components';
import { station } from '@api';
import { Input, Modal, Tooltip, message } from 'antd';
import { QuestionCircleFilled } from '@ant-design/icons';
import styles from './index.less';
import ManualForm from './manualForm';
import { Format } from '@utils/common';
const Index = ({ onSubmit, onWeightAll, weightData, handleChangeReceiveLoss }) => {
  const [fromTotalWeight, setFromTotalWeight] = useState(0);
  const [fromGoodsWeight, setFromGoodsWeight] = useState(0);
  const [fromCarWeight, setFromCarWeight] = useState(0);

  const onChangeFromTotalWeight = e => {
    const { value } = e.target;
    let val;
    val = value.replace(/^(-)*(\d+)\.(\d{1,2}).*$/, '$1$2.$3');
    if (val > 100) {
      return;
    }
    setFromTotalWeight(val);
  };

  const onChangeFromGoodsWeight = e => {
    const { value } = e.target;
    let val;
    val = value.replace(/^(-)*(\d+)\.(\d{1,2}).*$/, '$1$2.$3');
    if (val > 100) {
      return;
    }
    setFromGoodsWeight(val);
    handleChangeReceiveLoss && handleChangeReceiveLoss(val);
  };

  const onChangeFromCarWeight = e => {
    const { value } = e.target;
    let val;
    val = value.replace(/^(-)*(\d+)\.(\d{1,2}).*$/, '$1$2.$3');
    if (val > 100) {
      return;
    }
    setFromCarWeight(val);
  };

  useEffect(() => {
    if (fromTotalWeight && fromCarWeight) {
      const car = fromTotalWeight - fromCarWeight;
      setFromGoodsWeight(car > 0 ? car.toFixed(2) : '');
    }
  }, [fromTotalWeight, fromCarWeight]);

  useEffect(() => {
    onWeightAll(fromTotalWeight * 1000, fromGoodsWeight * 1000, fromCarWeight * 1000);
  }, [fromTotalWeight, fromGoodsWeight, fromCarWeight]);
  useEffect(() => {
    if (weightData) {
      setFromTotalWeight(weightData.fromTotalWeight ? Format.weight(weightData.fromTotalWeight) : '');
      setFromGoodsWeight(weightData.fromGoodsWeight ? Format.weight(weightData.fromGoodsWeight) : '');
      setFromCarWeight(weightData.fromCarWeight ? Format.weight(weightData.fromCarWeight) : '');
    }
  }, [weightData]);
  return (
    <div className={styles.weight}>
      <ChildTitle style={{ margin: '24px 0 16px', fontWeight: 'bold' }}>原发重量</ChildTitle>
      <div className={styles.row}>
        <span className={styles.lableText}>毛重:</span>
        <Input
          placeholder="请输入毛重"
          addonAfter="吨"
          type="number"
          style={{ width: 264 }}
          value={fromTotalWeight ? fromTotalWeight : ''}
          onChange={e => onChangeFromTotalWeight(e)}
        />
      </div>
      <div className={styles.row}>
        <span className={styles.lableText}>皮重:</span>
        <Input
          placeholder="请输入皮重"
          addonAfter="吨"
          type="number"
          style={{ width: 264 }}
          value={fromCarWeight ? fromCarWeight : ''}
          onChange={e => onChangeFromCarWeight(e)}
        />
      </div>
      <div className={styles.row}>
        <span className={styles.lableText}>净重:</span>
        <Input
          placeholder="请输入净重"
          addonAfter="吨"
          type="number"
          style={{ width: 264 }}
          value={fromGoodsWeight ? fromGoodsWeight : ''}
          onChange={e => onChangeFromGoodsWeight(e)}
        />
      </div>
    </div>
  );
};

export default Index;
