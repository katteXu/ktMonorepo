import { useState, useEffect } from 'react';
import { Radio, Button, message } from 'antd';
import { pound } from '@api';
import styles from './poundReport.less';

const Index = () => {
  const [outBound, setOutBound] = useState(false);
  const radioStyle = {
    height: '40px',
    lineHeight: '40px',
    display: 'block',
  };
  const onchangeRadio = e => {
    setOutBound(e.target.value);
  };

  useEffect(() => {
    poundSetting();
  }, []);

  const poundSetting = async () => {
    const { status, result, detail, description } = await pound.out_pound_settings({});
    if (!status) {
      setOutBound(result.outBoundSettings);
    } else {
      message.error(detail || description);
    }
  };

  const setPoundSetting = async () => {
    const params = {
      outBoundSettings: outBound,
    };
    const { status, result, detail, description } = await pound.set_out_pound_settings({ params });
    if (!status) {
      message.success(`设置成功`);
    } else {
      message.error(detail || description);
    }
  };
  return (
    <section>
      <div className={styles.help}>帮助：若选择打开发货出站限制，则在发货场景当车辆&司机信息不全时，无法进行出站</div>
      <div className={styles.way}>
        <div className={styles.lableText}>发货出站限制:</div>
        <div className={styles.rightText}>
          <Radio.Group onChange={onchangeRadio} value={outBound}>
            <Radio style={radioStyle} value={true}>
              是
            </Radio>
            <Radio style={radioStyle} value={false}>
              否
            </Radio>
          </Radio.Group>
          <Button type="primary" style={{ display: 'block', marginTop: 8 }} onClick={setPoundSetting}>
            保存
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Index;
