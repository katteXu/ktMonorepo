import ReactEcharts from 'echarts-for-react';
import { useEffect, useState } from 'react';

const Pie = ({ data = [], size }) => {
  const default_option = {
    tooltip: {
      trigger: 'item',
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
    series: {
      name: '库存情况',
      roseType: 'radius',
      type: 'pie',
      radius: '68%',
      center: ['50%', '60%'],
      radius: ['50%', '75%'],
      clockwise: false,
      hoverAnimation: false,
      data: [],
      label: {
        normal: {
          position: 'inner',
          show: false,
          textStyle: {
            color: '#999',
            fontSize: '14px',
          },
        },
      },
      labelLine: {
        normal: {
          show: false,
        },
      },
      itemStyle: {
        normal: {
          borderWidth: 1,
          borderColor: '#ffffff',
        },
        emphasis: {
          borderWidth: 0,
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.2)',
        },
      },
    },
    color: ['#46B8AF', '#FFB844', '#477AEF', '#FD5F7D', '#FF8742'],
  };

  // 生成配置
  const getOpt = data => {
    if (data.length === 0) {
      return default_option;
    }
    let opt = { ...default_option };
    // legend
    opt.legend.data = data.map(item => item.key);
    // series
    opt.series.data = data.map(item => ({
      name: item.key,
      value: item.value / 1000,
    }));
    return opt;
  };
  const [option, setOption] = useState({});

  useEffect(() => {
    const option = getOpt(data);
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

export default Pie;
