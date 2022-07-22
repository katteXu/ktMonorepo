import ReactEcharts from 'echarts-for-react';
import { useEffect, useState } from 'react';
const Bar = ({ data = [], size, xAxis, color, bgColor }) => {
  const default_option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: '',
      },
    },
    xAxis: {
      type: 'category',
      data: [],
      axisTick: {
        show: false,
      },
      axisLine: {
        show: false,
      },
    },
    legend: {
      orient: 'horizontal',
      icon: 'circle',
      x: 'left',
      left: '16px',
      data: [],
      itemGap: 24,
      itemHeight: 6,
      textStyle: {
        fontSize: 14,
        color: '#6A6A6A',
        padding: [0, 0, 0, -6],
      },
    },

    series: [],
    yAxis: {
      type: 'value',
      axisTick: { show: false },
      axisLine: {
        show: false,
      },
      // splitLine: { show: false },
      splitLine: {
        show: true,
        lineStyle: {
          color: ['#F7F7F7'],
          width: 1,
          type: 'solid',
        },
      },

      name: '(吨)',
      nameLocation: 'end',

      nameTextStyle: {
        fontSize: 12, //正常是不用添加
        color: '#6A6A6A',
        right: -12,
      },
    },

    color: color,
  };

  // 生成配置
  const getOpt = (data, xAxis, color, bgColor) => {
    if (data.length === 0) {
      return default_option;
    }
    let opt = { ...default_option };

    opt.xAxis.data = xAxis;
    // series
    opt.series = [
      {
        data: data,
        type: 'bar',
        barWidth: 17,
        showBackground: true,
        backgroundStyle: {
          color: bgColor,
        },
      },
    ];
    return opt;
  };
  const [option, setOption] = useState({});

  useEffect(() => {
    const option = getOpt(data, xAxis, color, bgColor);
    if (data.length > 0) {
      setOption(option);
    }
  }, [data]);

  return (
    <div style={{ height: size || 280 }}>
      <ReactEcharts option={option} style={{ height: '100%', width: '100%' }} />
    </div>
  );
};

export default Bar;
