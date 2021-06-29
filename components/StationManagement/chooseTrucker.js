import { useState, useEffect } from 'react';
import { station } from '@api';
import { Input, Modal, Tooltip, message } from 'antd';
import { QuestionCircleFilled } from '@ant-design/icons';
import styles from './index.less';
import ManualForm from './manualForm';
const Index = ({ trailerPlateNumber, onSubmit }) => {
  const [truckerList, setTruckerList] = useState([]);
  const [showManual, setShowManual] = useState(false);
  const [type, setType] = useState(false);
  useEffect(() => {
    truckerListInfo();
  }, [trailerPlateNumber]);

  const truckerListInfo = async () => {
    if (trailerPlateNumber) {
      const params = {
        trailerPlateNumber,
      };
      const res = await station.queryTruckerInfo({ params });
      if (res.status === 0) {
        setTruckerList(res.result.data);
        setType(res.result.type);
      } else {
        message.error(`${res.detail || res.description}`);
      }
    }
  };

  const chooseTrucker = item => {
    onSubmit(item);
  };
  return (
    <div className={styles.truckerInfo}>
      <div className={styles.trailerPlateNumber}>
        <div>
          过磅车辆
          <span className={styles.manual} onClick={() => setShowManual(true)}>
            手动录入
            <Tooltip title="若未找到与该车辆匹配的司机信息，可手动录入" placement="right">
              <QuestionCircleFilled style={{ marginRight: 0, marginLeft: 5, cursor: 'pointer', color: '#D0D4DB' }} />
            </Tooltip>
          </span>
        </div>
        <span>{trailerPlateNumber}</span>
      </div>
      <div className={styles.title}>
        关联司机 <span className={styles.subTitle}>(请选择正确的司机)</span>
      </div>
      <div className={styles.truckerItem}>
        {type &&
          truckerList &&
          truckerList.map((item, key) => {
            return (
              <div onClick={() => chooseTrucker(item)} className={styles.card} key={key}>
                <div className={styles.name}>{item.name}</div>
                <div>{item.mobile}</div>
              </div>
            );
          })}
      </div>
      <Modal title="手动录入" destroyOnClose footer={null} visible={showManual} onCancel={() => setShowManual(false)}>
        <ManualForm
          onManualInfo={item => {
            setShowManual(false);
            onSubmit(item);
          }}
        />
      </Modal>
    </div>
  );
};

export default Index;
