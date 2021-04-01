import ReactEcharts from 'echarts-for-react';
import { useEffect, useState } from 'react';
import * as echarts from 'echarts';

const Col = ['#009cff', '#FB8F11', '#1AA93C', '#F4303A', '#B684FA', '#9014FE'];
const getAreaStyle = i => ({
  normal: {
    color: new echarts.graphic.LinearGradient(
      0,
      0,
      0,
      1,
      [
        {
          offset: 0,
          color: Col[i % 6],
        },
        {
          offset: 1,
          color: Col[i % 6],
        },
      ],
      false
    ),
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    opacity: 0.1,
    shadowBlur: 10,
  },
});

const getItemStyle = i => ({
  normal: {
    opacity: 0.2,
    borderWidth: 12,
    color: Col[i % 6],
    // borderColor: Col[i % 6],
  },
});

// 默认值
const default_option = {
  theme: 'light',
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      lineStyle: {
        color: '#57617B',
      },
    },
  },
  legend: {
    data: [],
    icon: 'circle',
    itemHeight: 6,
    itemGap: 13,
    left: '4%',
    top: '1px',
    textStyle: {
      fontSize: 14,
      color: '#6A6A6A',
      padding: [0, 0, 0, -6],
    },
  },
  grid: {
    left: '36px',
    right: '0px',
    bottom: '20px',
    top: '40px',
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: [],
    axisLine: {
      lineStyle: {
        color: '#9db0c1',
      },
    },
  },
  yAxis: {
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
  series: [],
};

// 生成配置
const getOpt = (data, xAxis, showLegend, otherOption) => {
  if (Object.keys(data).length === 0) {
    return default_option;
  }
  let opt = { ...default_option };

  // legend

  if (!showLegend) {
    opt.legend.data = Object.keys(data);
  }
  // series

  opt.series = Object.keys(data).map((key, i) => ({
    name: key,
    data: data[key],
    type: 'line',
    smooth: true,
    symbol: 'circle',
    symbolSize: 5,
    showSymbol: false,
    areaStyle: getAreaStyle(i),
    itemStyle: getItemStyle(i),
    lineStyle: {
      normal: {
        width: 1.5,
      },
    },
  }));

  // xAxis
  opt.xAxis.data = xAxis;
  return opt;
};

const Line = ({ data = {}, xAxis, size, showLegend, otherOption }) => {
  const [option, setOption] = useState({});

  useEffect(() => {
    const option = getOpt(data, xAxis, showLegend, otherOption);
    setOption(option);
  }, [data, otherOption]);

  return (
    <div style={{ height: size || 280 }}>
      <ReactEcharts notMerge={true} theme="light" option={option} style={{ height: '100%', width: '100%' }} />
    </div>
  );
};

export default Line;
