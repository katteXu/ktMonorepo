import ReactEcharts from 'echarts-for-react';
import { useEffect, useState } from 'react';

const CrossBar = ({ data = [], size, yAxis, bgColor }) => {
  const default_option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: '',
      },
    },

    grid: {
      left: '3%',
      right: '9%',
      bottom: '3%',
      containLabel: true,
    },

    xAxis: {
      show: false,
      type: 'value',
      // boundaryGap: [0, 0.01],
      axisLine: {
        show: false,
      },
      axisTick: { show: false },
      splitLine: { show: false },
      max: function (value) {
        return value.max + 500;
      },
    },
    series: [],

    // color: ['#477AEF'],
  };

  // 生成配置
  const getOpt = (data, yAxis) => {
    if (data.length === 0) {
      return default_option;
    }
    let opt = { ...default_option };
    // opt.yAxis.data = yAxis;
    opt.yAxis = {
      type: 'category',
      data: yAxis,
      axisLine: {
        show: false,
      },
      axisTick: { show: false },
      axisLabel: { fontSize: 14 },
    };
    // series
    opt.series = {
      data: data,
      type: 'bar',
      barWidth: 10,
      itemStyle: {
        normal: {
          color: params => {
            //首先定义一个数组
            var colorList = ['#477AEF', '#45B7AF'];
            if (params.dataIndex % 2 == 0) {
              return colorList[0];
            } else {
              return colorList[1];
            }
          },
          barBorderRadius: [15, 15, 15, 15],
          label: {
            show: true, //开启显示
            position: 'right', //在上方显示
            textStyle: {
              //数值样式
              color: '#333333',
              fontSize: 14,
            },
            formatter: params => {
              return params.data + '吨';
            },
          },
        },
      },
    };
    return opt;
  };
  const [option, setOption] = useState({});

  useEffect(() => {
    const option = getOpt(data, yAxis);
    if (data.length > 0) {
      setOption(option);
    }
  }, [data]);

  return (
    <div style={{ height: size || 280 }}>
      <ReactEcharts option={option} style={{ height: '100%', width: '100%', left: -8, top: -13 }} />
    </div>
  );
};

export default CrossBar;
