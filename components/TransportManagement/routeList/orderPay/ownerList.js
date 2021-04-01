/** @format */
// 弃用

import React, { PureComponent } from 'react';
import { DatePicker, Input, Button, Table, message, Modal, Tooltip, Dropdown, Menu, Select } from 'antd';
import moment from 'moment';
import { Content, Search, Msg } from '@components';
import { keepState, getState, clearState } from '@utils/common';
import { transportStatistics } from '@api';
import BatchConfirm from '@components/TransportManagement/routeList/orderPay/personalBatchConfirm';
import router from 'next/router';
const formatWeight = value => {
  return ((value || 0) / 1000).toFixed(2);
};

const formatPrice = value => {
  return ((value || 0) / 100).toFixed(2);
};
class OwnerList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      columns: [
        {
          title: '车牌号',
          dataIndex: 'trailerPlateNumber',
          key: 'trailerPlateNumber',
          width: 100,
          render: value => {
            return value || '-';
          },
        },
        {
          title: '司机姓名',
          dataIndex: 'name',
          key: 'name',
          width: 100,
          render: value => {
            return value || '-';
          },
        },
        {
          title: '发货净重(吨)',
          dataIndex: 'goodsWeight',
          key: 'goodsWeight',
          align: 'right',
          width: 120,
          render: formatWeight,
        },
        {
          title: '收货净重(吨)',
          dataIndex: 'arrivalGoodsWeight',
          key: 'arrivalGoodsWeight',
          width: 120,
          align: 'right',
          render: formatWeight,
        },
        {
          title: '路损(吨)',
          dataIndex: 'loss',
          key: 'loss',
          width: 120,
          align: 'right',
          render: formatWeight,
        },
        {
          title: '运费单价(元)',
          dataIndex: 'unitPrice',
          key: 'unitPrice',
          width: 120,
          align: 'right',
          render: formatPrice,
        },
        {
          //运费总额
          title: '预计运费(元)',
          dataIndex: 'price2',
          key: 'price2',
          width: 120,
          align: 'right',
          render: formatPrice,
        },
        {
          title: '发货企业',
          dataIndex: 'fromCompany',
          key: 'fromCompany',
          width: 200,
          render: value => {
            return (
              <Tooltip title={value} overlayStyle={{ maxWidth: 'max-content' }}>
                <div className="max-label" style={{ width: 150 }}>
                  {value || '-'}
                </div>
              </Tooltip>
            );
          },
        },
        {
          title: '收货企业',
          dataIndex: 'toCompany',
          key: 'toCompany',
          width: 200,
          render: value => {
            return (
              <Tooltip title={value} overlayStyle={{ maxWidth: 'max-content' }}>
                <div className="max-label" style={{ width: 150 }}>
                  {value || '-'}
                </div>
              </Tooltip>
            );
          },
        },
        {
          title: '货品名称',
          dataIndex: 'goodsType',
          key: 'goodsType',
          width: 120,
          render: value => {
            return (
              <Tooltip title={value} overlayStyle={{ maxWidth: 'max-content' }}>
                <div className="max-label" style={{ width: 100 }}>
                  {value || '-'}
                </div>
              </Tooltip>
            );
          },
        },
        {
          title: '承运时间',
          dataIndex: 'createdAt',
          key: 'createdAt',
          width: 220,
          render: value => {
            return value || '-';
          },
        },
        {
          title: '操作',
          dataIndex: 'id',
          key: 'id',
          width: 50,
          fixed: 'right',
          render: value => {
            return (
              <Button type="link" size="small" onClick={() => router.push(`/transport/pay/detail?id=${value}`)}>
                详情
              </Button>
            );
          },
        },
      ],
      dataList: {},
      loading: false,
      pageSize: 10,
      page: 1,
      selectedRowKeys: [],
      selectedOrders: [],
    };
  }

  // 首次加载
  componentDidMount() {
    const { isServer, hasPayPass } = this.props;
    if (isServer) {
      // 如果是点击浏览器刷新 即为服务端渲染 则清空保存的状态
      clearState();
    }
    const { query } = getState();
    this.setState({ ...query, hasPayPass }, this.setDataList);
  }

  // 获取数据
  setDataList = async () => {
    this.setState({
      loading: true,
    });
    const { begin, end, trailerPlateNumber, name, page, pageSize } = this.state;
    const params = {
      limit: pageSize,
      page,
      begin: begin || undefined,
      end: end || undefined,
      trailerPlateNumber: trailerPlateNumber || undefined,
      name: name || undefined,
    };
    const res = await transportStatistics.getWaitPayTransportList({ params });
    if (res.status === 0) {
      this.setState(
        {
          dataList: res.result,
        },
        () => {
          // 持久化状态
          keepState({
            query: {
              page: this.state.page,
              pageSize: this.state.pageSize,
              begin: this.state.begin,
              end: this.state.end,
              name: this.state.name,
              trailerPlateNumber: this.state.trailerPlateNumber,
            },
          });
        }
      );
    } else {
      message.error(`${res.detail || res.description}`);
    }
    this.setState({
      loading: false,
    });
  };

  // 查询
  query = () => {
    this.setState(
      {
        page: 1,
        selectedRowKeys: [],
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
        name: '',
        trailerPlateNumber: '',
        page: 1,
        pageSize: 10,
      },
      this.setDataList
    );
  };

  // 分页
  onChangePage = page => {
    this.setState(
      {
        page,
      },
      this.setDataList
    );
  };

  onChangePageSize = pageSize => {
    this.setState(
      {
        page: 1,
        pageSize,
      },
      this.setDataList
    );
  };

  // 选择行
  onSelectRow = (keys, rows) => {
    this.setState({
      selectedRowKeys: keys,
    });
  };

  // 批量结算
  submit = () => {
    // 未设置支付密码;
    if (!this.state.hasPayPass) {
      Modal.warn({
        title: '未设置支付密码',
        content:
          '尚未设置支付密码, 请前往方向物流app设置，进入方向物流app -> 登录账号 -> 点击”我的”-> 点击”设置” -> 点击”密码管理” ->点击”修改支付密码” -> 设置密码 ->，设置完成后重新点击”线上支付”',
      });
      return;
    }

    const { selectedRowKeys } = this.state;
    if (selectedRowKeys.length === 0) {
      message.warn('还没有选择运单');
      return;
    }
    this.setState({
      showModal: true,
    });
  };

  // 支付时 报错 异常处理
  handleError = () => {
    this.setState(
      {
        selectedRowKeys: [],
        page: 1,
      },
      this.setDataList
    );
  };

  render() {
    const {
      columns,
      dataList,
      loading,
      page,
      begin,
      end,
      trailerPlateNumber,
      name,
      pageSize,
      selectedRowKeys,
    } = this.state;

    return (
      <>
        <Search onSearch={this.query} onReset={this.reset} simple>
          <Search.Item label="承运时间" br>
            <DatePicker.RangePicker
              value={begin && end ? [moment(begin), moment(end)] : undefined}
              showTime={{
                defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
              }}
              onChange={(value, string) => {
                this.setState({
                  begin: string[0],
                  end: string[1],
                });
              }}
              style={{ width: 376 }}></DatePicker.RangePicker>
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

          <Search.Item label="运单类型">
            <Select
              style={{ width: '100%' }}
              // value={status}
              placeholder="请选择运单类型"
              allowClear
              // onChange={value => setStatus(value)}
            >
              <Select.Option label="个人运单" key={0}>
                个人运单
              </Select.Option>
              <Select.Option label="车队运单" key={1}>
                车队运单
              </Select.Option>
            </Select>
          </Search.Item>
        </Search>

        <header style={{ padding: '12px 0', marginTop: 12, border: 0 }}>
          运单列表
          {/* <div style={{ float: 'right' }}>
            <Dropdown
              overlay={() => (
                <Menu>
                  <Menu.Item key="1" onClick={this.submit}>
                    结算选中
                  </Menu.Item>
                </Menu>
              )}>
              <Button type="primary">
                结算
                <Icon type="down" />
              </Button>
            </Dropdown>
          </div> */}
        </header>
        <Msg>
          <span>
            运单总数<span className="total-num"></span>单
          </span>
          <span style={{ marginLeft: 32 }}>
            已结算运费<span className="total-num"></span>吨
          </span>
          <span style={{ marginLeft: 32 }}>
            待结算运费<span className="total-num"></span>元
          </span>
          <span style={{ marginLeft: 32 }}>
            原发总净重<span className="total-num"></span>元
          </span>
          <span style={{ marginLeft: 32 }}>
            实收总净重<span className="total-num"></span>元
          </span>
        </Msg>
        <Table
          loading={loading}
          dataSource={dataList.data}
          columns={columns}
          rowKey={item => `${item.id}:${item.price}`}
          scroll={{ x: 1590 }}
          pagination={{
            onChange: page => this.onChangePage(page),
            onShowSizeChange: (current, size) => this.onChangePageSize(size),
            pageSize: pageSize,
            current: page,
            total: dataList.count,
          }}
          // rowSelection={{
          //   fixed: 'left',
          //   selectedRowKeys: selectedRowKeys,
          //   onChange: this.onSelectRow,
          // }}
        />

        <Modal
          maskClosable={false}
          title="批量结算确认"
          visible={this.state.showModal}
          onCancel={() => this.setState({ showModal: false })}
          footer={null}>
          <BatchConfirm
            afterPay={() => {
              this.setState(
                {
                  page: 1,
                  selectedRowKeys: [],
                },
                this.setDataList
              );
            }}
            onError={() => this.handleError()}
            payId={this.state.selectedRowKeys}
            onPayError={() => this.setDataList()}
            onClose={() => this.setState({ showModal: false })}></BatchConfirm>
        </Modal>
      </>
    );
  }
}

export default OwnerList;
