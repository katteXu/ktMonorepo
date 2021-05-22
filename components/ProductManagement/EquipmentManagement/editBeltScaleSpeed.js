import styles from './editBeltScaleSpeed.less';
import { Input, Button, message } from 'antd';
import { useState } from 'react';
import { product } from '@api';
const Index = ({ onClose, onSubmit, speed, did }) => {
  const [conveyorSpeed, setConveyorSpeed] = useState(speed);
  const [errorMessage, setErrorMessag] = useState(false);

  const submitData = async () => {
    if (conveyorSpeed === '') {
      setErrorMessag(true);
      return;
    }
    const params = {
      did,
      speed: conveyorSpeed * 10,
    };
    const res = await product.updateBeltSpeed({ params });
    if (res.status === 0) {
      onSubmit();
    } else {
      message.error(res.detail || res.description);
    }
  };

  const handleKeyPress = event => {
    if ([189, 187, 69].includes(event.keyCode)) {
      event.preventDefault();
    }
  };
  return (
    <>
      <div className={styles.root}>
        <span>皮带速度</span>
        <span
          onClick={() => {
            if (conveyorSpeed <= 1) {
              setConveyorSpeed(1);
            } else {
              setConveyorSpeed((conveyorSpeed - 0.1).toFixed(1));
            }
          }}
          className={styles.reduction}>
          -
        </span>
        <Input
          type="number"
          onKeyDown={handleKeyPress}
          value={conveyorSpeed}
          onChange={e => {
            let value = e.target.value;
            if (value <= 1) {
              setErrorMessag(true);
              setConveyorSpeed(value.replace(/^(\-)*(\d+)\.(\d).*$/, '$1$2.$3'));
              return;
            }
            if (e.target.value >= 6) {
              setConveyorSpeed(6);
              setErrorMessag(false);
              return;
            }
            setErrorMessag(false);
            setConveyorSpeed(value.replace(/^(\-)*(\d+)\.(\d).*$/, '$1$2.$3'));
          }}
          style={{ display: 'inline-block', width: 56, marginRight: 4, textAlign: 'center' }}
        />
        m/s
        <span
          onClick={() => {
            if (conveyorSpeed >= 6) {
              setConveyorSpeed(6);
            } else {
              setConveyorSpeed((conveyorSpeed * 1 + 0.1).toFixed(1));
            }
          }}
          className={styles.add}>
          +
        </span>
      </div>
      {errorMessage && <div className={styles.errorMessage}>皮带秤速度不能为空</div>}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
        <Button size="default" onClick={onClose}>
          取消
        </Button>
        <Button size="default" type="primary" onClick={submitData} style={{ marginLeft: 8 }}>
          提交
        </Button>
      </div>
    </>
  );
};

export default Index;
