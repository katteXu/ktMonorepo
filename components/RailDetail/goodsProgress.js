import { Row, Col, Progress, Popover } from 'antd';
import styles from './styles.less';

const content = ({ processAmount, finishAmount, totalAmount, unitName }) => {
  const onGoing = processAmount > totalAmount ? 100 : (processAmount / totalAmount) * 100;
  const complete = finishAmount > totalAmount ? 100 : (finishAmount / totalAmount) * 100;
  const undo =
    totalAmount - processAmount - finishAmount > 0
      ? ((totalAmount - processAmount - finishAmount) / totalAmount) * 100
      : 0;
  return (
    <div className={styles.popover}>
      <div className={styles.complete}>
        已完成:{complete.toFixed(2)}% {(finishAmount / 1000).toFixed(2)} {unitName}
      </div>
      <div className={styles.onGoing}>
        进行中:{onGoing.toFixed(2)}% {(processAmount / 1000).toFixed(2)}
        {unitName}
      </div>
      <div className={styles.undo}>
        未完成:{undo.toFixed(2)}% {((totalAmount * undo) / (100 * 1000)).toFixed(2)} {unitName}
      </div>
    </div>
  );
};
export default ({ propsData }) => {
  const { totalAmount, processAmount, finishAmount, unitName, carCount } = propsData;
  const percent = ((processAmount + finishAmount) / totalAmount) * 100;
  const complete = (finishAmount / totalAmount) * 100;
  return (
    <div className={styles['goods-progress']}>
      <Row className={styles['info-row']}>
        <Col span={3} className={styles['label']}>
          运货总净重（{unitName}）：
        </Col>
        <Col span={3} className={styles['content']}>
          <span className={styles.num}>{((processAmount + finishAmount) / 1000).toFixed(2)}</span> {unitName}
        </Col>
        <Col span={3} className={styles['label']}>
          运输总车次：
        </Col>
        <Col span={3} className={styles['content']}>
          <span className={styles.num}>{carCount}</span>
        </Col>
      </Row>
      <Row style={{ padding: '40px 35px' }}>
        {/* "#46B8AF" : "#FFB741"; */}
        <Col>
          <Popover content={content({ processAmount, finishAmount, totalAmount, unitName })}>
            <Progress
              strokeLinecap="square"
              style={{ boxShadow: '12px' }}
              size="small"
              percent={percent}
              successPercent={complete}
              strokeColor="#FFB741"
              strokeWidth={25}
              format={() => `${(totalAmount / 1000).toFixed(2)} ${unitName || ''}`}
            />
          </Popover>
        </Col>
      </Row>
    </div>
  );
};
