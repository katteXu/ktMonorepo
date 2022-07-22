import React, { useEffect, useState } from 'react';
// 动态导入图片查看组件
import dynamic from 'next/dynamic';
const DateRangeQuickPicker = dynamic(import('zent/es/date-range-quick-picker'), { ssr: false });
import moment from 'moment';
import styles from './styles.less';
// 引入样式
import 'zent/css/index.css';

const CHOSEDATE = ['toDay', 'toYesterday', 'toMonth'];

const DateRangePicker = props => {
  const [date, setDate] = useState([]);
  const handleChange = (value, choseDay) => {
    // 日期必须同时存在
    const begin = value[0];
    const end = value[1];
    props.onChange && props.onChange({ begin, end }, choseDay !== undefined && (CHOSEDATE[choseDay] || 'toMonth'));
  };

  const filterChoseDay = () => {
    if (props.dateStatus === 'toDay') {
      return 0;
    }

    if (props.dateStatus === 'toYesterday') {
      return 1;
    }

    if (props.dateStatus === 'toMonth') {
      return [
        moment().startOf('month').format('YYYY-MM-DD 00:00:00'),
        moment().endOf('month').format('YYYY-MM-DD 23:59:59'),
      ];
    }
  };
  return (
    <DateRangeQuickPicker
      preset={
        props.quickBtn
          ? [
              {
                text: '今',
                value: 0,
              },
              {
                text: '昨',
                value: 1,
              },
              {
                text: '本月',
                value: [
                  moment().startOf('month').format('YYYY-MM-DD 00:00:00'),
                  moment().endOf('month').format('YYYY-MM-DD 23:59:59'),
                ],
              },
            ]
          : []
      }
      className={styles.main}
      format="YYYY-MM-DD HH:mm:ss"
      onChange={handleChange}
      chosenDays={filterChoseDay()}
      value={[props.value.begin, props.value.end]}
      placeholder={['开始时间', '结束时间']}
      width={200}
      // defaultTime={['00:00:00', '23:59:59']}
    />
  );
};

export default DateRangePicker;
