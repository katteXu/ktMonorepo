import { QuestionCircleFilled } from '@ant-design/icons';
import { Skeleton, Modal, message, Button, Tooltip } from 'antd';
import { Component } from 'react';
import { Status } from '@components';
// import SetLoadTimeForm from './SetLoadTimeForm';
// import SetTotalAmountForm from './SetTotalAmountForm';
import UpdateSendDate from './updateSendDate';
import UpdateUnitPrice from './updateUnitPrice';
import UpdateTotalWeight from './updateTotalWeight';
import UpdateLeavingAmount from './updateLeavingAmount';
import { railWay } from '@api';
import styles from './styles.less';
import moment from 'moment';
import { getQuery } from '@utils/common';

const payMethodStatus = {
  1: '按发货净重结算',
  0: '按收货净重结算',
  2: '按原发与实收较小的结算',
};
// const getRouteInfo = async rid => {
//   return railWay.railWayDetail({ params: { id: rid } });
// };

export default class extends Component {
  state = {
    setLoadTimeVisible: false,
    setLoadTiming: false,
    setTotalAmountVisible: false,
    setTotalAmounting: false,
    _date: '',
    _unitPrice: '',
    _totalAmount: '',
  };

  setLoadTimeFormRef = null;
  setTotalAmountRef = null;

  // 修改时间之前的回调
  // handleBeforeSetTime = () => {
  //   const {
  //     routeInfo: { startLoadTime },
  //   } = this.props;
  //   if (startLoadTime) {
  //     // 已经设置过了专线起点
  //   }
  //   this.setState({ setLoadTimeVisible: true });
  // };

  // 修改时间的回调
  // handleSetTime = async (setBegin, setEnd) => {
  //   this.setState({ setLoadTiming: true });

  //   let params = { rid: getQuery().id };
  //   setBegin && (params.start = setBegin);
  //   setEnd && (params.end = setEnd);
  //   const { status, detail, description } = await railWay.modifyDeliverGoodsTime(params);

  //   if (!status) {
  //     message.success('修改成功', () => {
  //       this.setLoadTimeFormRef.resetFields();
  //       this.props.setRailWayDetail();
  //       this.setState({
  //         setLoadTimeVisible: false,
  //         setLoadTiming: false,
  //       });
  //     });
  //   } else {
  //     message.error(detail || description, 1, () => {
  //       this.setState({
  //         setLoadTiming: false,
  //       });
  //     });
  //   }
  // };

  // 取消修改时间的回调
  // handleCancelSetTime = () => {
  //   this.setState({ setLoadTimeVisible: false });
  //   this.setLoadTimeFormRef.resetFields();
  // };

  // 修改货物总量的回调
  // handleSetTotalAmount = async newTotalAmount => {
  //   console.log('newTotalAmount ...', newTotalAmount);
  //   this.setState({ setTotalAmounting: true });
  //   const { status, detail, description } = await railWay.modifyTotalGoodsWeight({
  //     rid: getQuery().id,
  //     totalAmount: (newTotalAmount * 1000).toFixed(0),
  //   });

  //   if (!status) {
  //     message.success('修改成功', 1, () => {
  //       this.setTotalAmountRef.resetFields();
  //       this.props.setRailWayDetail();
  //       this.setState({
  //         setTotalAmountVisible: false,
  //         setTotalAmounting: false,
  //       });
  //     });
  //   } else {
  //     message.error(detail || description, () => {
  //       this.setState({
  //         setTotalAmounting: false,
  //       });
  //     });
  //   }
  // };

  // 取消修改货物总量
  // handleCancelSetTotalAmount = () => {
  //   this.setState({ setTotalAmountVisible: false });
  //   this.setTotalAmountRef.resetFields();
  // };

  // 修改发货时间
  modifySendDate = async value => {
    const { loadTime } = value;
    const params = {
      rid: getQuery().id,
      start: moment(loadTime[0]).format('YYYY-MM-DD HH:mm:ss'),
      end: moment(loadTime[1]).format('YYYY-MM-DD HH:mm:ss'),
    };

    const res = await railWay.modifyDeliverGoodsTime(params);
    if (res.status === 0) {
      message.success('修改成功');
      this.setState({
        _date: `${moment(loadTime[0]).format('YYYY-MM-DD HH:mm:ss')}-${moment(loadTime[1]).format(
          'YYYY-MM-DD HH:mm:ss'
        )}`,
        showSendDate: false,
      });
    } else {
      message.error(res.detail ? res.detail : res.description);
    }
  };

