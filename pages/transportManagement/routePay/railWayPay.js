import React, { useState, useEffect, useCallback } from 'react';
import { Table, Input, Button, Modal, message, Tooltip, Tag, Checkbox } from 'antd';
import { Layout, Content, Search, Msg, DrawerInfo, DateRangePicker, LoadingBtn } from '@components';
import styles from './styles.less';
import Detail from '@components/Transport/detail';
import Link from 'next/link';
import moment from 'moment';
import { keepState, getState, Format } from '@utils/common';
import { transportStatistics, getTimeStamp } from '@api';
import FleetBatchConfirm from '@components/Transport/flowPay/FleetBatchConfirm';
import FleetAllConfirm from '@components/Transport/flowPay/FleetAllConfirm';
import { getQuery } from '@utils/common';
import { User } from '@store';

const RailWayPay = () => {
  const routeView = {
    title: '运单管理',
    pageKey: 'routeList',
    longKey: 'transportManagement.routeList',
    breadNav: [
      '运单管理',
      <Link href="/transportManagement/routeList">
        <a>专线结算支付</a>
      </Link>,
      '按专线支付详情',
    ],
    useBack: true,
  };

  const { userInfo } = User.useContainer();

  const columns = [
    {
      title: '车牌号',
      dataIndex: 'trailerPlateNumber',
      key: 'trailerPlateNumber',
      width: 130,
      render: value => {
        return value || '-';
      },
    },
    {
      title: '司机姓名',
      dataIndex: 'name',
      key: 'name',
      width: 130,
      render: value => {
        return value || '-';
      },
    },
    {
      title: '发货净重(吨)',
      dataIndex: 'goodsWeight',
      key: 'goodsWeight',
      width: 130,
      align: 'right',
      render: Format.weight,
    },
    {
      title: '收货净重(吨)',
      dataIndex: 'arrivalGoodsWeight',
      key: 'arrivalGoodsWeight',
      width: 130,
      align: 'right',
      render: Format.weight,
    },
    {
      title: '运费单价(元)',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 130,
      align: 'right',
      render: Format.price,
    },
    {
      title: '结算运费(元)',
      dataIndex: 'price',
      key: 'price',
      width: 130,
      align: 'right',
      render: Format.price,
    },
    {
      title: '承运时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      minWidth: 250,
      width: 250,
      render: value => {
        return value || '-';
      },
    },
    {
      title: '操作',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'right',
      fixed: 'right',
      render: value => {
        return (
          <Button type="link" size="small" onClick={() => handleShowDetail(value)}>
            详情
          </Button>
        );
      },
    },
  ];

  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
    begin: undefined,
    end: undefined,
    dateStatus: '',
    trailerPlateNumber: '',
    name: '',
  });

  const [dataList, setDataList] = useState({});
  const [routeInfo, setRouteInfo] = useState({});
  const [fleetInfo, setFleetInfo] = useState({});
  const [transportFleetId, setTransportFleetId] = useState();
  const [payAllFilter, setPayAllFilter] = useState({});
  const [payInfo, setPayInfo] = useState({});
  const [checkTotal, setCheckTotal] = useState({
    waitPayNum: 0,
    goodsWeight: 0,
    arrivalGoodsWeight: 0,
  });

  const [stamp, setStamp] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [seletedKeysIndex, setSelectedKeysIndex] = useState([]);
  const [isAllTransport, setIsAllTransport] = useState(false);
  const [showAllModal, setShowAllModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [transportId, setTransportId] = useState();

  const handleShowDetail = value => {
    setShowDetail(true);
    setTransportId(value);
  };

  useEffect(() => {
    getRemoteData(query);
    if (getState().drawInfo.show) {
      handleShowDetail(getState().drawInfo.transportId);
    }
  }, []);

  // 监听showAllModal
  useEffect(() => {
    setTimeout(
      show => {
        document.body.style.overflow = show ? 'hidden' : 'visible';
      },
      500,
      showAllModal
    );
  }, [showAllModal]);

  // 监听showModal
  useEffect(() => {
    setTimeout(
      show => {
        document.body.style.overflow = show ? 'hidden' : 'visible';
      },
      500,
      showModal
    );
  }, [showModal]);

  // 监听showDetail
  useEffect(() => {
    keepState({
      drawInfo: {
        show: showDetail,
        transportId: transportId,
      },
    });
  }, [showDetail]);

  const getRemoteData = async ({ begin, end, trailerPlateNumber, page, pageSize, name }) => {
    setLoading(true);

    const { id } = getQuery();
    const params = {
      limit: pageSize,
      page,
      id,
      begin: begin || undefined,
      end: end || undefined,
      trailerPlateNumber: trailerPlateNumber || undefined,
      name: name || undefined,
    };

    const res = await transportStatistics.getWaitPayFleetTransportDetailList({ params });
    if (res.status === 0) {
      setSelectedKeysIndex([...new Array(res.result.data.length).keys()]);
      setDataList(res.result);
      setRouteInfo(res.result.routeInfo);
      setFleetInfo(res.result.fleetInfo);
      setTransportFleetId(res.result.transportFleetId);
      setPayAllFilter({
        begin,
        end,
        trailerPlateNumber,
        name,
      });
    }

    setLoading(false);
  };

  // 选中单一值
  const onSelectRow = (record, selected, selectedRows, nativeEvent) => {
    const realPrice = record.realPrice;
    const arrivalGoodsWeight = record.arrivalGoodsWeight;
    const goodsWeight = record.goodsWeight;

    const key = record.id;
    if (selected) {
      setSelectedRowKeys([...selectedRowKeys, key]);
    } else {
      const i = selectedRowKeys.indexOf(key);
      selectedRowKeys.splice(i, 1);
      setSelectedRowKeys([...selectedRowKeys]);
    }

    // 计算总净重 & 运费总额
    let _realPrice = 0;
    let _arrivalGoodsWeight = 0;
    let _goodsWeight = 0;
    _realPrice += realPrice || 0;
    _arrivalGoodsWeight += arrivalGoodsWeight || 0;
    _goodsWeight += goodsWeight || 0;
    const total = checkTotal;

    if (selected) {
      setCheckTotal({
        waitPayNum: total.waitPayNum + _realPrice,
        goodsWeight: total.goodsWeight + _goodsWeight,
        arrivalGoodsWeight: total.arrivalGoodsWeight + _arrivalGoodsWeight,
      });
    } else {
      setCheckTotal({
        waitPayNum: total.waitPayNum - _realPrice,
        goodsWeight: total.goodsWeight - _goodsWeight,
        arrivalGoodsWeight: total.arrivalGoodsWeight - _arrivalGoodsWeight,
      });
    }
  };

  const onSelectAll = (selected, selectedRows, changeRows) => {
    // 计算总净重 & 运费总额
    let _realPrice = 0;
    let _arrivalGoodsWeight = 0;
    let _goodsWeight = 0;

    changeRows.forEach(record => {
      const realPrice = record.realPrice;
      const arrivalGoodsWeight = record.arrivalGoodsWeight;
      const goodsWeight = record.goodsWeight;
      const key = record.id;

      const i = selectedRowKeys.indexOf(key);
      if (selected) {
        if (i === -1) selectedRowKeys.push(key);
      } else {
        selectedRowKeys.splice(i, 1);
      }

      _realPrice += realPrice || 0;
      _arrivalGoodsWeight += arrivalGoodsWeight || 0;
      _goodsWeight += goodsWeight || 0;
      if (selected) {
        setCheckTotal({
          waitPayNum: _realPrice,
          goodsWeight: _goodsWeight,
          arrivalGoodsWeight: _arrivalGoodsWeight,
        });
      } else {
        setCheckTotal({
          waitPayNum: 0,
          goodsWeight: 0,
          arrivalGoodsWeight: 0,
        });
      }
    });

    setSelectedRowKeys([...selectedRowKeys]);
  };

  // 查询
  const handleSearch = () => {
    setQuery({ ...query, page: 1 });
    setSelectedRowKeys([]);
    setIsAllTransport(false);
    getRemoteData({ ...query, page: 1 });
  };

  // 重置
  const handleReset = () => {
    setQuery({
      page: 1,
      pageSize: 10,
      begin: undefined,
      end: undefined,
      trailerPlateNumber: '',
      name: '',
      dateStatus: '',
    });

    setSelectedRowKeys([]);
    setIsAllTransport(false);
    setCheckTotal({
      waitPayNum: 0,
      goodsWeight: 0,
      arrivalGoodsWeight: 0,
    });

    getRemoteData({
      page: 1,
      pageSize: 10,
      begin: undefined,
      end: undefined,
      trailerPlateNumber: '',
      name: '',
      dateStatus: '',
    });
  };

  const onChangePage = useCallback(
    (page, pageSize) => {
      setQuery({ ...query, page, pageSize });
      getRemoteData({ ...query, page, pageSize });
    },
    [dataList]
  );

  // 切页码
  const onChangePageSize = useCallback(
    (current, pageSize) => {
      setQuery({ ...query, page: 1, pageSize });
      getRemoteData({ ...query, page: 1, pageSize });
    },
    [dataList]
  );

  const onChangeAllPay = async checked => {
    setIsAllTransport(checked);

    if (!checked) {
      setSelectedRowKeys([]);
    } else {
      const time = await getStamp();
      setStamp(time);
    }
  };

  const getStamp = async () => {
    let params = {
      level: 'ms',
    };
    const res = await getTimeStamp({ params });
    if (res.status === 0) {
      let time = moment(Number(res.result)).format('YYYY-MM-DD HH:mm:ss');
      return time;
    } else {
      return false;
    }
  };

  const handleClickPayAll = async () => {
    const { id } = getQuery();

    if (!userInfo.hasPayPass) {
      Modal.warn({
        title: '未设置支付密码',
        content:
          '尚未设置支付密码, 请前往方向物流app设置，进入方向物流app -> 登录账号 -> 点击”我的”-> 点击”设置” -> 点击”密码管理” ->点击”修改支付密码” -> 设置密码 ->，设置完成后重新点击”线上支付”',
      });
      return;
    }

    if (selectedRowKeys.length <= 0 && !isAllTransport) {
      message.warn('请选择要支付的运单');
      return;
    }
    if (dataList.data.length <= 0 && isAllTransport) {
      message.warn('没有要支付的运单');
      return;
    }
    setBtnLoading(true);

    let params;
    isAllTransport
      ? (params = {
          ...payAllFilter,
          rides: id,
          payTime: stamp,
        })
      : (params = {
          tides: selectedRowKeys.join(' '),
          rides: id,
        });

    const res = await transportStatistics.calculateWaitPayInfo({ params });
    if (res.status === 0) {
      setPayInfo(res.result);
      isAllTransport ? setShowAllModal(true) : setShowModal(true);
    } else {
      message.error(`${res.detail || res.description}`);
    }

    setBtnLoading(false);
  };

  const handleReload = () => {
    getRemoteData(query);
    setSelectedRowKeys([]);
  };

  const handleChangeDate = ({ begin, end }, dateStatus) => {
    const _begin = begin ? moment(begin).format('YYYY-MM-DD HH:mm:ss') : undefined;
    const _end = end ? moment(end).format('YYYY-MM-DD HH:mm:ss') : undefined;
    setQuery({ begin: _begin, end: _end, dateStatus });
  };

  const handleChangeTrailerPlateNumber = e => {
    const trailerPlateNumber = e.target.value;
    setQuery({ ...query, trailerPlateNumber });
  };

  const handleChangeName = e => {
    const name = e.target.value;
    setQuery({ ...query, name });
  };

  return (
    <Layout {...routeView}>
      <Content
        style={{
          fontFamily:
            '-apple-system,BlinkMacSystemFont,Helvetica Neue,Helvetica,Roboto,Arial,PingFang SC,Hiragino Sans GB,Microsoft Yahei,SimSun,sans-serif',
        }}>
        <header style={{ borderRadius: 0 }}>
          专线信息
          <Tag
            color={transportFleetId ? '#FFF5F5' : '#F5F9FF'}
            style={{
              marginLeft: 10,
              color: transportFleetId ? '#e44040' : '#477AEF',
              borderColor: transportFleetId ? '#e44040' : '#477AEF',
              borderWidth: 1,
              position: 'relative',
              top: -1,
            }}>
            {transportFleetId ? '车队单' : '个人单'}
          </Tag>
          {transportFleetId && (
            <Tag
              color={dataList.payPath === 0 ? '#FFFBF4' : '#F5FFF8'}
              style={{
                color: dataList.payPath === 0 ? '#FFB741' : '#66BD7E',
                borderColor: dataList.payPath === 0 ? '#FFB741' : '#66BD7E',
                borderWidth: 1,
                position: 'relative',
                top: -1,
              }}>
              {routeInfo.payPathZn}
            </Tag>
          )}
        </header>
        <section className={styles['pay-fleetDetail-info']}>
          <div className="info-row" style={{ display: 'flex' }}>
            <div
              style={{
                flex: 1,
              }}>
              <div className="info-label" style={{ minWidth: 0, padding: 0 }}>
                发货企业：
              </div>
              <div className="info-data" style={{ verticalAlign: 'top' }}>
                {routeInfo.fromCompany ? (
                  <Tooltip placement="topLeft" title={routeInfo.fromCompany} overlayStyle={{ maxWidth: 'max-content' }}>
                    <div className="max-label" style={{ width: 180 }}>
                      {routeInfo.fromCompany}
                    </div>
                  </Tooltip>
                ) : (
                  '-'
                )}
              </div>
            </div>
            <div
              style={{
                flex: 1,
              }}>
              <div className="info-label" style={{ minWidth: 0, padding: 0 }}>
                发货地址：
              </div>
              <div className="info-data" style={{ verticalAlign: 'top' }}>
                {routeInfo.fromAddress ? (
                  <Tooltip placement="topLeft" title={routeInfo.fromAddress} overlayStyle={{ maxWidth: 'max-content' }}>
                    <div className="max-label" style={{ width: 180 }}>
                      {routeInfo.fromAddress}
                    </div>
                  </Tooltip>
                ) : (
                  '-'
                )}
              </div>
            </div>
            <div
              style={{
                flex: 1,
              }}>
              <div className="info-label" style={{ minWidth: 0, padding: 0, verticalAlign: 'top' }}>
                货品名称：
              </div>
              <div className="info-data">
                {routeInfo.goodsType ? (
                  <Tooltip placement="topLeft" title={routeInfo.goodsType} overlayStyle={{ maxWidth: 'max-content' }}>
                    <div className="max-label" style={{ width: 180 }}>
                      {routeInfo.goodsType}
                    </div>
                  </Tooltip>
                ) : (
                  '-'
                )}
              </div>
            </div>
          </div>

          <div className="info-row" style={{ display: 'flex' }}>
            <div
              style={{
                flex: 1,
              }}>
              <div className="info-label" style={{ minWidth: 0, padding: 0 }}>
                收货企业：
              </div>
              <div className="info-data" style={{ verticalAlign: 'top' }}>
                {routeInfo.toCompany ? (
                  <Tooltip placement="topLeft" title={routeInfo.toCompany} overlayStyle={{ maxWidth: 'max-content' }}>
                    <div className="max-label" style={{ width: 180 }}>
                      {routeInfo.toCompany}
                    </div>
                  </Tooltip>
                ) : (
                  '-'
                )}
              </div>
            </div>

            <div
              style={{
                flex: 1,
              }}>
              <div className="info-label" style={{ minWidth: 0, padding: 0 }}>
                收货地址：
              </div>
              <div className="info-data" style={{ verticalAlign: 'top' }}>
                {routeInfo.toAddress ? (
                  <Tooltip placement="topLeft" title={routeInfo.toAddress} overlayStyle={{ maxWidth: 'max-content' }}>
                    <div className="max-label" style={{ width: 180 }}>
                      {routeInfo.toAddress}
                    </div>
                  </Tooltip>
                ) : (
                  '-'
                )}
              </div>
            </div>

            <div
              style={{
                flex: 1,
              }}>
              <div className="info-label" style={{ minWidth: 0, padding: 0 }}>
                运费单价：
              </div>
              <div className="info-data">{Format.price(routeInfo.unitPrice)}元</div>
            </div>
          </div>

          <div className="info-row" style={{ display: 'flex' }}>
            <div
              style={{
                flex: 1,
              }}>
              <div className="info-label" style={{ minWidth: 0, padding: 0 }}>
                车队长：
              </div>
              <div className="info-data">{fleetInfo.fleetCaptainName || '-'}</div>
            </div>
            <div
              style={{
                flex: 1,
              }}>
              <div className="info-label" style={{ minWidth: 0, padding: 0 }}>
                车队名称：
              </div>
              <div className="info-data">{fleetInfo.fleetName || '-'}</div>
            </div>
            <div
              style={{
                flex: 1,
              }}></div>
          </div>
        </section>
      </Content>

      <Content style={{ marginTop: 16 }}>
        <section style={{ padding: 16 }}>
          <Search onSearch={handleSearch} onReset={handleReset} simple>
            <Search.Item label="承运时间" br>
              <DateRangePicker
                quickBtn={true}
                onChange={handleChangeDate}
                value={{ begin: query.begin, end: query.end }}
                dateStatus={query.dateStatus}
              />
            </Search.Item>
            <Search.Item label="车牌号">
              <Input
                placeholder="请输入车牌号"
                allowClear
                value={query.trailerPlateNumber}
                onChange={handleChangeTrailerPlateNumber}
              />
            </Search.Item>
            <Search.Item label="司机姓名">
              <Input placeholder="请输入司机姓名" allowClear value={query.name} onChange={handleChangeName} />
            </Search.Item>
          </Search>
          <header style={{ border: 0, margin: '4px 0', padding: '8px 0' }}>
            {/* 运单列表 */}
            <div style={{ float: 'left' }}>
              <LoadingBtn type="primary" onClick={handleClickPayAll} style={{ float: 'left' }} loading={btnLoading}>
                支付
              </LoadingBtn>
            </div>
          </header>
          <Msg>
            <Checkbox onChange={e => onChangeAllPay(e.target.checked)} checked={isAllTransport}>
              全选(支持跨分页)
            </Checkbox>
            <span style={{ marginRight: 32 }}>
              {isAllTransport || selectedRowKeys.length ? <span style={{ marginRight: 12 }}>已选</span> : ''}
              运单数
              <span className="total-num">
                {isAllTransport ? dataList.count : selectedRowKeys.length || dataList.count}
              </span>
              单
            </span>
            <span style={{ marginRight: 32 }}>
              发货净重
              <span className="total-num">
                {Format.weight(selectedRowKeys.length > 0 ? checkTotal.goodsWeight : dataList.goodsWeight)}
              </span>
              吨
            </span>
            <span>
              收货净重
              <span className="total-num">
                {Format.weight(
                  selectedRowKeys.length > 0 ? checkTotal.arrivalGoodsWeight : dataList.arrivalGoodsWeight
                )}
              </span>
              吨
            </span>
          </Msg>
          <Table
            loading={loading}
            dataSource={dataList.data}
            columns={columns}
            rowKey={(record, i) => (isAllTransport ? i : record.id)}
            pagination={{
              onChange: onChangePage,
              pageSize: query.pageSize,
              current: query.page,
              total: dataList.count,
            }}
            scroll={{ x: 'auto' }}
            rowSelection={{
              selectedRowKeys: isAllTransport ? seletedKeysIndex : selectedRowKeys,
              onSelect: onSelectRow,
              onSelectAll: onSelectAll,
              getCheckboxProps: record => ({
                disabled: isAllTransport,
              }),
            }}
          />
        </section>
      </Content>
      {/* 车队单 start */}

      {/* 批量结算 */}
      <Modal
        maskClosable={false}
        title="批量支付"
        visible={showModal}
        destroyOnClose
        onCancel={() => setShowModal(false)}
        footer={null}>
        <FleetBatchConfirm
          payInfo={payInfo}
          payId={selectedRowKeys}
          rides={getQuery().id}
          onFinish={() => {
            setShowModal(false);
            handleSearch();
          }}
        />
      </Modal>

      {/* 结算全部 */}
      <Modal
        maskClosable={false}
        title="全部支付"
        visible={showAllModal}
        destroyOnClose
        onCancel={() => setShowAllModal(false)}
        footer={null}>
        <FleetAllConfirm
          payInfo={payInfo}
          payAllFilter={payAllFilter}
          rides={getQuery().id}
          onFinish={() => {
            setIsAllTransport(false);
            setShowAllModal(false);
            handleSearch();
          }}
        />
      </Modal>
      {/* 车队单 end */}

      <DrawerInfo
        title="运单详情"
        onClose={() => setShowDetail(false)}
        showDrawer={showDetail}
        width="664"
        afterClose={handleReload}>
        {showDetail && <Detail id={transportId} close={() => setShowDetail(false)} />}
      </DrawerInfo>
    </Layout>
  );
  // }
};

export default RailWayPay;
