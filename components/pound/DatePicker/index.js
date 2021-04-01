import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { DatePicker, Button, Radio } from 'antd';
import styles from './index.less';
import { pound } from '@api';
import moment from 'moment';

const Datepicker = (props, ref) => {
  const [date, setDate] = useState(null);
  const [dateTime, setDateTime] = useState([]);
  const [type, setType] = useState(0);
  const [btnActive, setBtnActive] = useState('toDay');
  const handleChangeDate = async date => {
    setDateTime(date);
    const res = await getDate(date);
    setDate(res);
    setBtnActive('');
  };

  useImperativeHandle(ref, () => ({
    reset: async () => {
      setBtnActive('toDay');
      const today = [moment({ hour: 0, minute: 0, second: 0 }), moment({ hour: 23, minute: 59, second: 59 })];
      setDateTime(today);
      const res = await getDate(today);
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
    setBtnActive('toDay');
    const today = [moment({ hour: 0, minute: 0, second: 0 }), moment({ hour: 23, minute: 59, second: 59 })];
    setDateTime(today);
    const res = await initGetData(today, type);
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

  // 本日点击
  const handleDayClick = async () => {
    setBtnActive('toDay');
    const today = [moment({ hour: 0, minute: 0, second: 0 }), moment({ hour: 23, minute: 59, second: 59 })];
    setDateTime(today);
    const res = await getDate(today);
    setDate(res);
  };

  // 日期文案改变 则触发回调
  useEffect(() => {
    props.onChange && props.onChange(date);
  }, [date]);

  // 本月点击
  const handleMonthClick = async () => {
    setBtnActive('toMonth');
    const toMonth = [
      moment({ hour: 0, minute: 0, second: 0 }).startOf('month'),
      moment({ hour: 23, minute: 59, second: 59 }).endOf('month'),
    ];
    setDateTime(toMonth);
    const res = await getDate(toMonth);
    setDate(res);
  };

  return (
    <div className={styles.main}>
      <Button
        style={{ width: 64, height: 24 }}
        className={`${styles.btn} ${btnActive === 'toDay' ? styles.active : {}}`}
        ghost
        size="small"
        onClick={handleDayClick}>
        本日
      </Button>
      <Button
        style={{ width: 64, height: 24 }}
        className={`${styles.btn} ${btnActive === 'toMonth' ? styles.active : {}}`}
        ghost
        size="small"
        onClick={handleMonthClick}>
        本月
      </Button>
      <span className={styles.txt}>出站时间：</span>
      <DatePicker.RangePicker
        format={type === 0 ? 'YYYY-MM-DD HH:mm:ss' : undefined}
        showTime={
          type === 0
            ? {
                defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
              }
            : undefined
        }
        style={{ width: 376, marginLeft: 12 }}
        value={dateTime}
        onChange={handleChangeDate}
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

export default forwardRef(Datepicker);
