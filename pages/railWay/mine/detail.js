/** @format */

import { useState, useEffect } from 'react';
import router from 'next/router';
import Link from 'next/link';
import OrderTable from '@components/RailDetail/table';
import styles from '../styles.less';
import { Layout, Content, Status, ChildTitle } from '@components';
import { railWay } from '@api';
import { QuestionCircleFilled } from '@ant-design/icons';
import { Button, Modal, message, Skeleton, Tooltip, Tag, Input } from 'antd';
import UpdateSendDate from '@components/RailDetail/updateSendDate';
import UpdateTotalWeight from '@components/RailDetail/updateTotalWeight';
import UpdateLeavingAmount from '@components/RailDetail/updateLeavingAmount';
import { Permission } from '@store';
import { getQuery, Format } from '@utils/common';
import moment from 'moment';
const payMethodStatus = {
  1: '按发货净重结算',
  0: '按收货净重结算',
  2: '按原发与实收较小的结算',
};

const RailWayDetail = props => {
  const { permissions } = Permission.useContainer();
  const routeView = {
    title: '专线详情',
    pageKey: 'mine',
    longKey: 'railWay.mine',
    breadNav: [
      '专线管理',
      <Link href="/railWay/mine">
        <a>开票专线</a>
      </Link>,
      '专线详情',
    ],
    pageTitle: '专线详情',
    useBack: true,
  };

  const [loading, setLoading] = useState(false);

  const [unitPrice, setUnitPrice] = useState(0);
  const [showUnitPrice, setShowUnitPrice] = useState(false);
  const [showTotalWeight, setShowTotalWeight] = useState(false);
  const [dataInfo, setDataInfo] = useState({});
  const [totalAmount, setTotalAmount] = useState(0);
  const [isLeavingAmount, setIsLeavingAmount] = useState();
  const [showLeavingAmount, setShowLeavingAmount] = useState(false);
  const [ruleLeavingAmount, setRuleLeavingAmount] = useState(0);
  const [routeContactMobile, setRouteContactMobile] = useState('');
  const [status, setStatus] = useState('');
  const [showSendDate, setShowSendDate] = useState(false);
  const [startLoadTime, setStartLoadTime] = useState('');
  const [lastLoadTime, setLastLoadTime] = useState('');
  const [_date, set_date] = useState('');
  const [isMyRoute, setIsMyRoute] = useState(false);
  const [newUnitPrice, setNewUnitPrice] = useState(0);

  useEffect(() => {
    setRailWayDetail();
  }, []);

  // 专线详情 && 运单详情
  const setRailWayDetail = async props => {
    const { id } = getQuery();
    const params = {
      id,
    };

    const res = await railWay.railWayDetail({ params });

    if (res.status === 0) {
      setDataInfo(res.result);
      setUnitPrice(res.result.unitPrice && (res.result.unitPrice / 100).toFixed(2));
      setTotalAmount(res.result.totalAmount);
      setIsLeavingAmount(res.result.isLeavingAmount);
      setStatus(res.result.status);
      setStartLoadTime(res.result.startLoadTime);
      setLastLoadTime(res.result.lastLoadTime);

      setIsMyRoute(res.result.is_my_route);

      setRuleLeavingAmount(res.result.ruleLeavingAmount);
      setRouteContactMobile(res.result.routeContactMobile);
    } else {
      message.error(`${res.detail || res.description}`);
    }
    setLoading(true);
  };

  // 关闭/开启专线
  const setRailWayStatus = () => {
    const content =
      status === 'CLOSE' ? '' : <p style={{ marginTop: 12 }}>关闭后此专线将不能被抢单，但不会影响已抢运单</p>;
    Modal.confirm({
      title: `是否${status === 'CLOSE' ? '开启' : '关闭'}此专线？`,
      icon: <QuestionCircleFilled />,
      content,
      onOk: status === 'CLOSE' ? openLine : closeLine,
    });
  };

  // 恢复专线
  const openLine = async () => {
    const { id } = getQuery();
    const params = {
      rid: id,
    };
    const res = await railWay.openLine({ params });
    if (res.status === 0) {
      message.success('专线开启成功');
      router.push('/railWay/mine');
    } else {
      message.error(`专线开启失败，原因：${res.detail ? res.detail : res.description}`);
    }
  };

  // 关停专线
  const closeLine = async () => {
    const { id } = getQuery();
    const params = {
      rid: id,
    };
    const res = await railWay.closeLine({ params });
    if (res.status === 0) {
      message.success('专线关闭成功');
      router.push('/railWay/mine');
    } else {
      message.error(`专线关闭失败，原因：${res.detail ? res.detail : res.description}`);
    }
  };

  const deleteLine = () => {
    const { id } = getQuery();
    const params = {
      ids: id,
    };

    Modal.confirm({
      title: '是否删除此专线？',
      content: '删除后不影响此专线的已抢运单',
      icon: <QuestionCircleFilled />,
      okType: 'danger',
      onOk: async () => {
        const res = await railWay.delRailWay({ params });
        if (res.status === 0) {
          message.success('专线删除成功');
          router.back();
        } else {
          message.error(`专线删除失败，原因：${res.detail ? res.detail : res.description}`);
        }
      },
    });
  };

  // 修改发货时间
  const modifySendDate = async value => {
    const { loadTime } = value;
    const params = {
      rid: getQuery().id,
      start: moment(loadTime[0]).format('YYYY-MM-DD HH:mm:ss'),
      end: moment(loadTime[1]).format('YYYY-MM-DD HH:mm:ss'),
    };

    const res = await railWay.modifyDeliverGoodsTime(params);
    if (res.status === 0) {
      message.success('有效时间修改成功');
      set_date(
        `${moment(loadTime[0]).format('YYYY-MM-DD HH:mm:ss')} - ${moment(loadTime[1]).format('YYYY-MM-DD HH:mm:ss')}`
      );
      setShowSendDate(false);
    } else {
      message.error(`有效时间修改失败，原因：${res.detail ? res.detail : res.description}`);
    }
  };

  // 修改运费单价
  const modifyUnitPrice = async () => {
    const params = {
      rid: getQuery().id,
      unitPrice: ((newUnitPrice ? newUnitPrice : unitPrice) * 100).toFixed(),
    };

    const res = await railWay.modifyUnitPrice({ params });

    if (res.status === 0) {
      message.success('运费单价编辑成功');
      setUnitPrice((newUnitPrice * 1).toFixed(2));
      setShowUnitPrice(false);
    } else {
      message.error(`运费单价编辑失败，原因：${res.detail ? res.detail : res.description}`);
    }
  };

  // 修改货物总量
  const modifyTotalWeight = async value => {
    const { totalAmount } = value;

    const params = {
      rid: getQuery().id,
      totalAmount: totalAmount * 1000,
    };

    const res = await railWay.modifyTotalGoodsWeight(params);
    if (res.status === 0) {
      message.success('货物总量编辑成功');
      setTotalAmount(totalAmount * 1000);
      setShowTotalWeight(false);
    } else {
      message.error(`货物总量编辑失败，原因：${res.detail ? res.detail : res.description}`);
    }
  };

  // 修改余量提醒
  const modifyLeavingAmount = async value => {
    const { isLeavingAmount, ruleLeavingAmount, routeContactMobile } = value;

    const params = {
      id: getQuery().id,
      isLeavingAmount,
      ruleLeavingAmount: ruleLeavingAmount ? (ruleLeavingAmount * 1000).toFixed() : undefined,
      routeContactMobile: routeContactMobile || undefined,
    };

    const res = await railWay.modifyLeavingAmount({ params });
    if (res.status === 0) {
      message.success('余量提醒编辑成功');
      setIsLeavingAmount(!!isLeavingAmount);
      setRuleLeavingAmount(ruleLeavingAmount ? (ruleLeavingAmount * 1000).toFixed() : undefined);
      setRouteContactMobile(routeContactMobile);
      setShowLeavingAmount(false);
    } else {
      message.error(`余量提醒编辑失败，原因：${res.detail ? res.detail : res.description}`);
    }
  };

  const loadTime = _date || (startLoadTime && lastLoadTime ? `${startLoadTime}  -  ${lastLoadTime}` : '-');
  const canEdit = status !== 'DELETE' && (isMyRoute || permissions.includes('ROUTE_MODIFY'));

  return (
    <Layout {...routeView}>
      <Content>
        <header>
          专线信息
          {loading && (
            <Tag
              color={Status.route[status] && Status.routeColor[status].bg}
              style={{
                marginLeft: 10,
                color: Status.route[status] && Status.routeColor[status].color,
                borderColor: Status.route[status] && Status.routeColor[status].color,
                fontWeight: 400,
                position: 'relative',
                bottom: 1,
              }}>
              {Status.route[status]}
            </Tag>
          )}
          <Tag
            color={dataInfo.fleetCaptionId ? '#FFF5F5' : '#F5F9FF'}
            style={{
              color: dataInfo.fleetCaptionId ? '#e44040' : '#477AEF',
              borderColor: dataInfo.fleetCaptionId ? '#e44040' : '#477AEF',
              fontWeight: 400,
              position: 'relative',
              bottom: 1,
            }}>
            {dataInfo.fleetCaptionId ? '车队单' : '个人单'}
          </Tag>
          {dataInfo.fleetCaptionId && (
            <Tag
              color={dataInfo.payPath === 0 ? '#FFFBF4' : '#f5fff8'}
              style={{
                color: dataInfo.payPath === 0 ? '#FFB741' : '#66db7e',
                borderColor: dataInfo.payPath === 0 ? '#FFB741' : '#66db7e',
                fontWeight: 400,
                position: 'relative',
                bottom: 1,
              }}>
              {dataInfo.payPathZn}
            </Tag>
          )}
          {canEdit && (
            <div style={{ float: 'right' }}>
              <Button
                style={{ padding: '4px 0', color: '#477AEF', border: 'none', boxShadow: 'none' }}
                loading={!status}
                type="link"
                onClick={setRailWayStatus}>
                {status === 'CLOSE' ? '开启' : '关闭'}专线
              </Button>
              <Button
                style={{
                  marginLeft: 12,
                  padding: '4px 0',
                  color: '#477AEF',
                  border: 'none',
                  boxShadow: 'none',
                }}
                onClick={deleteLine}>
                删除专线
              </Button>
            </div>
          )}
        </header>
        <section className={styles['railWay-detail']}>
          <Skeleton loading={!loading} paragraph={{ rows: 3 }}>
            <div className={styles.area} style={{ marginBottom: 8, marginTop: 0 }}>
              <div className={styles.row}>
                <div className={styles.item}>
                  <span className={styles.label}>车队长：</span>
                  {dataInfo.fleetCaption &&
                    (dataInfo.fleetCaption.name
                      ? `${dataInfo.fleetCaption.name} ${dataInfo.fleetCaption.mobilePhoneNumber || '-'}`
                      : '-')}
                </div>
                <div className={styles.item} style={{ flex: dataInfo.businessType === 2 ? 1 : 1.5 }}>
                  <span className={styles.label}>有效时间：</span>
                  <span style={{ marginRight: 9 }}>{loadTime}</span>
                  {canEdit && startLoadTime && (
                    <span
                      style={{
                        color: '#477AEF',
                        cursor: 'pointer',
                        wordBreak: 'keep-all',
                      }}
                      onClick={() => setShowSendDate(true)}>
                      编辑
                    </span>
                  )}
                </div>
                {dataInfo.businessType === 2 && (
                  <div className={styles.item}>
                    <span className={styles.label}>业务类型：</span>
                    {'上站业务'}
                  </div>
                )}
                {dataInfo.businessType !== 2 && <div className={styles.item} style={{ flex: 0.5 }}></div>}
              </div>
            </div>
          </Skeleton>
          <Skeleton loading={!loading} paragraph={{ rows: 3 }}>
            <div className={styles.area}>
              <ChildTitle
                className="hei14"
                style={{
                  color: '#333333',
                  fontSize: '14px',
                  fontWeight: 600,
                  marginBottom: '8px',
                }}>
                <div>路线信息</div>
              </ChildTitle>
              <div className={styles.row}>
                <div className={styles.item}>
                  <span className={styles.label}>发货企业：</span>
                  {(dataInfo.fromAddressCompany && dataInfo.fromAddressCompany.companyName) || '-'}
                </div>
                <div className={styles.item}>
                  <span className={styles.label}>发货地址简称：</span>
                  {(dataInfo.fromAddress && dataInfo.fromAddress.loadAddressName) || '-'}
                </div>
                <div className={styles.item}>
                  <span className={styles.label}>发货地址：</span>
                  {dataInfo.fromAddress && dataInfo.fromAddress.id
                    ? `${dataInfo.fromAddress.province}${dataInfo.fromAddress.city}${dataInfo.fromAddress.district}${dataInfo.fromAddress.detailAddress}`
                    : '-'}
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.item}>
                  <span className={styles.label}>发货联系人：</span>
                  {dataInfo && dataInfo.fromName ? `${dataInfo.fromName} ${dataInfo.fromMobilePhone}` : '-'}
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.item}>
                  <span className={styles.label}>收货企业：</span>
                  {(dataInfo.toAddressCompany && dataInfo.toAddressCompany.companyName) || '-'}
                </div>
                <div className={styles.item}>
                  <span className={styles.label}>收货地址简称：</span>
                  {(dataInfo.toAddress && dataInfo.toAddress.loadAddressName) || '-'}
                </div>
                <div className={styles.item}>
                  <span className={styles.label}>收货地址：</span>
                  {dataInfo.toAddress && dataInfo.toAddress.id
                    ? `${dataInfo.toAddress.province}${dataInfo.toAddress.city}${dataInfo.toAddress.district}${dataInfo.toAddress.detailAddress}`
                    : '-'}
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.item}>
                  <span className={styles.label}>收货联系人：</span>
                  {dataInfo && dataInfo.receiverName ? `${dataInfo.receiverName} ${dataInfo.receiverMobilePhone}` : '-'}
                </div>

                <div className={styles.item}></div>
              </div>
            </div>
          </Skeleton>
          <Skeleton loading={!loading} paragraph={{ rows: 2 }}>
            <div className={styles.area}>
              <ChildTitle
                className="hei14"
                style={{
                  color: '#333333',
                  fontSize: '14px',
                  fontWeight: 600,
                  marginBottom: '8px',
                }}>
                <div>货物信息</div>
              </ChildTitle>
              <div className={styles.row}>
                <div className={styles.item}>
                  <span className={styles.label}>货品名称：</span>
                  <Tooltip title={dataInfo.goodsType} placement="topLeft" overlayStyle={{ maxWidth: 'max-content' }}>
                    <div
                      className="max-label"
                      style={{
                        width: 150,
                        display: 'inline-block',
                        verticalAlign: 'bottom',
                      }}>
                      {dataInfo.goodsType || '-'}
                    </div>
                  </Tooltip>
                </div>

                <div className={styles.item} style={{ display: 'flex', alignItems: 'center' }}>
                  <span className={styles.label}>
                    运费单价
                    <Tooltip
                      placement="right"
                      overlayStyle={{
                        maxWidth: 'max-content',
                        padding: '0 10px',
                      }}
                      title={
                        <div>
                          <p style={{ marginBottom: 0 }}>单价编辑说明：</p>
                          <p style={{ marginTop: 8 }}>
                            编辑后不会影响已抢单的司机运费单价
                            <br />
                            若司机抢错单价，可在结算时跟司机协商更改结算单价。
                          </p>
                        </div>
                      }>
                      <QuestionCircleFilled
                        style={{
                          cursor: 'pointer',
                          color: '#D0D4DB',
                          marginRight: 4,
                          marginLeft: 4,
                        }}
                      />
                    </Tooltip>
                    ：
                  </span>
                  {!showUnitPrice ? (
                    <span>{unitPrice ? `${unitPrice} 元/${dataInfo.unitName}` : '-'}</span>
                  ) : (
                    <Input
                      style={{ width: 120 }}
                      addonAfter={<span style={{ color: '#BFBFBF' }}>元/吨</span>}
                      value={newUnitPrice ? newUnitPrice : unitPrice}
                      onChange={e => {
                        setNewUnitPrice(e.target.value);
                      }}
                    />
                  )}

                  {canEdit &&
                    (!showUnitPrice ? (
                      <span
                        style={{
                          color: '#477AEF',
                          marginLeft: 9,
                          cursor: 'pointer',
                        }}
                        onClick={() => setShowUnitPrice(true)}>
                        编辑
                      </span>
                    ) : (
                      <div style={{ display: 'inline' }}>
                        <span
                          style={{
                            color: '#477AEF',
                            marginLeft: 9,
                            cursor: 'pointer',
                          }}
                          onClick={modifyUnitPrice}>
                          保存
                        </span>
                        <span
                          style={{ marginLeft: 9, cursor: 'pointer', color: '#477AEF' }}
                          onClick={() => {
                            setShowUnitPrice(false);
                            setNewUnitPrice(0);
                          }}>
                          取消
                        </span>
                      </div>
                    ))}
                </div>

                <div className={styles.item}>
                  <span className={styles.label}>货物单价：</span>
                  {dataInfo.goodsUnitPrice
                    ? `${(dataInfo.goodsUnitPrice / 100).toFixed(2)} 元/${dataInfo.unitName}`
                    : '-'}
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.item}>
                  <span className={styles.label}>货物总量：</span>
                  {totalAmount
                    ? `${(totalAmount / 1000).toFixed(dataInfo.unitName === '吨' ? 2 : 0)} ${dataInfo.unitName}`
                    : '-'}
                  {canEdit && (
                    <span
                      style={{
                        color: '#477AEF',
                        marginLeft: 9,
                        cursor: 'pointer',
                      }}
                      onClick={() => setShowTotalWeight(true)}>
                      编辑
                    </span>
                  )}
                </div>

                <div className={styles.item}>
                  <span className={styles.label}>运输方式：</span>
                  {dataInfo.transportType === 'FTL' ? '整车运输' : '零担运输'}
                </div>
                <div className={styles.item}>
                  <span className={styles.label}>存放仓库：</span>
                  {dataInfo.wareHouseName}
                </div>
              </div>
              {dataInfo.payPath === 1 && (
                <div className={styles.row}>
                  <div className={styles.item}>
                    <span className={styles.label}>信息费单价：</span>
                    {dataInfo ? `${(dataInfo.unitInfoFee / 100).toFixed(2)} 元` : '-'}
                  </div>
                  <div className={styles.item}>
                    <span className={styles.label}>结算单价：</span>

                    {Format.price(dataInfo.unitInfoFee + unitPrice * 100)}
                  </div>
                  <div className={styles.item}></div>
                </div>
              )}
            </div>
          </Skeleton>
          <Skeleton loading={!loading} paragraph={{ rows: 1 }}>
            <div className={styles.area}>
              <ChildTitle
                className="hei14"
                style={{
                  color: '#333333',
                  fontSize: '14px',
                  fontWeight: 600,
                  marginBottom: '8px',
                }}>
                <div>结算信息</div>
              </ChildTitle>
              <div className={styles.row}>
                <div className={styles.item}>
                  <span className={styles.label}>结算方式：</span>
                  {payMethodStatus[dataInfo.payMethod] || '-'}
                </div>
                <div className={styles.item}>
                  <span className={styles.label}>允许路损：</span>
                  {dataInfo.lossMark !== undefined
                    ? dataInfo.lossMark
                      ? `${(dataInfo.lossAmount / 1000).toFixed(2)} ${dataInfo.unitName}`
                      : '已关闭'
                    : '-'}
                </div>
                <div className={styles.item}>
                  <span className={styles.label}>个位抹零：</span>
                  {dataInfo.eraseZero !== undefined ? (dataInfo.eraseZero ? '已开启' : '已关闭') : '-'}
                </div>
              </div>
            </div>
          </Skeleton>
          <Skeleton loading={!loading} paragraph={{ rows: 2 }}>
            <div className={styles.area}>
              <ChildTitle
                className="hei14"
                style={{
                  color: '#333333',
                  fontSize: '14px',
                  fontWeight: 600,
                  marginBottom: '8px',
                }}>
                <div>其他信息</div>
              </ChildTitle>
              <div className={styles.row}>
                <div className={styles.item}>
                  <span className={styles.label}>
                    余量提醒
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
                      <QuestionCircleFilled
                        style={{
                          cursor: 'pointer',
                          color: '#D0D4DB',
                          marginRight: 4,
                          marginLeft: 4,
                        }}
                      />
                    </Tooltip>
                    ：
                  </span>

                  {isLeavingAmount ? '已开启' : isLeavingAmount === false ? '已关闭' : '-'}
                  {canEdit && (
                    <span
                      style={{
                        color: '#477AEF',
                        marginLeft: 9,
                        cursor: 'pointer',
                      }}
                      onClick={() => setShowLeavingAmount(true)}>
                      编辑
                    </span>
                  )}
                </div>
                <div className={styles.item}>
                  <span className={styles.label}>专线号：</span>
                  {dataInfo.id || '-'}
                </div>
                <div className={styles.item}>
                  <span className={styles.label}>备注：</span>
                  {dataInfo.remark || '-'}
                </div>
              </div>
            </div>
          </Skeleton>
        </section>
      </Content>

      <OrderTable />

      {/* 修改发货时间 */}
      <Modal
        title="修改有效时间"
        visible={showSendDate}
        destroyOnClose
        onCancel={() => setShowSendDate(false)}
        width={576}
        footer={null}>
        <UpdateSendDate
          initValue={loadTime}
          startLoadTime={startLoadTime}
          endLoadTime={lastLoadTime}
          onSubmit={modifySendDate}
          onClose={() => setShowSendDate(false)}
        />
      </Modal>

      {/* 修改货物总量 */}
      <Modal
        title="编辑货物总量"
        visible={showTotalWeight}
        destroyOnClose
        onCancel={() => setShowTotalWeight(false)}
        footer={null}>
        <UpdateTotalWeight
          initValue={(dataInfo.sendAmount / 1000).toFixed(2)}
          onSubmit={modifyTotalWeight}
          onClose={() => setShowTotalWeight(false)}
        />
      </Modal>

      {/* 修改余量提醒 */}
      <Modal
        title="余量提醒"
        visible={showLeavingAmount}
        destroyOnClose
        onCancel={() => setShowLeavingAmount(false)}
        footer={null}>
        <UpdateLeavingAmount
          initValue={{
            isLeavingAmount: isLeavingAmount,
            ruleLeavingAmount: ruleLeavingAmount,
            routeContactMobile: routeContactMobile,
          }}
          onSubmit={modifyLeavingAmount}
          onClose={() => setShowLeavingAmount(false)}
        />
      </Modal>
    </Layout>
  );
};

export default RailWayDetail;
