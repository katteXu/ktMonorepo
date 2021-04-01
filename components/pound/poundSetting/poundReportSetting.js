import { useState, useEffect } from 'react';
import { Radio, Button, message } from 'antd';
import { pound } from '@api';
import styles from './poundReport.less';
const Index = () => {
  const [statistical, setStatistical] = useState(1);
  const radioStyle = {
    display: 'block',
    height: '40px',
    lineHeight: '40px',
  };
  const onchangeRadio = e => {
    setStatistical(e.target.value);
  };

  useEffect(() => {
    poundSetting();
  }, []);

  const poundSetting = async () => {
    const { status, result, detail, description } = await pound.getPoundBillTimeSwitch();
    if (!status) {
      setStatistical(result.exchangeWork);
    } else {
      message.error(detail || description);
    }
  };

  const setPoundSetting = async () => {
    const params = {
      exchangeWork: statistical,
    };
    const { status, result, detail, description } = await pound.setPoundBillTime({ params });
    if (!status) {
      message.success(`按${statistical === 0 ? '默认时间' : '交班时间'}统计设置成功`);
    } else {
      message.error(detail || description);
    }
  };
  return (
    <section>
      <div className={styles.help}>
        帮助：您可以选择交班时间统计，则磅单报表中出站时间不需要选择具体的时分秒，选择时间即可带入实际的交班时间进行搜索；选择默认时间统计则恢复默认时间查询
      </div>
      <div className={styles.way}>
        <div className={styles.lableText}>报表统计方式:</div>
        <div className={styles.rightText}>
          <Radio.Group onChange={onchangeRadio} value={statistical}>
            <Radio style={radioStyle} value={0}>
              按默认时间统计
            </Radio>
            <Radio style={radioStyle} value={1}>
              按交班时间统计
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
