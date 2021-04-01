import { useState, useEffect } from 'react';
import { DatePicker, Button } from 'antd';
import styles from './index.less';
import moment from 'moment';

const Datepicker = ({ value, onChange, remoteBegin, remoteEnd, dateStatus }) => {
  const [btnActive, setBtnActive] = useState('');

  const [date, setDate] = useState(value);
  useEffect(() => {
    setDate(value);
    setBtnActive(dateStatus);
  }, [value, dateStatus]);
  // 本日点击
  const handleDayClick = async () => {
    setBtnActive('toDay');
    const today = [moment({ hour: 0, minute: 0, second: 0 }), moment({ hour: 23, minute: 59, second: 59 })];

    setDate({
      begin: today[0],
      end: today[1],
    });
    onChange && onChange({ begin: today[0], end: today[1] }, 'toDay');
  };

  // 本月点击
  const handleMonthClick = async () => {
    setBtnActive('toMonth');
    const toMonth = [
      moment({ hour: 0, minute: 0, second: 0 }).startOf('month'),
      moment({ hour: 23, minute: 59, second: 59 }).endOf('month'),
    ];
    setDate({
      begin: toMonth[0],
      end: toMonth[1],
    });
    onChange && onChange({ begin: toMonth[0], end: toMonth[1] }, 'toMonth');
  };

  // 日期输入
  const handleChangeDate = (value, string) => {
    const begin = value && value[0] && moment(value[0]).format('YYYY-MM-DD HH:mm:ss');
    const end = value && value[1] && moment(value[1]).format('YYYY-MM-DD HH:mm:ss');

    onChange && onChange({ begin, end }, '');
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
        format={'YYYY-MM-DD HH:mm:ss'}
        showTime={{
          defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
        }}
        style={{ width: 376, marginLeft: 12 }}
        value={date.begin && date.end ? [moment(date.begin), moment(date.end)] : null}
        onChange={handleChangeDate}
      />

      <span className={styles['date-text']} style={remoteBegin && remoteEnd ? {} : { display: 'none' }}>
        {remoteBegin && moment(remoteBegin).format('YYYY-MM-DD HH:mm:ss')}
        {remoteEnd && ` - ${moment(remoteEnd).format('YYYY-MM-DD HH:mm:ss')}`}
      </span>
    </div>
  );
};

export default Datepicker;
