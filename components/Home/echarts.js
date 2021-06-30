import { useState } from 'react';
import ReactEcharts from 'echarts-for-react';
import * as echarts from 'echarts';

import styles from '../../static/styles/home.less';
// 常量
const NAME = ['运货量', '运单数', '运费总额'];
const DATA = ['weight', 'count', 'price'];
//蓝色,红色,黄色
const COLOR = ['#46B8AF', '#477AEF', '#FF8742'];

const getOption = ({ dataSource, color, date, name }) => {
  const _color = color;
  const _date = date;
  const _dataSource = dataSource;
  const _name = name;

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        lineStyle: {
          color: '#57617B',
        },
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        axisLine: {
          lineStyle: {
            color: '#9db0c1',
          },
        },
        data: _date,
      },
    ],
    yAxis: [
      {
        type: 'value',
        axisTick: {
          show: false,
        },
        axisLine: {
          lineStyle: {
            color: '#9db0c1',
          },
        },
        axisLabel: {
          margin: 10,
          textStyle: {
            fontSize: 14,
          },
        },
        splitLine: {
          lineStyle: {
            color: '#f8f8f8',
          },
        },
      },
    ],
    series: [
      {
        name: _name,
        type: 'line',
        stack: '总量',
        smooth: true,
        symbol: 'circle',
        symbolSize: 5,
        showSymbol: false,
        lineStyle: {
          normal: {
            width: 3,
          },
        },
        areaStyle: {
          normal: {
            color: new echarts.graphic.LinearGradient(
              0,
              0,
              0,
              1,
              [
                {
                  offset: 0,
                  color: _color,
                  // opacity:0.8
                },
                {
                  offset: 0.8,
                  color: _color,
                  // opacity:0.1
                },
              ],
              false
            ),
            shadowColor: 'rgba(0, 0, 0, 0.1)',
            opacity: 0.1,
            shadowBlur: 10,
          },
        },
        itemStyle: {
          normal: {
            color: _color,
            borderColor: _color,
            opacity: 0.2,
            borderWidth: 12,
          },
        },
        data: _dataSource,
      },
    ],
  };
  return option;
};

const getData = data => {
  const [date, weight, count, price] = [[], [], [], []];
  let [sumWeight, sumCount, sumPrice] = [0.0, 0, 0.0];
  Object.keys(data).forEach(key => {
    if (key) {
      const _date = new Date(key);
      const _item = data[key];
      date.push(`${_date.getMonth() + 1}.${_date.getDate()}`);

      sumWeight += _item.amount / 1000;
      sumCount += _item.count;
      sumPrice += _item.price / 100;

      weight.push(_item.amount / 1000);
      count.push(_item.count);
      price.push(_item.price / 100);
    }
  });
  return { date, sumWeight, sumCount, sumPrice, weight, count, price };
};

const Echarts = ({ data = {} }) => {
  // echart data
  const { date, sumWeight, sumCount, sumPrice, ...dataSource } = getData(data);
  // use Hooks for state
  const [type, changeType] = useState(() => 0);
  // echart option
  const opt = getOption({
    dataSource: dataSource[DATA[type]],
    color: COLOR[type],
    date,
    name: NAME[type],
  });

  return (
    // 对changeType进行判断避免多次渲染
    <div style={{ height: 235, display: 'flex', flexDirection: 'column' }}>
      <div className={styles.statisticsEchart}>
        <div
          onClick={() => type !== 0 && changeType(0)}
          className={`${styles.tag0} `}
          style={{ borderBottom: type === 0 ? '3px solid #46B8AF' : '' }}>
          <div className={styles.txt}>运货量</div>
          <span className={styles.num}>{sumWeight.toFixed(2)}</span>
          <span className={styles.until}>吨</span>
        </div>
        <div
          onClick={() => type !== 1 && changeType(1)}
          className={`${styles.tag1} `}
          style={{ borderBottom: type === 1 ? '3px solid #477AEF' : '' }}>
          <div className={styles.text}>运单数</div>
          <span className={styles.num}>{sumCount}</span>
          <span className={styles.until}>单</span>
        </div>
        <div
          onClick={() => type !== 2 && changeType(2)}
          className={`${styles.tag2} `}
          style={{ borderBottom: type === 2 ? '3px solid #FF8742' : '' }}>
          <div className={styles.text}>运费总额</div>
          <span className={styles.num}>{sumPrice.toFixed(2)}</span>
          <span className={styles.until}>元</span>
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <ReactEcharts option={opt} style={{ height: '100%', width: '100%' }} />
      </div>
    </div>
  );
};

export default Echarts;
