import styles from './editBeltScaleSpeed.less';
import { Input } from 'antd';
const Index = ({ setSpeed, speed }) => {
  const handleKeyPress = event => {
    if ([189, 187, 69].includes(event.keyCode)) {
      event.preventDefault();
    }
  };
  return (
    <>
      <div className={styles.root} style={{ height: 'unset', margin: 0 }}>
        <span>排矸速度</span>
        <span
          onClick={() => {
            if (speed) {
              setSpeed(speed - 1);
            } else {
              setSpeed(1);
            }
          }}
          className={styles.reduction}>
          -
        </span>
        <Input
          value={speed}
          type="number"
          onKeyDown={handleKeyPress}
          onChange={e => {
            let value = e.target.value.replace(/^(\-)*(\d+).*$/, '$1$2');
            // if (e.target.value <= 1) {
            //   value = 1;
            // }
            // if (e.target.value >= 6) {
            //   value = 6;
            // }
            setSpeed(value);
          }}
          style={{ display: 'inline-block', width: 56, marginRight: 4, textAlign: 'center' }}
        />
        <span
          onClick={() => {
            if (speed) {
              setSpeed(speed * 1 + 1);
            } else {
              setSpeed(1);
            }
          }}
          className={styles.add}>
          +
        </span>
      </div>
    </>
  );
};

export default Index;
