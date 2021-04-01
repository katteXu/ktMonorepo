import styles from './editBeltScaleSpeed.less';
import { Input } from 'antd';
const Index = ({ setbedThinkness, bedThinkness }) => {
  const handleKeyPress = event => {
    if ([189, 187, 69].includes(event.keyCode)) {
      event.preventDefault();
    }
  };
  return (
    <>
      <div className={styles.root} style={{ height: 'unset', margin: 0 }}>
        <span>床层厚度</span>
        <span
          onClick={() => {
            // if (bedThinkness <= 1) {
            //   setbedThinkness(1);
            // } else {
            if (bedThinkness) {
              setbedThinkness(bedThinkness - 1);
            } else {
              setbedThinkness(1);
            }
            // }
          }}
          className={styles.reduction}>
          -
        </span>
        <Input
          value={bedThinkness}
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
            setbedThinkness(value);
          }}
          style={{ display: 'inline-block', width: 56, marginRight: 4, textAlign: 'center' }}
        />
        mm
        <span
          onClick={() => {
            if (bedThinkness) {
              setbedThinkness(bedThinkness * 1 + 1);
            } else {
              setbedThinkness(1);
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
