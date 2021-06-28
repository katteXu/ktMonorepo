import { Steps } from 'antd';
import styles from './styles.less';
const { Step } = Steps;

const Index = () => {
  return (
    <div className={styles['steps']}>
      <Steps>
        <Step title="录入过磅信息"></Step>
        <Step title="打印装/卸车单"></Step>
        <Step title="核对过磅信息"></Step>
      </Steps>
    </div>
  );
};

export default Index;
