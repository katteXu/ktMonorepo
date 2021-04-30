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

  // 昨天
  const handletoYesterdayClick = async () => {
    setBtnActive('toYesterday');
    const totoYesterday = [
      moment().subtract(1, 'days').format('YYYY-MM-DD 00:00:00'),
      moment().subtract(1, 'days').format('YYYY-MM-DD 23:59:59'),
      ,
    ];
    console.log(totoYesterday);
    setDate({
      begin: totoYesterday[0],
      end: totoYesterday[1],
    });
    onChange && onChange({ begin: totoYesterday[0], end: totoYesterday[1] }, 'toYesterday');
  };

  // 日期输入
  const handleChangeDate = (value, string) => {
    const begin = value && value[0] && moment(value[0]).format('YYYY-MM-DD HH:mm:ss');
    const end = value && value[1] && moment(value[1]).format('YYYY-MM-DD HH:mm:ss');

    onChange && onChange({ begin, end }, '');
  };

  return (
    <div className={styles.main} style={{ marginBottom: remoteBegin && remoteEnd ? 24 : 0 }}>
      <span className={styles.txt}>出站时间：</span>
      <DatePicker.RangePicker
        format={'YYYY-MM-DD HH:mm:ss'}
        showTime={{
          defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
        }}
        style={{ width: 376 }}
        value={date.begin && date.end ? [moment(date.begin), moment(date.end)] : null}
        onChange={handleChangeDate}
      />

      <span className={styles['date-text']} style={remoteBegin && remoteEnd ? {} : { display: 'none' }}>
        {remoteBegin && moment(remoteBegin).format('YYYY-MM-DD HH:mm:ss')}
        {remoteEnd && ` - ${moment(remoteEnd).format('YYYY-MM-DD HH:mm:ss')}`}
      </span>
      <Button
        style={{ marginLeft: 15 }}
        className={`${styles.btn} ${btnActive === 'toDay' ? styles.active : {}}`}
        ghost
        size="small"
        onClick={handleDayClick}>
        今
      </Button>
      <Button
        className={`${styles.btn} ${btnActive === 'toYesterday' ? styles.active : {}}`}
        ghost
        size="small"
        onClick={handletoYesterdayClick}>
        昨
      </Button>
      <Button
        className={`${styles.btn} ${btnActive === 'toMonth' ? styles.active : {}}`}
        ghost
        size="small"
        onClick={handleMonthClick}>
        本月
      </Button>
    </div>
  );
};

export default Datepicker;
