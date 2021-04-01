import { useState, useEffect, useCallback } from 'react';
import { Button, Select } from 'antd';
import styles from './styles.less';
const InvoiceType = ({ onChange, editEnable = true, payType = 'PRICE' }) => {
  const PayStatus = {
    PRICE: '按专线结算方式',
    FROM: '按原发',
    ARRIVAL: '按实收',
  };

  useEffect(() => {
    setType(payType);
    setTempType(payType);
  }, [payType]);

  const [type, setType] = useState(payType);
  const [tempType, setTempType] = useState(payType);
  const [mode, setMode] = useState('view');
  const [isSubmit, setIsSubmit] = useState(0);
  const setEdit = () => {
    setMode('edit');
  };

  const cancel = () => {
    setMode('view');
    setType(tempType);
  };

  const submit = () => {
    setMode('view');
    setType(type);
    setTempType(type);
    setIsSubmit(isSubmit + 1);
    onChange && onChange(type);
  };
  return (
    <div className={styles['invoice-type']}>
      <div className={styles.label}>开票吨数：</div>
      {mode === 'view' && (
        <div className={styles.item}>
          <span>{PayStatus[type]}</span>
          {editEnable && (
            <Button type="link" style={{ fontSize: 16, marginLeft: 12 }} onClick={setEdit}>
              修改
            </Button>
          )}
        </div>
      )}
      {mode === 'edit' && (
        <div className={styles.item}>
          <Select defaultValue={type} value={type} onChange={value => setType(value)} style={{ width: 150 }}>
            {Object.entries(PayStatus).map(v => (
              <Select.Option key={v[0]} value={v[0]}>
                {v[1]}
              </Select.Option>
            ))}
          </Select>
          <Button style={{ marginLeft: 12 }} type="primary" onClick={submit}>
            确定
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={cancel}>
            取消
          </Button>
        </div>
      )}
    </div>
  );
};

export default InvoiceType;
