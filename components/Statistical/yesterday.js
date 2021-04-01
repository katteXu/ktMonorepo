import React from 'react';
import TopStatistical from './topStatistical';
import { Bar, CrossBar, CrossPie } from '@components/Charts';
import { Image } from '@components';
import DataTable from './dataTable';
import styles from './styles.less';
import { Tooltip } from 'antd';
const Index = props => {
  const total = {
    form: 3660.12,
    to: 3263.2,
    production: 1031.86,
    inputTotal: 1437.32,
  };

  const barData1 = [595.12, 728.52, 487.48, 440.8, 563.21, 528.08, 316.91];
  const xAxis1 = ['精煤', '1.1精煤', '1.2精煤', '肥精煤', '中煤', '煤泥', '混煤'];

  const barData2 = [983.76, 407.21, 375.37, 306.83, 516.91, 432.7, 240.42];
  const xAxis2 = ['原煤', '块煤', '沫煤', '混煤', '瘦煤', '贫煤', '气煤'];
  //购销合同
  const purchaseSaleContract = [
    {
      sign: '山西海能煤化',
      title: '1.1精煤承运合同 ',
      goodsName: '1.1精煤',
      goodsWeight: 8000,
      complete: 48.74,
    },
    {
      sign: '金正泰能源',
      title: '精煤承运合同',
      goodsName: '精煤',
      goodsWeight: 7500,
      complete: 35.54,
    },
    {
      sign: '大华煤厂',
      title: '大华承运合同',
      goodsName: '煤泥',
      goodsWeight: 10000,
      complete: 82.86,
    },
    {
      sign: '阳煤国新煤炭',
      title: '肥精煤承运合同',
      goodsName: '肥精煤',
      goodsWeight: 8000,
      complete: 50.07,
    },
    {
      sign: '利得亨煤炭',
      title: '中煤承运合同',
      goodsName: '中煤',
      goodsWeight: 5000,
      complete: 14.88,
    },
  ];
  //采购合同
  const purchaseContract = [
    {
      sign: '佐行贸易',
      title: '原煤承运合同 ',
      goodsName: '原煤',
      goodsWeight: 20000,
      complete: 67.1,
    },
    {
      sign: '诚盛泰合物流',
      title: '混煤承运合同',
      goodsName: '混煤 ',
      goodsWeight: 3000,
      complete: 20.43,
    },
    {
      sign: '昊森商贸',
      title: '贫煤承运合同',
      goodsName: '贫煤',
      goodsWeight: 3000,
      complete: 31.5,
    },
    {
      sign: '晋能集团',
      title: '块煤承运合同',
      goodsName: '块煤',
      goodsWeight: 5000,
      complete: 93.82,
    },
    {
      sign: '鑫洋煤业',
      title: '沫煤承运合同',
      goodsName: '沫煤 ',
      goodsWeight: 2000,
      complete: 10.17,
    },
  ];

  const yAxis = ['1.1精煤', '精煤 ', '煤泥', '肥精煤', '中煤'];
  const crossBarData = [3517.8, 4166.64, 1454.18, 2837.54, 3981.25];

  const pieData = [
    {
      key: '肥煤 30.15%',
      value: '30.15',
    },
    {
      key: '1/3焦煤 31.8%',
      value: '31.8',
    },
    {
      key: '瘦煤  25.47%',
      value: '25.47',
    },
    {
      key: '气煤  12.58%',
      value: '12.58',
    },
  ];
  const aiInfo = {
    one: 2.16,
    two: 2.01,
  };
  return (
    <div>
      <TopStatistical form={total.form} to={total.to} production={total.production} inputTotal={total.inputTotal} />
      <div className={styles.box}>
        <div className={styles.title}>货品运输情况</div>
        <div className={styles.barData}>
          <div className={styles.left}>
            <div className={styles.subTitle}>货品发货统计</div>
            <Bar data={barData1} xAxis={xAxis1} color="#45B7AF" bgColor="rgba(69, 183, 175, 0.08)" />
          </div>
          <div className={styles.right}>
            <div className={styles.subTitle}>货品收货统计</div>
            <Bar data={barData2} xAxis={xAxis2} color="#3D86EF" bgColor="rgba(240, 246, 254, 1)" />
          </div>
        </div>
      </div>
      <div className={styles.box}>
        <div className={styles.title}>合同执行情况</div>
        <div className={styles.barData} style={{ marginTop: 20 }}>
          <div className={styles.leftTable}>
            <div className={styles.subTitleTable}>销售合同</div>
            <DataTable dataList={purchaseSaleContract} />
          </div>
          <div className={styles.rightTable}>
            <div className={styles.subTitleTable}>采购合同</div>
            <DataTable dataList={purchaseContract} />
          </div>
        </div>
      </div>
      <div className={styles.box}>
        <div className={styles.title}>智能生产情况</div>
        <div className={styles.bottonData} style={{ position: 'relative', marginTop: 24 }}>
          <div className={styles.leftBottom}>
            <div className={styles.subTitleTable} style={{ position: 'absolute', top: 17 }}>
              原料煤投入统计
            </div>
            <CrossPie data={pieData} />
          </div>
          <div className={styles.centerBottom}>
            <div className={styles.subTitleTable} style={{ position: 'absolute', top: 17 }}>
              AI配煤优化
            </div>
            <div className={styles.aiBox}>
              <div className={styles.expect}>预计平均降低成本</div>
              <Tooltip placement="top" title="依据AI智能推荐方案按元/吨计算得出">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <span className={styles.percentage}>{aiInfo.one}%</span>
                  <img src={Image.FallingPic} className={styles.falling} />
                </div>
              </Tooltip>

              <div style={{ marginTop: 12 }}>
                <div className={styles.expect}>实际平均降低成本</div>
                <Tooltip placement="top" title="依据实际产出录入,按元/吨计算得出">
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <span className={styles.percentage}>{aiInfo.two}%</span>
                    <img src={Image.FallingPic} className={styles.falling} />
                  </div>
                </Tooltip>
              </div>
            </div>
          </div>
          <div className={styles.rightBottom}>
            <div className={styles.subTitleTable} style={{ position: 'absolute', top: 17 }}>
              剩余目标产量
            </div>
            <CrossBar data={crossBarData} yAxis={yAxis} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
