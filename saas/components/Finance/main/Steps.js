import styles from './styles.less';
import { Steps } from '@components';
const Index = ({ current, style }) => {
  return (
    <div style={{ ...style, marginTop: 8, marginBottom: 24 }}>
      <Steps
        data={[
          { title: '选择要开票的专线/运单', key: current >= 0 },
          { title: '查看对账单', key: current === 1 },
        ]}
      />
    </div>
  );
};

export default Index;
