import { useState, useEffect } from 'react';
import { Layout, Content, Status, ChildTitle } from '@components';
import { Skeleton } from 'antd';
import { Format, getQuery } from '@utils/common';
import styles from './styles.less';
import router from 'next/router';
import Link from 'next/link';
import { quality } from '@api';

const HOT = ['低', '高'];
const QualityDetail = props => {
  const routeView = {
    title: '化验单详情',
    pageKey: 'qualityManagement',
    longKey: 'productManagement.qualityManagement',
    breadNav: [
      '智慧工厂',
      <Link href="/productManagement/qualityManagement">
        <a>质检管理</a>
      </Link>,
      '化验单详情',
    ],

    pageTitle: '化验单详情',
    useBack: true,
  };

  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({});
  useEffect(() => {
    setDetail();
  }, []);

  const setDetail = async () => {
    const { id } = getQuery();
    const params = { id };
    setLoading(true);
    const res = await quality.getDetail({ params });
    if (res.status === 0) {
      setData(res.result);
    }
    setLoading(false);
  };
  return (
    <Layout {...routeView}>
      <Content>
        <header>化验单详情</header>
        <section className={styles['quailty-detail']}>
          <Skeleton loading={loading} paragraph={{ rows: 1 }}>
            <div className={styles.area}>
              <div className={styles.title}>
                <ChildTitle className="hei14">合同信息</ChildTitle>
              </div>
              <div className={styles.row}>
                <div className={styles.item}>
                  <span className={styles.label}>合作方：</span>
                  {data.cooperation || '-'}
                </div>
                <div className={styles.item}>
                  <span className={styles.label}>货品名称：</span>
                  {data.goodsName}
                </div>
                <div className={styles.item}></div>
              </div>
            </div>
          </Skeleton>

          <Skeleton loading={loading} paragraph={{ rows: 2 }}>
            <div className={styles.area}>
              <div className={styles.title}>
                <ChildTitle className="hei14">采样信息</ChildTitle>
              </div>
              <div className={styles.row}>
                <div className={styles.item}>
                  <span className={styles.label}>采样编号：</span>
                  {data.reportId}
                </div>

                <div className={styles.item}>
                  <span className={styles.label}>采样车辆：</span>
                  {data.plateNum || '-'}
                </div>

                <div className={styles.item}>
                  <span className={styles.label}>化验类型：</span>
                  <Status.Assay code={data.purchaseOrSale} />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.item}>
                  <span className={styles.label}>质检时间：</span>
                  {data.createdAt}
                </div>

                <div className={styles.item}>
                  <span className={styles.label}>质检员：</span>
                  {data.operator}
                </div>
                <div className={styles.item}></div>
              </div>
            </div>
          </Skeleton>

          <Skeleton loading={loading} paragraph={{ rows: 5 }}>
            <div className={styles.area}>
              <div className={styles.title}>
                <ChildTitle className="hei14">化验结果</ChildTitle>
              </div>
              <div className={styles.row}>
                <div className={styles.item}>
                  <span className={styles.label}>水分(% Mad)：</span>
                  {Format.percent(data.waterContent)}
                </div>
                <div className={styles.item}>
                  <span className={styles.label}>灰分(% Ad)：</span>
                  {Format.percent(data.ashContent)}
                </div>
                <div className={styles.item}>
                  <span className={styles.label}>挥发(% Vdaf)：</span>
                  {Format.percent(data.volatilization)}
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.item}>
                  <span className={styles.label}>焦渣特征(1-8 CRC)：</span>
                  {Format.percent(data.cinder) * 1}
                </div>
                <div className={styles.item}>
                  <span className={styles.label}>全硫(% Std)：</span>
                  {Format.percent(data.sulfur)}
                </div>
                <div className={styles.item}>
                  <span className={styles.label}>固定碳(% FCd)：</span>
                  {Format.percent(data.carbon)}
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.item}>
                  <span className={styles.label}>全水分(% Mt)：</span>
                  {Format.percent(data.totalWaterContent)}
                </div>
                <div className={styles.item}>
                  <span className={styles.label}>回收(% r)：</span>
                  {Format.percent(data.recovery)}
                </div>
                <div className={styles.item}>
                  <span className={styles.label}>发热量：</span>
                  {HOT[data.heat] || '-'}
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.item}>
                  <span className={styles.label}>粘结指数(GRI)：</span>
                  {Format.percent(data.bond)}
                </div>
                <div className={styles.item}>
                  <span className={styles.label}>胶质层(Y)：</span>
                  {Format.percent(data.colloid)}
                </div>
                <div className={styles.item}>
                  <span className={styles.label}>含矸石(%)：</span>
                  {Format.percent(data.stone)}
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.item}>
                  <span className={styles.label}>含精煤(%)：</span>
                  {Format.percent(data.cleanCoal)}
                </div>
                <div className={styles.item}>
                  <span className={styles.label}>含中煤(%)：</span>
                  {Format.percent(data.midCoal)}
                </div>
                <div className={styles.item}></div>
              </div>
            </div>
          </Skeleton>

          <Skeleton loading={loading} paragraph={{ rows: 1 }}>
            {data.samplingData && data.samplingData.length > 0 && (
              <div className={styles.area}>
                <div className={styles.title}>
                  <ChildTitle className="hei14">采样煤种</ChildTitle>
                </div>
                <div className={styles.row} style={{ flexWrap: 'wrap' }}>
                  {data.samplingData.map(item => (
                    <div className={styles.item} style={{ minWidth: '33%', flex: 1 }}>
                      <span className={styles.label}>{item.goodsName}：</span>
                      {item.samplingWeight * 1} g
                    </div>
                  ))}
                  {data.samplingData.length % 3 > 0 && <div className={styles.item}></div>}
                </div>
              </div>
            )}
          </Skeleton>
        </section>
      </Content>
    </Layout>
  );
};

export default QualityDetail;
