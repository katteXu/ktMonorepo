import { useState, useCallback, useEffect } from 'react';
import router from 'next/router';
import { Layout, Content, Msg, Status, Search, ChildTitle } from '@components';
import UpdateTotalWeight from '@components/RailDetail/updateTotalWeight';
import UpdateLeavingAmount from '@components/RailDetail/updateLeavingAmount';
import UpdateFromContact from '@components/RailDetail/updateFromContact';

import Link from 'next/link';
import moment from 'moment';
import styles from '../styles.less';
import { railWay } from '@api';
import { QuestionCircleFilled } from '@ant-design/icons';
import { Format, getQuery } from '@utils/common';
import { Permission } from '@store';
import { Button, Modal, message, Tooltip, Table, Skeleton, DatePicker, Input, Select, Tag } from 'antd';
const { RangePicker } = DatePicker;

const RailWayDetail = () => {
  const { permissions } = Permission.useContainer();
  const routeView = {
    title: '专线详情',
    pageKey: 'pound',
    longKey: 'railWay.pound',
    breadNav: [
      '专线管理',
      <Link href="/railWay/pound">
        <a>过磅专线</a>
      </Link>,
      '专线详情',
    ],
    useBack: true,
    pageTitle: '专线详情',
  };

  const columns = [
    {
      title: '车牌号',
      dataIndex: 'trailerPlateNumber',
      key: 'trailerPlateNumber',
      width: 100,
    },
    {
      title: '司机姓名',
      dataIndex: 'driverName',
      key: 'driverName',
      width: 100,
    },
    {
      title: '运费单价(元/吨)',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 130,
      align: 'right',
      render: Format.price,
    },

    {
      title: '毛重(吨)',
      dataIndex: 'totalWeight',
      key: 'totalWeight',
      width: 100,
      align: 'right',
      render: Format.weight,
    },
    {
      title: '皮重(吨)',
      dataIndex: 'carWeight',
      key: 'carWeight',
      width: 100,
      align: 'right',
      render: Format.weight,
    },
    {
      title: '净重(吨)',
      dataIndex: 'goodsWeight',
      key: 'goodsWeight',
      width: 100,
      align: 'right',
      render: Format.weight,
    },
    {
      title: '原发毛重(吨)',
      dataIndex: 'fromTotalWeight',
      key: 'fromTotalWeight',
      width: 150,
      align: 'right',
      render: Format.weight,
    },
    {
      title: '发货净重(吨)',
      dataIndex: 'fromGoodsWeight',
      key: 'fromGoodsWeight',
      width: 150,
      align: 'right',
      render: Format.weight,
    },
    {
      title: '装卸车费(元)',
      dataIndex: 'price',
      key: 'price',
      width: 130,
      align: 'right',
      render: Format.price,
    },

    {
      title: '运费(元)',
      dataIndex: 'transportPrice',
      key: 'transportPrice',
      width: 130,
      align: 'right',
      render: Format.price,
    },
    {
      title: '出场时间',
      dataIndex: 'outTime',
      key: 'outTime',
      align: 'right',
      width: 200,
    },
  ];

  const [query, setQuery] = useState({
    plateNum: '',
    begin: '',
    end: '',
    receiveOrSend: undefined,
    page: 1,
    pageSize: 10,
  });
  const [loading, setLoading] = useState(false);
  const [dataInfo, setDataInfo] = useState({});
  const [orderData, setOrderData] = useState({});
  const [showLeavingAmount, setShowLeavingAmount] = useState(false);
  const [showUnitPrice, setShowUnitPrice] = useState(false);

  const [showTotalWeight, setShowTotalWeight] = useState(false);
  const [table_loading, setTable_loading] = useState(false);
  const [unitPrice, setUnitPrice] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isLeavingAmount, setIsLeavingAmount] = useState();
  const [ruleLeavingAmount, setRuleLeavingAmount] = useState(0);
  const [routeContactMobile, setRouteContactMobile] = useState('');
  const [isMyRoute, setIsMyRoute] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [contactType, setContactType] = useState('');
  const [contactInfo, setContactInfo] = useState({});
  const [fromInfo, setFromInfo] = useState({});
  const [receiverInfo, setReceiverInfo] = useState({});
  const [showRemark, setShowRemark] = useState(false);
  const [status, setStatus] = useState('');

  const [remarkInfo, setRemarkInfo] = useState('');
  const [newUnitPrice, setNewUnitPrice] = useState(0);
  const [newRemarkInfo, setNewRemarkInfo] = useState('');
  useEffect(() => {
    setRailWayDetail();
    getDataList(query);
  }, []);

  // 专线详情 && 运单详情
  const setRailWayDetail = async () => {
    const { id } = getQuery();
    const { userId } = localStorage;
    const params = {
      id,
    };

    const res = await railWay.railWayDetail({ params });
    if (res.status === 0) {
      setDataInfo(res.result);
      setUnitPrice(res.result.unitPrice && (res.result.unitPrice / 100).toFixed(2));
      setTotalAmount(res.result.totalAmount);
      setIsLeavingAmount(res.result.isLeavingAmount);
      setRemarkInfo(res.result.remark);
      setIsMyRoute(res.result.is_my_route);
      setRuleLeavingAmount(res.result.ruleLeavingAmount);
      setRouteContactMobile(res.result.routeContactMobile);
      setStatus(res.result.status);
    } else {
      message.error(`${res.detail || res.description}`);
    }
    setLoading(true);
  };

  // 运单列表查询
  const getDataList = async ({ plateNum, begin, end, receiveOrSend, page, pageSize }) => {
    const { id } = getQuery();
    setTable_loading(true);

    const params = {
      rid: id,
      plateNum: plateNum || undefined,
      begin: begin || undefined,
      end: end || undefined,
      receiveOrSend: receiveOrSend || undefined,
      page,
      limit: pageSize,
    };
    const res = await railWay.getRoutePoundOrderList({ params });
    if (res.status === 0) {
      setOrderData(res.result);
    }
    setTable_loading(false);
  };

  // 编辑运费单价
  const modifyUnitPrice = async value => {
    const params = {
      rid: getQuery().id,
      unitPrice: ((newUnitPrice ? newUnitPrice : unitPrice) * 100).toFixed(),
    };

    const res = await railWay.modifyUnitPrice({ params });

    if (res.status === 0) {
      message.success('运费单价编辑成功');
      setUnitPrice(newUnitPrice);
      setShowUnitPrice(false);
    } else {
      message.error(`运费单价编辑失败，原因：${res.detail ? res.detail : res.description}`);
    }
  };

  // 编辑货物总量
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

  // 编辑余量提醒
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

  // 分页
  const onChangePage = useCallback(
    (page, pageSize) => {
      setQuery({ ...query, page, pageSize });
      getDataList({ ...query, page, pageSize });
    },
    [orderData]
  );

  // 切页码
  const onChangePageSize = useCallback(
    (current, pageSize) => {
      setQuery({ ...query, page: 1, pageSize });
      getDataList({ ...query, page: 1, pageSize });
    },
    [orderData]
  );

  // 查询
  const handleSearch = useCallback(() => {
    setQuery({ ...query, page: 1 });
    getDataList({ ...query, page: 1 });
  }, [query]);

  // 重置
  const handleReset = useCallback(() => {
    const query = {
      plateNum: '',
      begin: '',
      end: '',
      receiveOrSend: undefined,
      page: 1,
      pageSize: 10,
    };
    setQuery(query);
    getDataList(query);
  }, []);

  // 删除专线
  const deleteLine = () => {
    const { id } = getQuery();
    const params = {
      ids: id,
    };
    Modal.confirm({
      title: '是否删除此专线？',
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

  // 日期输入
  const handleChangeDate = useCallback((value, string) => {
    const begin = value && value[0] && moment(value[0]).format('YYYY-MM-DD HH:mm:ss');
    const end = value && value[1] && moment(value[1]).format('YYYY-MM-DD HH:mm:ss');
    setQuery(() => ({ ...query, begin, end }));
  });

  // 车牌号
  const handleChangeplateNum = useCallback(e => {
    const plateNum = e.target.value;
    setQuery(() => ({ ...query, plateNum }));
  });

  // 收货企业
  const handleChangereceiveOrSend = useCallback(value => {
    const receiveOrSend = value;
    setQuery(() => ({ ...query, receiveOrSend }));
  });

  const handleModifyFrom = () => {
    setContactInfo({
      name: fromInfo.fromName || dataInfo.fromName,
      mobile: fromInfo.fromMobilePhone || dataInfo.fromMobilePhone,
    });
    setShowContact(true);
    setContactType('from');
  };

  const handleModifyTo = () => {
    setContactInfo({
      name: receiverInfo.receiverName || dataInfo.receiverName,
      mobile: receiverInfo.receiverMobilePhone || dataInfo.receiverMobilePhone,
    });
    setShowContact(true);
    setContactType('to');
  };

  //编辑收发货联系人
  const modifyContact = async value => {
    console.log(value);
    let params = {};
    if (contactType === 'from') {
      params = {
        fromName: value.name,
        fromMobilePhone: value.mobile,
        rid: dataInfo.id,
      };
    } else {
      params = {
        receiverName: value.name,
        receiverMobilePhone: value.mobile,
        rid: dataInfo.id,
      };
    }
    const res = await railWay.modifyRouteContactInfo({ params });
    if (res.status === 0) {
      message.success('编辑成功');
      contactType === 'from'
        ? setFromInfo({
          fromName: value.name,
          fromMobilePhone: value.mobile,
        })
        : setReceiverInfo({
          receiverName: value.name,
          receiverMobilePhone: value.mobile,
        });
    } else {
      message.error(`编辑失败，原因：${res.detail ? res.detail : res.description}`);
    }
    setShowContact(false);
  };
  //编辑备注
  const modifyRemark = async value => {
    let params = {
      rid: dataInfo.id,
      remark: newRemarkInfo ? newRemarkInfo : remarkInfo,
    };
    const res = await railWay.modifyRouteRemark({ params });
    if (res.status === 0) {
      message.success('备注编辑成功');
      setRemarkInfo(newRemarkInfo);
      setShowRemark(false);
    } else {
      message.error(`编辑失败，原因：${res.detail ? res.detail : res.description}`);
    }
  };

  const canEdit = isMyRoute || permissions.includes('ROUTE_MODIFY');
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
          {canEdit && (
            <span style={{ float: 'right' }}>
              <Button
                style={{
                  color: '#477AEF',
                  outline: 'none',
                  border: 'none',
                  padding: '4px 0',
                }}
                onClick={deleteLine}>
                删除专线
              </Button>
            </span>
          )}
        </header>
        <section className={styles['railWay-detail']}>
          <div className={styles.area} style={{ marginTop: -10 }}>
            <div className={styles.row}>
              <div className={styles.item}>
                <span className={styles.label}>创建时间：</span>
                {dataInfo.createdAt}
              </div>
            </div>
          </div>
          <Skeleton loading={!loading} paragraph={{ rows: 3 }}>
            <div className={styles.area}>
              <div className={styles.title}>
                <ChildTitle className="hei14" style={{ marginBottom: 8 }}>
                  路线信息
                </ChildTitle>
              </div>
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
                  <span className={styles.label}>发货详细地址：</span>
                  {dataInfo.fromAddress && dataInfo.fromAddress.id
                    ? `${dataInfo.fromAddress.province}${dataInfo.fromAddress.city}${dataInfo.fromAddress.district}${dataInfo.fromAddress.detailAddress}`
                    : '-'}
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.item}>
                  <span className={styles.label}>发货联系人：</span>
                  {dataInfo.fromName || fromInfo
                    ? `${fromInfo.fromName || dataInfo.fromName} ${fromInfo.fromMobilePhone || dataInfo.fromMobilePhone
                    }`
                    : '-'}
                  {canEdit && (
                    <span
                      style={{
                        color: '#477AEF',
                        marginLeft: 9,
                        cursor: 'pointer',
                      }}
                      onClick={handleModifyFrom}>
                      编辑
                    </span>
                  )}
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
                  <span className={styles.label}>收货详细地址：</span>
                  {dataInfo.toAddress && dataInfo.toAddress.id
                    ? `${dataInfo.toAddress.province}${dataInfo.toAddress.city}${dataInfo.toAddress.district}${dataInfo.toAddress.detailAddress}`
                    : '-'}
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.item}>
                  <span className={styles.label}>收货联系人：</span>
                  {dataInfo.receiverName || receiverInfo
                    ? `${receiverInfo.receiverName || dataInfo.receiverName} ${receiverInfo.receiverMobilePhone || dataInfo.receiverMobilePhone
                    }`
                    : '-'}
                  {canEdit && (
                    <span
                      style={{
                        color: '#477AEF',
                        marginLeft: 9,
                        cursor: 'pointer',
                      }}
                      onClick={handleModifyTo}>
                      编辑
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Skeleton>
          {/* <Divider></Divider> */}
          <Skeleton loading={!loading} paragraph={{ rows: 2 }}>
            <div className={styles.area}>
              <div className={styles.title}>
                <ChildTitle className="hei14" style={{ marginBottom: 8 }}>
                  货物信息
                </ChildTitle>
              </div>
              <div className={styles.row}>
                <div className={styles.item}>
                  <span className={styles.label}>货品名称：</span>
                  <Tooltip title={dataInfo.goodsType} placement="topLeft" overlayStyle={{ maxWidth: 'max-content' }}>
                    <div
                      className="max-label"
                      style={{
                        display: 'inline-block',
                        verticalAlign: 'bottom',
                      }}>
                      {dataInfo.goodsType || '-'}
                    </div>
                  </Tooltip>
                </div>

                <div className={styles.item}>
                  <span className={styles.label}>运费单价：</span>
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
              </div>
              <div className={styles.row}>
                <div className={styles.item}>
                  <span className={styles.label}>存放仓库：</span>
                  {dataInfo.wareHouseName}
                </div>
              </div>
            </div>
          </Skeleton>
          {/* <Divider></Divider> */}
          <Skeleton loading={!loading} paragraph={{ rows: 2 }}>
            <div className={styles.area}>
              <div className={styles.title}>
                <ChildTitle className="hei14" style={{ marginBottom: 8 }}>
                  其他信息
                </ChildTitle>
              </div>
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
                  <span className={styles.label}>打印磅单：</span>
                  {dataInfo.printPoundBill ? '打印' : '不打印'}
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.item}>
                  <span className={styles.label}>备注：</span>
                  {!showRemark ? (
                    <span>{remarkInfo ? remarkInfo : '-'}</span>
                  ) : (
                    <Input
                      style={{ width: 210 }}
                      value={newRemarkInfo ? newRemarkInfo : remarkInfo}
                      onChange={e => {
                        setNewRemarkInfo(e.target.value);
                      }}
                    />
                  )}

                  {canEdit &&
                    (!showRemark ? (
                      <span
                        style={{
                          color: '#477AEF',
                          marginLeft: 9,
                          cursor: 'pointer',
                        }}
                        onClick={() => setShowRemark(true)}>
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
                          onClick={modifyRemark}>
                          保存
                        </span>
                        <span
                          style={{ marginLeft: 9, cursor: 'pointer', color: '#477AEF' }}
                          onClick={() => {
                            setShowRemark(false);
                            setNewRemarkInfo('');
                          }}>
                          取消
                        </span>
                      </div>
                    ))}
                </div>
                <div className={styles.item}></div>
              </div>
            </div>
          </Skeleton>
        </section>
      </Content>

      <Content style={{ marginTop: 16 }}>
        <section>
          <Search simple onSearch={handleSearch} onReset={handleReset}>
            <Search.Item label="出场时间" br>
              <RangePicker
                style={{ width: 376 }}
                value={query.begin && query.end ? [moment(query.begin), moment(query.end)] : null}
                format="YYYY-MM-DD HH:mm:ss"
                showTime={{
                  defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
                }}
                onChange={handleChangeDate}
              />
            </Search.Item>
            <Search.Item label="车牌号">
              <Input allowClear placeholder="请输入车牌号" value={query.plateNum} onChange={handleChangeplateNum} />
            </Search.Item>
            <Search.Item label="磅单类型">
              <Select
                style={{ width: '100%' }}
                placeholder="请选择磅单类型"
                value={query.receiveOrSend}
                onChange={handleChangereceiveOrSend}
                allowClear>
                <Select.Option key="0">发货磅单</Select.Option>
                <Select.Option key="1">收货磅单</Select.Option>
              </Select>
            </Search.Item>
          </Search>
          <Msg style={{ marginTop: 16 }}>
            <span>
              总车次
              <span className="total-num">{orderData.count ? orderData.count : 0}</span>辆
            </span>
            <span style={{ marginLeft: 32 }}>
              总净重
              <span className="total-num">{Format.weight(orderData.goodsWeight)}</span>吨
            </span>
          </Msg>
          <Table
            loading={table_loading}
            dataSource={orderData.data}
            columns={columns}
            scroll={{ x: 1400 }}
            pagination={{
              onChange: onChangePage,
              pageSize: query.pageSize,
              current: query.page,
              total: orderData.count,
            }}
          />
        </section>
      </Content>

      {/* 编辑货物总量 */}
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

      {/* 编辑余量提醒 */}
      <Modal
        title="余量提醒"
        visible={showLeavingAmount}
        destroyOnClose
        onCancel={() => setShowLeavingAmount(false)}
        footer={null}>
        <UpdateLeavingAmount
          initValue={{ isLeavingAmount, ruleLeavingAmount, routeContactMobile }}
          onSubmit={modifyLeavingAmount}
          onClose={() => setShowLeavingAmount(false)}
        />
      </Modal>
      {/* 编辑收发货联系人 */}
      <Modal
        title={contactType === 'from' ? '编辑发货联系人' : '编辑收货联系人'}
        visible={showContact}
        destroyOnClose
        onCancel={() => setShowContact(false)}
        footer={null}>
        <UpdateFromContact
          initValue={contactInfo}
          fromType={contactType}
          onSubmit={modifyContact}
          onClose={() => setShowContact(false)}
        />
      </Modal>
    </Layout>
  );
};

export default RailWayDetail;
