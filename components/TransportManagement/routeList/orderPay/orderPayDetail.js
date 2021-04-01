import React, { useState, useEffect, useCallback } from 'react';
import { Content, Status } from '@components';
import { Button, Skeleton, Tooltip, Tag, Divider } from 'antd';
import { RightOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import router from 'next/router';
import { Format } from '@utils/common';
import styles from '@styles/myRailWay.less';
import { BuildUrl } from '@utils/common';
const emptyPoundPic = '../../../../static/img/empty_poundPic.jpg';
const emptyPic = '../../../../static/img/noPoundPic.png';
// 动态导入图片查看组件
import dynamic from 'next/dynamic';
const Viewer = dynamic(import('react-viewer'), { ssr: false });
const OrderPayDetail = props => {
  const [dataList, setDataList] = useState(props.dataList);
  const [loading, setLoading] = useState(true);
  const [deliverPoundPic, setDeliverPoundPic] = useState(true);
  const [receivePoundPic, setReceivePoundPic] = useState(true);
  const [imgLoading, setImgLoading] = useState(true);
  const [showPoundImg, setShowPoundImg] = useState(false);
  const [imgIndex, setImgIndex] = useState('');
  const [aFold, setAFold] = useState(false);
  useEffect(() => {
    setDataList(props.dataList);
    setLoading(false);

    setPrivateUrl(props.dataList);
  }, [props.dataList]);

  // 设置签名有url
  const setPrivateUrl = async ({ deliverPoundPic, receivePoundPic }) => {
    const res = await BuildUrl([deliverPoundPic, receivePoundPic]);
    setDeliverPoundPic(res[deliverPoundPic] || undefined);
    setReceivePoundPic(res[receivePoundPic] || undefined);
    setImgLoading(false);
  };

  // 打开电子磅单
  const showPoundById = id => {
    router.push(`/virtualDetail?id=${id}`);
  };

  // 点击磅单
  const showPound = index => {
    setShowPoundImg(true);
    setImgIndex(index);
  };
  //展开收起
  const onChangeAfold = useCallback(() => {
    setAFold(!aFold);
  }, [aFold]);

  return (
    <div className={styles.root} style={{ height: aFold ? '' : '380px' }}>
      <Content>
        <header style={{ background: '#F0F0F0', borderBottom: 0 }}>
          <span>{dataList.trailerPlateNumber}</span>
          <span style={{ marginLeft: 8, fontSize: 14, fontWeight: 400 }}>
            {dataList.name} {dataList.mobilePhoneNumber}
          </span>
          <Tag
            color={
              Status.orderColor[dataList.status] &&
              Status.orderColor[
                dataList.applyCancelType != 0 && dataList.status != 'CANCEL' ? 'APPLY_CANCEL' : dataList.status
              ].bg
            }
            style={{
              marginLeft: 24,
              color:
                Status.orderColor[dataList.status] &&
                Status.orderColor[
                  dataList.applyCancelType != 0 && dataList.status != 'CANCEL' ? 'APPLY_CANCEL' : dataList.status
                ].color,
            }}>
            {
              Status.order[
                dataList.applyCancelType != 0 && dataList.status != 'CANCEL' ? 'APPLY_CANCEL' : dataList.status
              ]
            }
          </Tag>
          <Tag color="#F5F9FF" style={{ color: '#3D86EF' }}>
            {dataList.isFleet ? '车队单' : '个人单'}
          </Tag>
          {dataList.isFleet ? (
            <Tag color="#FFF3EB" style={{ color: '#FF8742' }}>
              {dataList.payPathZn}
            </Tag>
          ) : (
            ''
          )}

          <span style={{ float: 'right' }} onClick={onChangeAfold} className={styles.aFold}>
            {aFold ? '收起' : '展开'} <span> {aFold ? <UpOutlined /> : <DownOutlined />} </span>
          </span>
        </header>

        <section className={styles['railWay-detail']}>
          <Skeleton loading={loading} paragraph={{ rows: 3 }}>
            <div className={styles.area}>
              <div className={styles.title}>
                专线信息
                <Button
                  type="link"
                  style={{ marginLeft: 12 }}
                  onClick={() => router.push(`/railWay/mine/detail?id=${dataList.routeId}`)}>
                  详情
                  <RightOutlined></RightOutlined>
                </Button>
              </div>

              <div className={styles.row}>
                <div className={styles.item}>
                  <span className={styles.label}>发货企业：</span>
                  <Tooltip placement="topLeft" title={dataList.fromCompany} overlayStyle={{ maxWidth: 'max-content' }}>
                    <div className="max-label" style={{ width: 180, display: 'inline' }}>
                      {dataList.fromCompany}
                    </div>
                  </Tooltip>
                </div>
                <div className={styles.item}>
                  <span className={styles.label}>发货地址：</span>
                  <Tooltip placement="topLeft" title={dataList.fromAddress} overlayStyle={{ maxWidth: 'max-content' }}>
                    <div className="max-label" style={{ width: 180, display: 'inline' }}>
                      {dataList.fromAddress}
                    </div>
                  </Tooltip>
                </div>
                <div className={styles.item}>
                  <span className={styles.label}>货品名称：</span>
                  <Tooltip placement="topLeft" title={dataList.goodsType} overlayStyle={{ maxWidth: 'max-content' }}>
                    <div className="max-label" style={{ width: 180, display: 'inline' }}>
                      {dataList.goodsType}
                    </div>
                  </Tooltip>
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.item}>
                  <span className={styles.label}>收货企业：</span>
                  <Tooltip placement="topLeft" title={dataList.toCompany} overlayStyle={{ maxWidth: 'max-content' }}>
                    <div className="max-label" style={{ width: 180, display: 'inline' }}>
                      {dataList.toCompany}
                    </div>
                  </Tooltip>
                </div>
                <div className={styles.item}>
                  <span className={styles.label}>收货地址：</span>
                  <Tooltip placement="topLeft" title={dataList.toAddress} overlayStyle={{ maxWidth: 'max-content' }}>
                    <div className="max-label" style={{ width: 180, display: 'inline' }}>
                      {dataList.toAddress}
                    </div>
                  </Tooltip>
                </div>
                <div className={styles.item}>
                  <span className={styles.label}>运费单价：</span>
                  {Format.price(dataList.unitPrice)} 元/{dataList.unitName || '吨'}
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.item}>
                  <span className={styles.label}>车队长：</span>
                  {(dataList.fleetCaptainInfo && dataList.fleetCaptainInfo.name) || '-'}
                </div>
              </div>
            </div>
          </Skeleton>

          <Divider></Divider>
          <Skeleton loading={loading} paragraph={{ rows: 1 }}>
            <div className={styles.area}>
              <div className={styles.title}>支付信息</div>
              <div className={styles.row}>
                <div className={styles.item}>
                  <span className={styles.label}>结算单价：</span>
                  <span style={{ display: 'inline-block' }}>
                    {Format.price(dataList.unitPrice)} 元/{dataList.unitName || '吨'}
                  </span>
                </div>

                <div className={styles.item}>
                  <span className={styles.label}>预计运费：</span>
                  {Format.price(dataList.price)} 元
                </div>
                <div className={styles.item}>
                  <span className={styles.label}>结算运费：</span>
                  <span style={{ display: 'inline-block' }}>
                    {dataList.realPrice === 0 ? Format.price(dataList.price) : Format.price(dataList.realPrice)}元
                  </span>
                </div>
              </div>
            </div>
          </Skeleton>

          <Divider></Divider>

          <Skeleton loading={loading} paragraph={{ rows: 1 }}>
            <div className={styles.area}>
              <div className={styles.title}>运输信息</div>
              <div className={styles.row}>
                <div className={styles.item}>
                  <span className={styles.label}>发货净重：</span>
                  <span style={{ display: 'inline-block', minWidth: 120 }}>
                    {Format.weight(dataList.goodsWeight)} {dataList.unitName || '吨'}
                  </span>
                </div>
                <div className={styles.item}>
                  <span className={styles.label}>收货净重：</span>
                  <span style={{ display: 'inline-block', minWidth: 120 }}>
                    {Format.weight(dataList.arrivalGoodsWeight)} {dataList.unitName || '吨'}
                  </span>
                </div>
                <div className={styles.item}>
                  <span className={styles.label}>路损：</span>
                  {Format.weight(dataList.loss)} {dataList.unitName || '吨'}
                </div>
              </div>
            </div>
          </Skeleton>
          <Divider></Divider>

          <div className={styles.area}>
            <div className={styles.title}>磅单照片</div>
            <div gutter={12} style={{ background: '#F7F7F7', padding: 24, display: 'flex', borderRadius: 4 }}>
              <div>
                <div style={{ height: 194, width: 340 }}>
                  {dataList.fromPoundId === '' ? (
                    <img
                      onClick={e => showPound(0)}
                      style={{ width: '100%', height: '100%', cursor: 'pointer' }}
                      src={deliverPoundPic}
                    />
                  ) : (
                    <img
                      style={{ width: '100%', height: '100%', cursor: dataList.fromPoundId && 'pointer' }}
                      src={dataList.fromPoundId ? emptyPoundPic : emptyPic}
                      onClick={() => dataList.fromPoundId && showPoundById(dataList.fromPoundId)}
                    />
                  )}
                </div>
                <p style={{ textAlign: 'center', marginTop: 12, width: 340, marginBottom: 0 }}>发货磅单</p>
              </div>
              <div style={{ marginLeft: 32 }}>
                {/* <p>收货磅单</p> */}
                <div style={{ height: 194, width: 340 }}>
                  {dataList.toPoundId === '' ? (
                    <img
                      onClick={e => showPound(1)}
                      style={{ width: '100%', height: '100%', cursor: 'pointer' }}
                      src={receivePoundPic}
                    />
                  ) : (
                    <img
                      style={{ width: '100%', height: '100%', cursor: dataList.toPoundId && 'pointer' }}
                      src={dataList.toPoundId ? emptyPoundPic : emptyPic}
                      onClick={() => dataList.toPoundId && showPoundById(dataList.toPoundId)}
                    />
                  )}
                </div>
                <p style={{ textAlign: 'center', marginTop: 12, width: 340 }}>收货磅单</p>
              </div>
            </div>
          </div>

          <Skeleton loading={loading} paragraph={{ rows: 1 }}>
            <div className={styles.area} style={{ marginTop: 32 }}>
              <div className={styles.title}>其他信息</div>
              <div className={styles.row}>
                <div className={styles.item}>
                  <span className={styles.label}>承运时间：</span>
                  {dataList.createdAt || '-'}
                </div>
                <div className={styles.item}>
                  <span className={styles.label}>装货时间：</span>
                  {dataList.processTime || '-'}
                </div>
                <div className={styles.item}>
                  <span className={styles.label}>卸货时间：</span>
                  {dataList.checkingTime || '-'}
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.item}>
                  <span className={styles.label}>结算时间：</span>
                  {dataList.waitPayTime || '-'}
                </div>

                <div className={styles.item}>
                  <span className={styles.label}>运单编号：</span>
                  {dataList.orderNo || '-'}
                </div>
                <div className={styles.item}>
                  <span className={styles.label}></span>
                </div>
              </div>
            </div>
          </Skeleton>
        </section>
      </Content>
      {/* 预览磅单 */}
      {showPoundImg && (
        <Viewer
          visible={showPoundImg}
          activeIndex={imgIndex}
          onClose={() => setShowPoundImg(false)}
          onMaskClick={() => {
            setShowPoundImg(false);
          }}
          images={[
            { src: deliverPoundPic, alt: '发货磅单' },
            { src: receivePoundPic, alt: '收货磅单' },
          ]}
        />
      )}
    </div>
  );
};

export default OrderPayDetail;
