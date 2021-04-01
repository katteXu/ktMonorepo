/** @format */

import React, { PureComponent } from 'react';
import { Table, Input, Button, Modal, message, Tooltip, Tag, Checkbox } from 'antd';
import { Layout, Content, Search, Msg, DrawerInfo, DateRangePicker, LoadingBtn } from '@components';
import styles from './styles.less';
import Detail from '@components/Transport/detail';
import router from 'next/router';
import Link from 'next/link';
import moment from 'moment';
import { keepState, getState, Format } from '@utils/common';
import { transportStatistics, getTimeStamp } from '@api';
import FleetBatchConfirm from '@components/Transport/flowPay/FleetBatchConfirm';
import FleetAllConfirm from '@components/Transport/flowPay/FleetAllConfirm';
import { getQuery } from '@utils/common';
const formatWeight = value => {
  return ((value || 0) / 1000).toFixed(2);
};

const formatPrice = value => {
  return ((value || 0) / 100).toFixed(2);
};
class railWayPay extends PureComponent {
  static async getInitialProps(props) {
    const { isServer, userInfo } = props;
    return { userInfo };
  }
  constructor(props) {
    super(props);
    this.state = {
      routeView: {
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
      },
      loading: false,
      page: 1,
      columns: [
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
          render: formatWeight,
        },
        {
          title: '收货净重(吨)',
          dataIndex: 'arrivalGoodsWeight',
          key: 'arrivalGoodsWeight',
          width: 130,
          align: 'right',
          render: formatWeight,
        },
        {
          title: '运费单价(元)',
          dataIndex: 'unitPrice',
          key: 'unitPrice',
          width: 130,
          align: 'right',
          render: formatPrice,
        },
        {
          title: '结算运费(元)',
          dataIndex: 'price',
          key: 'price',
          width: 130,
          align: 'right',
          render: formatPrice,
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
              <Button
                type="link"
                size="small"
                // onClick={() => router.push(`/transport/transportStatistics/allDetail?id=${value}`)}>
                onClick={() => this.handleShowDetail(value)}>
                详情
              </Button>
            );
          },
        },
      ],
      dataList: {},
      routeInfo: {},
      fleetInfo: {},
      selectedRowKeys: [],
      pageSize: 10,
      payInfo: {}, // 支付信息
      isAllTransport: false,
      btnLoading: false,
      seletedKeysIndex: [],
      stamp: '',
      // active: undefined,
      showModal: false,
      showAllModal: false,
      checkTotal: {
        waitPayNum: 0,
        goodsWeight: 0,
        arrivalGoodsWeight: 0,
      },
    };
  }

  componentDidMount() {
    const { id } = getQuery();
    const { hasPayPass } = this.props.userInfo;
    this.setState({
      hasPayPass,
      rides: id,
    });
    this.setDataList();

    if (getState().drawInfo.show) {
      this.handleShowDetail(getState().drawInfo.transportId);
    }
  }

  componentWillUpdate(props, state) {
    if (state.showAllModal !== this.state.showAllModal) {
      setTimeout(
        show => {
          document.body.style.overflow = show ? 'hidden' : 'visible';
        },
        500,
        state.showAllModal
      );
    }

    if (state.showModal !== this.state.showModal) {
      setTimeout(
        show => {
          document.body.style.overflow = show ? 'hidden' : 'visible';
        },
        500,
        state.showModal
      );
    }

    if (state.showDetail !== this.state.showDetail) {
      keepState({
        drawInfo: {
          show: state.showDetail,
          transportId: state.transportId,
        },
      });
    }
  }

  setDataList = async () => {
    this.setState({
      loading: true,
    });
    const { id } = getQuery();
    const { begin, end, trailerPlateNumber, page, pageSize, name } = this.state;
    const params = {
      limit: pageSize,
      page,
      id,
      begin: begin || undefined,
      end: end || undefined,
      trailerPlateNumber: trailerPlateNumber || undefined,
      name: name || undefined,
    };

    const res = await transportStatistics.getWaitPayFleetTransportDetailList({
      params,
    });
    if (res.status === 0) {
      this.setState({
        seletedKeysIndex: [...new Array(res.result.data.length).keys()],
        dataList: res.result,
        routeInfo: res.result.routeInfo,
        fleetInfo: res.result.fleetInfo,
        transportFleetId: res.result.transportFleetId,
        isFleet: res.result.fleetInfo.fleetName !== '',
        payAllFilter: {
          begin,
          end,
          trailerPlateNumber,
          name,
        },
      });
    }

    this.setState({
      loading: false,
    });
  };

  // 选中单一值
  onSelectRow = (record, selected, selectedRows, nativeEvent) => {
    const { selectedRowKeys, isFleet } = this.state;

    const realPrice = record.realPrice;
    const arrivalGoodsWeight = record.arrivalGoodsWeight;
    const goodsWeight = record.goodsWeight;

    const key = record.id;
    if (selected) {
      this.setState({
        selectedRowKeys: [...selectedRowKeys, key],
      });
    } else {
      const i = selectedRowKeys.indexOf(key);
      selectedRowKeys.splice(i, 1);
      this.setState({
        selectedRowKeys: [...selectedRowKeys],
      });
    }

    // 计算总净重 & 运费总额
    let _realPrice = 0;
    let _arrivalGoodsWeight = 0;
    let _goodsWeight = 0;
    _realPrice += realPrice || 0;
    _arrivalGoodsWeight += arrivalGoodsWeight || 0;
    _goodsWeight += goodsWeight || 0;
    const total = this.state.checkTotal;
    if (selected) {
      this.setState({
        checkTotal: {
          waitPayNum: total.waitPayNum + _realPrice,
          goodsWeight: total.goodsWeight + _goodsWeight,
          arrivalGoodsWeight: total.arrivalGoodsWeight + _arrivalGoodsWeight,
        },
      });
    } else {
      this.setState({
        checkTotal: {
          waitPayNum: total.waitPayNum - _realPrice,
          goodsWeight: total.goodsWeight - _goodsWeight,
          arrivalGoodsWeight: total.arrivalGoodsWeight - _arrivalGoodsWeight,
        },
      });
    }
  };

  // 选中所有
  onSelectAll = (selected, selectedRows, changeRows) => {
    const { selectedRowKeys, isFleet } = this.state;
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
        this.setState({
          checkTotal: {
            waitPayNum: _realPrice,
            goodsWeight: _goodsWeight,
            arrivalGoodsWeight: _arrivalGoodsWeight,
          },
        });
      } else {
        this.setState({
          checkTotal: {
            waitPayNum: 0,
            goodsWeight: 0,
            arrivalGoodsWeight: 0,
          },
        });
      }
    });

    this.setState({
      selectedRowKeys: [...selectedRowKeys],
    });
  };

  query = () => {
    this.setState(
      {
        page: 1,
        selectedRowKeys: [],
        isAllTransport: false,
      },
      this.setDataList
    );
  };

  // 重置
  reset = () => {
    this.setState(
      {
        begin: undefined,
        end: undefined,
        trailerPlateNumber: undefined,
        name: undefined,
        page: 1,
        selectedRowKeys: [],
        pageSize: 10,
        isAllTransport: false,
        dateStatus: '',
        checkTotal: {
          waitPayNum: 0,
          goodsWeight: 0,
          arrivalGoodsWeight: 0,
        },
      },
      this.setDataList
    );
  };

  onChangePage = page => {
    this.setState(
      {
        page,
      },
      this.setDataList
    );
  };

  // 切换最大页数
  onChangePageSize = (current, size) => {
    this.setState(
      {
        page: 1,
        pageSize: size,
      },
      this.setDataList
    );
  };

  onChangeAllPay = async e => {
    this.setState({
      isAllTransport: e,
    });
    if (!e) {
      this.setState({
        selectedRowKeys: [],
      });
    } else {
      const time = await this.getStamp();
      this.setState({
        stamp: time,
      });
    }
  };

  getStamp = async () => {
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
  handleClickPayAll = async () => {
    // 未设置支付密码;
    if (!this.state.hasPayPass) {
      Modal.warn({
        title: '未设置支付密码',
        content:
          '尚未设置支付密码, 请前往方向物流app设置，进入方向物流app -> 登录账号 -> 点击”我的”-> 点击”设置” -> 点击”密码管理” ->点击”修改支付密码” -> 设置密码 ->，设置完成后重新点击”线上支付”',
      });
      return;
    }
    const { selectedRowKeys, isAllTransport, payAllFilter, rides, dataList, stamp } = this.state;
    if (selectedRowKeys.length <= 0 && !isAllTransport) {
      message.warn('请选择要支付的运单');
      return;
    }
    if (dataList.data.length <= 0 && isAllTransport) {
      message.warn('没有要支付的运单');
      return;
    }
    this.setState({
      btnLoading: true,
    });
    let params;
    isAllTransport
      ? (params = {
          ...payAllFilter,
          rides: rides,
          payTime: stamp,
        })
      : (params = {
          tides: selectedRowKeys.join(' '),
          rides: rides,
        });

    const res = await transportStatistics.calculateWaitPayInfo({ params });
    if (res.status === 0) {
      this.setState({
        btnLoading: false,
        payInfo: res.result,
      });
      isAllTransport ? this.setState({ showAllModal: true }) : this.setState({ showModal: true });
    } else {
      message.error(`${res.detail || res.description}`);
      this.setState({
        btnLoading: false,
      });
    }
  };

  // 展示详情
  handleShowDetail = id => {
    this.setState({
      showDetail: true,
      transportId: id,
    });
  };

  // 刷新
  handleReload = () => {
    this.setDataList();
    this.setState({ selectedRowKeys: [] });
  };

  // handleActive = value => {
  //   this.setState({
  //     active: value,
  //   });
  // };
  handleChangeDate = ({ begin, end }, dateStatus) => {
    const _begin = begin ? moment(begin).format('YYYY-MM-DD HH:mm:ss') : undefined;
    const _end = end ? moment(end).format('YYYY-MM-DD HH:mm:ss') : undefined;

    this.setState({
      begin: _begin,
      end: _end,
      dateStatus,
    });
    // setQuery(() => ({ ...query, begin: _begin, end: _end }));
  };

  render() {
    const {
      routeView,
      columns,
      dataList,
      loading,
      page,
      begin,
      end,
      routeInfo,
      fleetInfo,
      selectedRowKeys,
      pageSize,
      trailerPlateNumber,
      name,
      payAllFilter,
      transportFleetId,
      payInfo,
      isAllTransport,
      btnLoading,
      seletedKeysIndex,
    } = this.state;
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
                color: transportFleetId ? '#e44040' : '#3d86ef',
                borderColor: transportFleetId ? '#e44040' : '#3d86ef',
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
                    <Tooltip
                      placement="topLeft"
                      title={routeInfo.fromCompany}
                      overlayStyle={{ maxWidth: 'max-content' }}>
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
                    <Tooltip
                      placement="topLeft"
                      title={routeInfo.fromAddress}
                      overlayStyle={{ maxWidth: 'max-content' }}>
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
                <div className="info-data">{formatPrice(routeInfo.unitPrice)}元</div>
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
            <Search onSearch={this.query} onReset={this.reset} simple>
              <Search.Item label="承运时间" br>
                {/* <DatePickerTime
                  onChange={this.handleChangeDate}
                  value={{ begin: this.state.begin, end: this.state.end }}
                  dateStatus={this.state.dateStatus}
                  style={{ width: 400 }}
                /> */}
                <DateRangePicker
                  quickBtn={true}
                  onChange={this.handleChangeDate}
                  value={{ begin: this.state.begin, end: this.state.end }}
                  dateStatus={this.state.dateStatus}
                />
              </Search.Item>
              <Search.Item label="车牌号">
                <Input
                  placeholder="请输入车牌号"
                  allowClear
                  value={trailerPlateNumber}
                  onChange={e =>
                    this.setState({
                      trailerPlateNumber: e.target.value,
                    })
                  }
                />
              </Search.Item>
              <Search.Item label="司机姓名">
                <Input
                  placeholder="请输入司机姓名"
                  allowClear
                  value={name}
                  onChange={e =>
                    this.setState({
                      name: e.target.value,
                    })
                  }
                />
              </Search.Item>
            </Search>
            <header style={{ border: 0, margin: '4px 0', padding: '8px 0' }}>
              {/* 运单列表 */}
              <div style={{ float: 'left' }}>
                <LoadingBtn
                  type="primary"
                  onClick={() => this.handleClickPayAll()}
                  style={{ float: 'left' }}
                  loading={btnLoading}>
                  支付
                </LoadingBtn>
              </div>
            </header>
            <Msg>
              <Checkbox onChange={e => this.onChangeAllPay(e.target.checked)} checked={isAllTransport}>
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
                  {/* {Format.weight(dataList.goodsWeight || 0)} */}
                  {Format.weight(selectedRowKeys.length > 0 ? this.state.checkTotal.goodsWeight : dataList.goodsWeight)}
                </span>
                吨
              </span>
              <span>
                收货净重
                <span className="total-num">
                  {/* {Format.weight(dataList.arrivalGoodsWeight || 0)} */}
                  {Format.weight(
                    selectedRowKeys.length > 0 ? this.state.checkTotal.arrivalGoodsWeight : dataList.arrivalGoodsWeight
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
                onChange: page => this.onChangePage(page),
                onShowSizeChange: this.onChangePageSize,
                pageSize,
                current: page,
                total: dataList.count,
              }}
              scroll={{ x: 'auto' }}
              rowSelection={{
                selectedRowKeys: isAllTransport ? seletedKeysIndex : selectedRowKeys,
                onSelect: this.onSelectRow,
                onSelectAll: this.onSelectAll,
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
          visible={this.state.showModal}
          destroyOnClose
          onCancel={() => this.setState({ showModal: false })}
          footer={null}>
          <FleetBatchConfirm
            payInfo={payInfo}
            payId={this.state.selectedRowKeys}
            rides={this.state.rides}
            onFinish={() => {
              this.setState({ showModal: false }, this.query);
            }}
          />
        </Modal>

        {/* 结算全部 */}
        <Modal
          maskClosable={false}
          title="全部支付"
          visible={this.state.showAllModal}
          destroyOnClose
          onCancel={() => this.setState({ showAllModal: false })}
          footer={null}>
          <FleetAllConfirm
            payInfo={payInfo}
            payAllFilter={payAllFilter}
            rides={this.state.rides}
            onFinish={() => {
              this.setState({ isAllTransport: false, showAllModal: false }, this.query);
            }}
          />
        </Modal>
        {/* 车队单 end */}

        <DrawerInfo
          title="运单详情"
          onClose={() => this.setState({ showDetail: false })}
          showDrawer={this.state.showDetail}
          width="664"
          afterClose={this.handleReload}>
          {this.state.showDetail && (
            <Detail id={this.state.transportId} close={() => this.setState({ showDetail: false })} />
          )}
        </DrawerInfo>
      </Layout>
    );
  }
}

export default railWayPay;
