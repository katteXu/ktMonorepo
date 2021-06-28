import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { ChildTitle } from '@components';
import { station } from '@api';
import { Input, Modal, Tooltip, message } from 'antd';
import { QuestionCircleFilled } from '@ant-design/icons';
import styles from './index.less';
import ManualForm from './manualForm';
import { Format } from '@utils/common';
const Index = (
  {
    onSubmit,
    onWeightAll,
    receiveWeight,
    getFromGoodsWeightFunc,
    receiveCarWeight,
    outStationByToVisible,
    lossChangeWeight,
    currentPrimaryGoodsWeight,
  },
  ref
) => {
  const [fromTotalWeight, setFromTotalWeight] = useState(0);
  const [fromGoodsWeight, setFromGoodsWeight] = useState(0);
  const [fromCarWeight, setFromCarWeight] = useState('');
  const [fromLossWeight, setFromLossWeight] = useState(0);
  const onChangeFromTotalWeight = e => {
    const { value } = e.target;
    let val;
    val = value.replace(/^(-)*(\d+)\.(\d{1,2}).*$/, '$1$2.$3');
    if (val > 100) {
      return;
    }
    setFromTotalWeight(val);
    if (val && Number(val) > Number(fromCarWeight)) {
      const goodsWeight = (val - fromCarWeight).toFixed(2);

      setFromGoodsWeight(goodsWeight);
      if (goodsWeight && currentPrimaryGoodsWeight)
        setFromLossWeight(Format.weight(currentPrimaryGoodsWeight) - goodsWeight);
    } else setFromGoodsWeight(0);
  };

  const onChangeFromGoodsWeight = e => {
    const { value } = e.target;
    let val;
    val = value.replace(/^(-)*(\d+)\.(\d{1,2}).*$/, '$1$2.$3');
    if (val > 100) {
      return;
    }
    setFromGoodsWeight(val);
  };

  const onChangeFromCarWeight = e => {
    const { value } = e.target;
    let val;
    val = value.replace(/^(-)*(\d+)\.(\d{1,2}).*$/, '$1$2.$3');
    if (val > 100) {
      return;
    }
    setFromCarWeight(val);
    const goodsWeight = (fromTotalWeight - val).toFixed(2);
    if (val && Number(fromTotalWeight) > Number(val)) {
      setFromGoodsWeight(goodsWeight);

      if (goodsWeight && currentPrimaryGoodsWeight)
        setFromLossWeight(Format.weight(currentPrimaryGoodsWeight) - goodsWeight);
    } else setFromGoodsWeight(0);
  };
  useImperativeHandle(ref, () => ({
    // 获取详情数据
    refreshCarWeight: () => {
      setFromCarWeight(0);
    },
  }));
  useEffect(() => {
    if (receiveWeight) {
      setFromTotalWeight(receiveWeight.weight ? Format.weight(receiveWeight.weight) : '');
      if (fromGoodsWeight && receiveWeight.fromGoodsWeight)
        setFromLossWeight((Format.weight(receiveWeight.fromGoodsWeight) - fromGoodsWeight).toFixed(2));
    }
  }, [receiveWeight]);
  useEffect(() => {
    setFromCarWeight(receiveCarWeight);
    if (fromTotalWeight && fromTotalWeight > receiveCarWeight)
      setFromGoodsWeight((fromTotalWeight - receiveCarWeight).toFixed(2));
    else setFromGoodsWeight(0);
  }, [receiveCarWeight]);
  useEffect(() => {
    onWeightAll(fromTotalWeight * 1000, fromGoodsWeight * 1000, fromCarWeight * 1000);
    if (fromGoodsWeight && receiveWeight.fromGoodsWeight) {
      setFromLossWeight((Format.weight(receiveWeight.fromGoodsWeight) - fromGoodsWeight).toFixed(2));
    }
  }, [fromTotalWeight, fromGoodsWeight, fromCarWeight]);
  useEffect(() => {
    setFromLossWeight(lossChangeWeight);
  }, [lossChangeWeight]);
  return (
    <div className={styles.weight}>
      <ChildTitle style={{ margin: '24px 0 16px', fontWeight: 'bold' }}>实收重量</ChildTitle>
      {outStationByToVisible && (
        <span onClick={getFromGoodsWeightFunc} className={styles.take}>
           取皮重
        </span>
      )}

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
          value={fromCarWeight}
          onChange={e => onChangeFromCarWeight(e)}
        />
      </div>
      <div className={styles.row}>
        <span className={styles.lableText}>净重:</span>
        <Input
          disabled={outStationByToVisible}
          addonAfter="吨"
          type="number"
          style={{ width: 264 }}
          value={fromGoodsWeight ? fromGoodsWeight : ''}
          onChange={e => onChangeFromGoodsWeight(e)}
        />
      </div>
      <div className={styles.row}>
        <span className={styles.lableText}>路损:</span>
        <Input
          disabled
          addonAfter="吨"
          type="number"
          style={{ width: 264 }}
          value={fromLossWeight ? fromLossWeight : ''}
        />
      </div>
    </div>
  );
};

export default forwardRef(Index);
