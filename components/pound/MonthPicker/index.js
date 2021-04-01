import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { DatePicker, Button, Radio } from 'antd';
import styles from './index.less';
import { pound } from '@api';
import moment from 'moment';

const Monthpicker = (props, ref) => {
  const [date, setDate] = useState(null);
  const [dateTime, setDateTime] = useState([]);
  const [type, setType] = useState(0);

  const handleChangeDate = async date => {
    setDateTime(date);
    let d = moment(date);
    let firstDate = moment(d).startOf('month');
    let lastDate = moment(d).endOf('month');
    const time = [firstDate, lastDate];
    const res = await getDate(time);
    setDate(res);
  };

  useImperativeHandle(ref, () => ({
    reset: async () => {
      const tadayMonth = moment().format('YYYY-MM');
      const toMonth = [
        moment({ hour: 0, minute: 0, second: 0 }).startOf('month'),
        moment({ hour: 23, minute: 59, second: 59 }).endOf('month'),
      ];
      setDateTime(tadayMonth);
      const res = await getDate(toMonth);
      setDate(res);

      return res;
    },
  }));

  useEffect(() => {
    initTimeType();
  }, []);

  // 初始化出站时间类型
  const initTimeType = async () => {
    const res = await pound.getTypeForWorkTime();
    if (res.status === 0) {
      const type = res.result.exchangeWork;
      setType(type);
      initClick(type);
    }
  };

  const initClick = async type => {
    const tadayMonth = moment().format('YYYY-MM');
    const toMonth = [
      moment({ hour: 0, minute: 0, second: 0 }).startOf('month'),
      moment({ hour: 23, minute: 59, second: 59 }).endOf('month'),
    ];

    setDateTime(tadayMonth);
    const res = await initGetData(toMonth, type);
    setDate(res);
  };

  const initGetData = async (date, typeValue) => {
    if (!date) {
      return null;
    }
    if (typeValue === 0) return date;

    const [start, end] = date;
    const params = {
      begin: start.format('YYYY-MM-DD 00:00:00'),
      end: end.format('YYYY-MM-DD 23:59:59'),
    };
    const res = await pound.getDateByWorkTime({ params });
    if (res.status === 0) {
      const { begin, end } = res.result;
      return [moment(begin), moment(end)];
    }
  };

  // 获取时间
  const getDate = async date => {
    if (!date) {
      return null;
    }
    if (type === 0) return date;

    const [start, end] = date;
    const params = {
      begin: start.format('YYYY-MM-DD 00:00:00'),
      end: end.format('YYYY-MM-DD 23:59:59'),
    };
    const res = await pound.getDateByWorkTime({ params });
    if (res.status === 0) {
      const { begin, end } = res.result;
      return [moment(begin), moment(end)];
    }
  };

  // 日期文案改变 则触发回调
  useEffect(() => {
    props.onChange && props.onChange(date);
  }, [date]);

  return (
    <div className={styles.main}>
      <span className={styles.txt}>出站时间：</span>
      {/* <DatePicker.RangePicker
        format={type === 0 ? 'YYYY-MM-DD HH:mm:ss' : undefined}
        showTime={
          type === 0
            ? {
                defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
              }
            : undefined
        }
        style={{ width: 400, marginLeft: 12 }}
        value={dateTime}
        onChange={handleChangeDate}
      /> */}
      <DatePicker.MonthPicker
        value={moment(dateTime)}
        onChange={handleChangeDate}
        style={{ width: 376 }}
        allowClear={false}
      />

      {type === 1 && (
        <span className={styles['date-text']} style={!date ? { display: 'none' } : {}}>
          {date && date[0].format('YYYY-MM-DD HH:mm:ss')}
          {date && ` - ${date[1].format('YYYY-MM-DD HH:mm:ss')}`}
        </span>
      )}
    </div>
  );
};

export default forwardRef(Monthpicker);