  // 修改运费单价
  modifyUnitPrice = async value => {
    const { unitPrice } = value;
    const params = {
      rid: getQuery().id,
      unitPrice: (unitPrice * 100).toFixed(),
    };

    const res = await railWay.modifyUnitPrice({ params });

    if (res.status === 0) {
      message.success('修改成功');
      this.setState({
        _unitPrice: (unitPrice * 1).toFixed(2),
        showUnitPrice: false,
      });
    } else {
      console.error(`${res.description}`);
      message.error(res.detail ? res.detail : res.description);
    }
  };

  // 修改货物总量
  modifyTotalWeight = async value => {
    const { totalAmount } = value;

    const params = {
      rid: getQuery().id,
      totalAmount: totalAmount * 1000,
    };

    const res = await railWay.modifyTotalGoodsWeight(params);
    if (res.status === 0) {
      message.success('修改成功');
      this.setState({
        _totalAmount: (totalAmount * 1).toFixed(2),
        showTotalWeight: false,
      });
    } else {
      console.error(`${res.description}`);
      message.error(res.detail ? res.detail : res.description);
    }
  };

  // 修改余量提醒
  modifyLeavingAmount = async value => {
    const { isLeavingAmount, ruleLeavingAmount, routeContactMobile } = value;

    const params = {
      id: getQuery().id,
      isLeavingAmount,
      ruleLeavingAmount: ruleLeavingAmount ? (ruleLeavingAmount * 1000).toFixed() : undefined,
      routeContactMobile: routeContactMobile || undefined,
    };

    const res = await railWay.modifyLeavingAmount({ params });
    if (res.status === 0) {
      message.success('修改成功');
      this.setState({
        _isLeavingAmount: !!isLeavingAmount,
        _ruleLeavingAmount: ruleLeavingAmount * 1000,
        _routeContactMobile: routeContactMobile,
        showLeavingAmount: false,
      });
    } else {
      message.error(res.detail ? res.detail : res.description);
    }
  };

