/** @format */
// 弃用
import React, { PureComponent } from 'react';
import { Row, Col, DatePicker, Input, Button, Table, Tooltip } from 'antd';
import moment from 'moment';
import { Content, Search } from '@components';
import { keepState, getState, clearState } from '@utils/common';
import { transportStatistics } from '@api';
import router from 'next/router';

const formatPrice = value => {
  return ((value || 0) / 100).toFixed(2);
};
class FleetList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      columns: [
        {
          title: '车队长',
          dataIndex: 'name',
          key: 'name',
          width: 150,
          render: value => {
            return value || '-';
          },
        },
        {
          title: '车队名称',
          dataIndex: 'fleetName',
          key: 'fleetName',
          width: 150,
          render: value => {
            return value || '-';
          },
        },
        {
          title: '待结算车次',
          dataIndex: 'num',
          key: 'num',
          align: 'right',
          width: 110,
        },
        {
          title: '待结算运费(元)',
          dataIndex: 'price',
          key: 'price',
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
          width: 150,
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
          title: '创建时间',
          dataIndex: 'createdAt',
          key: 'createdAt',
          width: 220,
        },
        {
          title: '操作',
          dataIndex: 'id',
          key: 'id',
          width: 50,
          fixed: 'right',
          render: value => {
            return (
              <Button type="link" size="small" onClick={() => router.push(`/transport/pay/railWayDetail?id=${value}`)}>
                详情
              </Button>
            );
          },
        },
      ],
      dataList: {},
      loading: false,
      page: 1,
      pageSize: 10,
    };
  }

  componentDidMount() {
    const { isServer } = this.props;
    if (isServer) {
      // 如果是点击浏览器刷新 即为服务端渲染 则清空保存的状态
      clearState();
    }
    const { query } = getState();
    this.setState(query, this.setDataList);
  }

  setDataList = async () => {
    this.setState({
      loading: true,
    });
    const { begin, end, filterParams, page, pageSize } = this.state;
    const params = {
      limit: pageSize,
      page,
      begin: begin || undefined,
      end: end || undefined,
      filterParams: filterParams || undefined,
    };
    const res = await transportStatistics.getWaitPayFleetTransportList({ params });
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
              filterParams: this.state.filterParams,
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

  query = () => {
    this.setState(
      {
        page: 1,
      },
      this.setDataList
    );
  };

  reset = () => {
    this.setState(
      {
        begin: undefined,
        end: undefined,
        filterParams: undefined,
        page: 1,
        pageSize: 10,
      },
      this.setDataList
    );
  };

  onChangePage = (page, pageSize) => {
    this.setState(
      {
        page,
        pageSize,
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

  render() {
    const { columns, dataList, loading, page, pageSize, begin, end, filterParams } = this.state;
    return (
      <>
        <Search onSearch={this.query} onReset={this.reset}>
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
              style={{ width: 400 }}
            />
          </Search.Item>
          <Search.Item label="车队长姓名">
            <Input
              placeholder="请输入车队长姓名"
              allowClear
              value={filterParams}
              onChange={e =>
                this.setState({
                  filterParams: e.target.value,
                })
              }
            />
          </Search.Item>
        </Search>
        <Content style={{ marginTop: 24 }}>
          <header>车队单列表</header>
          <section>
            <Table
              loading={loading}
              dataSource={dataList.data}
              columns={columns}
              scroll={{ x: 1500 }}
              pagination={{
                onChange: (page, pageSize) => this.onChangePage(page, pageSize),
                pageSize,
                current: page,
                total: dataList.count,
              }}
            />
          </section>
        </Content>
      </>
    );
  }
}

export default FleetList;
