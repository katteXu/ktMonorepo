/** @format */

import React, { PureComponent } from 'react';
import { Layout, Content, Status } from '@components';
import { Row, Col, Button, Skeleton, Modal, Divider } from 'antd';
import Link from 'next/link';
import { transportStatistics, getPrivateUrl } from '@api';
import moment from 'moment';
import styles from './styles.less';
import Trace from '@components/Transport/trace';
const defaultImg = './empty.png';

const payMethodStatus = {
  1: '按发货净重结算',
  0: '按收货净重结算',
  2: '按原发与实收较小的结算',
};
class TransportDetail extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      routeView: {
        title: '运单详情',
        pageKey: 'agent/transportStatistics',
        longKey: 'agent/transportStatistics',
        // breadNav: '运单明细.运单详情',
        breadNav: [
          <Link href="/agent/transportStatistics">
            <a>运单明细</a>
          </Link>,
          '运单详情',
        ],
        useBack: true,
        pageTitle: '运单详情',
      },
      endWeight: 0,
      price: 0,
      realTotalPrice: 0,
      lossData: 0,
      lossAmount: '-',
      time: 0,
      unit: '吨',
      goodsUnitPrice: 0,
      unitPrice: 0,
      route: {
        fromAddress: {},
        toAddress: {},
      },
      trucker: {},
      orderNo: '',
      createdAt: '',
      goodsType: '',
      status: '',
      loading: true,
      mapData: [],
      poundVisible: false,

      leaderName: '',
      leaderMobilePhone: '',
    };
  }

  componentDidMount() {
    this.getData();
  }

  showPoundPic = () => {
    this.setState({
      poundVisible: true,
    });
  };

  getData = async () => {
    const { id } = getQuery();
    const params = {
      id,
    };
    const res = await transportStatistics.getDetail({ params });

    const {
      goodsWeight,
      loss,
      price,
      realTotalPrice,
      route,
      createdAt,
      updatedAt,
      goodsUnitPrice,
      unitPrice,
      trucker,
      orderNo,
      goodsType,
      status,
      deliverPoundPic,
      receivePoundPic,
      leaderName,
      leaderMobilePhone,
      owner,
      applyCancelType,
    } = res.result;

    // 计算时间差
    const interval = moment(updatedAt).diff(createdAt);

    const M = moment.duration(interval).get('minutes');
    const D = moment.duration(interval).get('days');
    const H = moment.duration(interval).get('hours');
    let time = '';
    if (D) time += `${D}天`;
    if (H) time += `${H}小时`;
    if (M) time += `${M}分钟`;

    let unit = route.unitName || '吨';

    this.setState({
      unit,
      endWeight: ((goodsWeight - loss) / 1000).toFixed(unit === '吨' ? 2 : 0),
      price: (price / 100).toFixed(2),
      realTotalPrice: (realTotalPrice / 100).toFixed(2),
      lossData: (loss / 1000).toFixed(unit === '吨' ? 2 : 0),
      lossAmount: route.lossMark ? `${route.lossAmount} ${unit}` : '已关闭',
      time: time || '0分钟',
      route,
      goodsUnitPrice: `${(goodsUnitPrice / 100).toFixed(2)}元`,
      unitPrice: `${(unitPrice / 100).toFixed(2)} 元`,
      trucker,
      orderNo,
      createdAt,
      goodsType,
      status,
      loading: false,
      mapData: [
        {
          latitude: route.fromAddress.latitude,
          longitude: route.fromAddress.longitude,
        },
        {
          latitude: route.toAddress.latitude,
          longitude: route.toAddress.longitude,
        },
      ],
      // deliverPoundPic,
      // receivePoundPic,
      leaderName,
      leaderMobilePhone,
      companyName: owner ? owner.companyName || owner.name : '',
      applyCancelType,
    });

    // 图片加签
    const url = [deliverPoundPic, receivePoundPic];
    getPrivateUrl({
      params: { url },
    }).then(res => {
      if (res.status === 0) {
        this.setState({
          deliverPoundPic: res.result[deliverPoundPic],
          receivePoundPic: res.result[receivePoundPic],
        });
      }
    });
  };

  render() {
    const {
      routeView,
      endWeight,
      price,
      realTotalPrice,
      lossData,
      lossAmount,
      time,
      unit,
      route,
      goodsUnitPrice,
      unitPrice,
      trucker,
      orderNo,
      createdAt,
      goodsType,
      status,
      loading,
      mapData,
      poundVisible,
      deliverPoundPic,
      receivePoundPic,
      leaderName,
      leaderMobilePhone,
      companyName,
      applyCancelType,
    } = this.state;

    return (
      <Layout {...routeView}>
        {/* <Row>
          <Col style={{ float: 'right' }}>
            <Button type="primary" onClick={() => router.back()}>
              返回
            </Button>
          </Col>
        </Row> */}
        <Row gutter={12} style={{ marginTop: 12 }} type="flex">
          <Col span={8}>
            <Content>
              <header className={styles.contentHeader}>
                <Skeleton active loading={loading} paragraph={{ rows: 0 }}>
                  <span>{trucker.trailerPlateNumber}</span>
                  <span>{Status.order[applyCancelType != 0 ? 'APPLY_CANCEL' : status]}</span>
                </Skeleton>
              </header>
              <section>
                <Skeleton active loading={loading} paragraph={{ rows: 5 }}>
                  <div className="info-row">
                    <span className="info-label">运费：</span>
                    <span className="info-data">{price} 元</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">实付金额：</span>
                    <span className="info-data">
                      {status === 'DONE' ? (realTotalPrice === '0.00' ? price : realTotalPrice) : realTotalPrice} 元
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">净重：</span>
                    <span className="info-data">
                      {endWeight} {unit}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">路损：</span>
                    <span className="info-data">
                      {lossData} {unit}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">运货耗时：</span>
                    <span className="info-data">{time}</span>
                  </div>

                  <Divider dashed />

                  <Row className={`${styles['transport-row']}`} style={{ marginTop: 80 }}>
                    <Button style={{ float: 'right' }} onClick={this.showPoundPic}>
                      查看磅单
                    </Button>
                  </Row>
                </Skeleton>
              </section>
            </Content>
          </Col>
          <Col span={16}>
            <Content>
              <header>
                <span>专线信息</span>
                <span
                  style={{
                    fontSize: 14,
                    color: '#ccc',
                    float: 'right',
                    lineHeight: '34px',
                  }}>
                  运单号：{orderNo}
                  <span style={{ marginLeft: 10 }}>{createdAt}生成</span>
                </span>
              </header>
              <section>
                <Skeleton active loading={loading} paragraph={{ rows: 5 }}>
                  <div className="info-row">
                    <span className="info-label">专线号：</span>
                    <span className="info-data">{route.id}</span>
                    <span style={{ float: 'right' }} className={styles['good-type']}>
                      {goodsType}
                    </span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">发货企业：</span>
                    <span className="info-data">{route.fromAddress.companyName}</span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">收货企业：</span>
                    <span className="info-data">{route.toAddress.companyName}</span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">有效时间：</span>
                    <span className="info-data">
                      {route.startLoadTime} ~ {route.lastLoadTime}
                    </span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">运费单价：</span>
                    <span className="info-data">
                      {unitPrice}/{unit}
                    </span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">结算方式：</span>
                    <span className="info-data">{payMethodStatus[route.payMethod] || '-'}</span>
                  </div>

                  <Divider dashed />

                  <div className="info-row">
                    <span className="info-label">个位抹零：</span>
                    <span className="info-data">{route.eraseZero ? '已开启' : '已关闭'}</span>
                    <span className="info-label">车队长姓名：</span>
                    <span className="info-data" style={{ minWidth: 120 }}>
                      {leaderName || '-'}
                    </span>
                    <span className="info-label">所属企业：</span>
                    <span
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: 120,
                        display: 'inline-block',
                        verticalAlign: 'bottom',
                      }}>
                      {companyName || ''}
                    </span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">允许路损：</span>
                    <span className="info-data">{lossAmount}</span>
                    <span className="info-label">车队长账号：</span>
                    <span className="info-data">{leaderMobilePhone || '-'}</span>
                  </div>
                </Skeleton>
              </section>
            </Content>
          </Col>
        </Row>
        <Content style={{ marginTop: 12 }}>
          <header>货运追踪</header>
          <section>
            <Trace trucker={trucker} mapData={mapData}></Trace>
          </section>
        </Content>

        <Modal
          visible={poundVisible}
          onCancel={() => this.setState({ poundVisible: false })}
          width={620}
          title="磅单照片"
          footer={null}>
          <Row gutter={12}>
            <Col span={12}>
              <p>发货磅单</p>
              <img style={{ width: '100%', height: 300 }} src={deliverPoundPic || defaultImg} alt="" />
            </Col>
            <Col span={12}>
              <p>收货磅单</p>
              <img style={{ width: '100%', height: 300 }} src={receivePoundPic || defaultImg} alt="" />
            </Col>
          </Row>
        </Modal>
      </Layout>
    );
  }
}

export default TransportDetail;