  render() {
    const {
      id,
      fromAddress,
      toAddress,
      totalAmount,
      transportType,
      goodsUnitPrice,
      unitPrice,
      unitName,
      lossMark,
      lossAmount,
      goodsType,
      loading,
      fleetCaption,
      payMethod,
      eraseZero,
      status,
      remark,
      fromCompany = {},
      toCompany = {},
      startLoadTime,
      lastLoadTime,
      settlementMoney,
      sendTotalWeight,
      receiveTotalWeight,
      carCount,
      isLeavingAmount,
      ruleLeavingAmount,
      routeContactMobile,
      sendAmount,
    } = this.props.routeInfo;
    let {
      showSendDate,
      showUnitPrice,
      showTotalWeight,
      showLeavingAmount,
      _date,
      _unitPrice,
      _totalAmount,
      _isLeavingAmount = isLeavingAmount,
      _ruleLeavingAmount = ruleLeavingAmount,
      _routeContactMobile = routeContactMobile,
    } = this.state;
    const loadTime = _date || (startLoadTime && lastLoadTime ? `${startLoadTime}-${lastLoadTime}` : '-');
    const price = _unitPrice || unitPrice;
    const weight = _totalAmount || (totalAmount / 1000).toFixed(2);

    // _isLeavingAmount = _isLeavingAmount || isLeavingAmount;
    // _ruleLeavingAmount = _ruleLeavingAmount || ruleLeavingAmount;
    // _routeContactMobile = _routeContactMobile || routeContactMobile;

    return (
      <>
        <header>
          专线详情 <span style={{ color: '#848485' }}>{remark ? `（${remark}）` : ''}</span>
          <span style={{ float: 'right' }}>{Status.route[status]}</span>
        </header>
        <section>
          <div className={styles['rail-detail']}>
            <Skeleton active loading={!loading} paragraph={{ rows: 7 }}>
              {/* 左侧 */}
              <div className={styles.left}>
                <div className="info-row">
                  <span className="info-label">专线号：</span>
                  <span className="info-data">{id || '-'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">发货企业：</span>
                  <span className="info-data">{fromCompany.companyName || '-'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">发货地址：</span>
                  <span className="info-data">
                    {fromAddress.id
                      ? `${fromAddress.province}${fromAddress.city}${fromAddress.district}${fromAddress.detailAddress}`
                      : '-'}
                  </span>
                </div>

                <div className="info-row">
                  <span className="info-label">收货企业：</span>
                  <span className="info-data">{toCompany.companyName || '-'}</span>
                </div>

                <div className="info-row">
                  <span className="info-label">收货地址：</span>
                  <span className="info-data">
                    {toAddress.id
                      ? `${toAddress.province}${toAddress.city}${toAddress.district}${toAddress.detailAddress}`
                      : '-'}
                  </span>
                </div>

                <div className="info-row">
                  <span className="info-label">发货时间：</span>
                  <span className="info-data">{loadTime}</span>
                  <Button type="link" onClick={() => this.setState({ showSendDate: true })}>
                    修改
                  </Button>
                </div>

                <div className="info-row">
                  <span className="info-label">结算方式：</span>
                  <span className="info-data">{payMethod !== undefined ? payMethodStatus[payMethod] : '-'}</span>
                </div>

                <div className="info-row">
                  <span className="info-label">发货联系人：</span>
                  <span className="info-data">
                    {fromAddress.contactName ? `${fromAddress.contactName} ${fromAddress.contactMobile}` : '-'}
                  </span>
                </div>

                <div className="info-row">
                  <span className="info-label">收货联系人：</span>
                  <span className="info-data">
                    {toAddress.contactName ? `${toAddress.contactName} ${toAddress.contactMobile}` : '-'}
                  </span>
                </div>

                <div className="info-row">
                  <span className="info-label">收货联系人：</span>
                  <span className="info-data">
                    {toAddress.contact2Name ? `${toAddress.contact2Name} ${toAddress.contact2Mobile}` : '-'}
                  </span>
                </div>

                <div className="info-row">
                  <span className="info-label">车队长：</span>
                  <span className="info-data">
                    {fleetCaption.name ? `${fleetCaption.name} ${fleetCaption.mobilePhoneNumber || '-'}` : '-'}
                  </span>
                </div>

                <div className="info-row">
                  <span className="info-label">
                    余量提醒：
                    <Tooltip
                      placement="right"
                      overlayStyle={{
                        maxWidth: 'max-content',
                        padding: '0 10px',
                      }}
                      title={
                        <div>
                          <div>1. 使用开票专线时, 余量会在发货磅单产生时更新.</div>
                          <div>发货磅单产生方式: 使用电子磅单功能或司机手动上传.</div>
                          <div>2. 使用磅室专线时, 余量会在车辆发货出站时更新.</div>
                          <div>客服: 400-690-8700</div>
                        </div>
                      }>
                      <QuestionCircleFilled style={{ cursor: 'pointer' }} />
                    </Tooltip>
                  </span>
                  <span className="info-data">
                    {_isLeavingAmount ? '已开启' : _isLeavingAmount === false ? '已关闭' : '-'}
                    <Button type="link" onClick={() => this.setState({ showLeavingAmount: true })}>
                      修改
                    </Button>
                  </span>
                </div>
              </div>
              {/* 右侧 */}
              <div className={styles.right}>
                <div className="info-row">
                  <span className="info-label">货品名称：</span>
                  <span className="info-data" style={{ verticalAlign: 'top' }}>
                    <Tooltip title={goodsType} overlayStyle={{ maxWidth: 'max-content' }}>
                      <div className="max-label" style={{ width: 150 }}>
                        {goodsType || '-'}
                      </div>
                    </Tooltip>
                  </span>
                </div>

                <div className="info-row">
                  <span className="info-label">运费单价：</span>
                  <span className="info-data">
                    {price ? `${price} 元/${unitName}` : '-'}
                    <Button type="link" onClick={() => this.setState({ showUnitPrice: true })}>
                      修改
                    </Button>
                  </span>
                </div>

                <div className="info-row">
                  <span className="info-label">货运方式：</span>
                  <span className="info-data">{transportType}</span>
                </div>

                <div className="info-row">
                  <span className="info-label">货物单价：</span>
                  <span className="info-data">{goodsUnitPrice ? `${goodsUnitPrice} 元/${unitName}` : '-'}</span>
                </div>

                <div className="info-row">
                  <span className="info-label">货物总量：</span>
                  <span className="info-data">
                    {weight ? `${weight} ${unitName}` : '-'}
                    <Button type="link" onClick={() => this.setState({ showTotalWeight: true })}>
                      修改
                    </Button>
                  </span>
                </div>

                <div className="info-row">
                  <span className="info-label">个位抹零：</span>
                  <span className="info-data">{eraseZero !== undefined ? (eraseZero ? '已开启' : '已关闭') : '-'}</span>
                </div>

                <div className="info-row">
                  <span className="info-label">允许路损：</span>
                  <span className="info-data">
                    {lossMark !== undefined
                      ? lossMark
                        ? `${(lossAmount / 1000).toFixed(2)} ${unitName}`
                        : '已关闭'
                      : '-'}
                  </span>
                </div>

                <div className="info-row">
                  <span className="info-label" style={{ padding: 0 }}>
                    已结算运费总额：
                    <Tooltip placement="right" title="所有已完成状态的实际支付金额总和">
                      <QuestionCircleFilled style={{ cursor: 'pointer' }} />
                    </Tooltip>
                  </span>
                  <span className="info-data">
                    {settlementMoney ? `${(settlementMoney / 100).toFixed(2)} 元` : '-'}
                  </span>
                </div>

                <div className="info-row">
                  <span className="info-label">运单数量：</span>
                  <span className="info-data">{carCount} 个</span>
                </div>

                <div className="info-row">
                  <span className="info-label">
                    收货总吨数：
                    <Tooltip placement="right" title="全部待结算、已完成运单的收货货物总重量">
                      <QuestionCircleFilled style={{ cursor: 'pointer' }} />
                    </Tooltip>
                  </span>
                  <span className="info-data">
                    {receiveTotalWeight ? `${(receiveTotalWeight / 1000).toFixed(2)} 吨` : '-'}
                  </span>
                </div>

                <div className="info-row">
                  <span className="info-label">
                    发货总吨数：
                    <Tooltip placement="right" title="全部待结算、已完成运单的发货货物总重量">
                      <QuestionCircleFilled style={{ cursor: 'pointer' }} />
                    </Tooltip>
                  </span>
                  <span className="info-data">
                    {sendTotalWeight ? `${(sendTotalWeight / 1000).toFixed(2)} 吨` : '-'}
                  </span>
                </div>
              </div>

              {/* 修改发货时间 */}
              <Modal
                title="修改发货时间"
                width={600}
                visible={showSendDate}
                destroyOnClose
                onCancel={() => this.setState({ showSendDate: false })}
                footer={null}>
                <UpdateSendDate
                  initValue={loadTime}
                  startLoadTime={startLoadTime}
                  endLoadTime={lastLoadTime}
                  onSubmit={value => this.modifySendDate(value)}
                  onClose={() => this.setState({ showSendDate: false })}
                />
              </Modal>

              {/* 修改运费单价 */}
              <Modal
                title="修改运费单价"
                visible={showUnitPrice}
                destroyOnClose
                onCancel={() => this.setState({ showUnitPrice: false })}
                footer={null}>
                <UpdateUnitPrice
                  initValue={price}
                  onSubmit={value => this.modifyUnitPrice(value)}
                  onClose={() => this.setState({ showUnitPrice: false })}
                />
              </Modal>

              {/* 修改货物总量 */}
              <Modal
                title="修改货物总量"
                visible={showTotalWeight}
                destroyOnClose
                onCancel={() => this.setState({ showTotalWeight: false })}
                footer={null}>
                <UpdateTotalWeight
                  initValue={sendAmount}
                  onSubmit={value => this.modifyTotalWeight(value)}
                  onClose={() => this.setState({ showTotalWeight: false })}
                />
              </Modal>

              {/* 修改余量提醒 */}
              <Modal
                title="余量提醒"
                visible={showLeavingAmount}
                destroyOnClose
                onCancel={() => this.setState({ showLeavingAmount: false })}
                footer={null}>
                <UpdateLeavingAmount
                  initValue={{
                    isLeavingAmount: _isLeavingAmount,
                    ruleLeavingAmount: _ruleLeavingAmount,
                    routeContactMobile: _routeContactMobile,
                  }}
                  onSubmit={value => this.modifyLeavingAmount(value)}
                  onClose={() => this.setState({ showLeavingAmount: false })}
                />
              </Modal>
            </Skeleton>
          </div>
        </section>
      </>
    );
  }
}
