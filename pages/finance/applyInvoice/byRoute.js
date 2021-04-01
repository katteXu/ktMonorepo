/** @format */

import React, { PureComponent } from 'react';
import { DownOutlined } from '@ant-design/icons';
import { Input, DatePicker, Button, Table, Modal, message, Tooltip, Dropdown, Menu } from 'antd';
import moment from 'moment';
import { Layout, Content, Search, Msg } from '@components';
import router from 'next/router';
import Link from 'next/link';
import { finance } from '@api';
import personalApi from '@api/personalCenter';

const formatPrice = value => {
  return ((value || 0) / 100).toFixed(2);
};

class ApplyInvoiceByRoute extends PureComponent {
  static async getInitialProps(props) {
    const { isServer } = props;
    return {};
  }
  constructor(props) {
    super(props);
    this.state = {
      routeView: {
        title: '专线列表',
        pageKey: 'applyInvoice',
        longKey: 'finance.applyInvoice',
        breadNav: [
          '财务中心',
          <Link href="/finance/applyInvoice">
            <a>申请开票</a>
          </Link>,
          '专线列表',
        ],
        pageTitle: '专线列表',
        useBack: true,
      },
      columns: [
        {
          title: '专线号',
          dataIndex: 'id',
          key: 'routeId',
          width: 80,
        },
        {
          title: '发货企业',
          dataIndex: 'fromCompany',
          width: 180,
          key: 'fromCompany',
          render: value => {
            return (
              <Tooltip title={value} overlayStyle={{ maxWidth: 'max-content' }}>
                <div className="max-label" style={{ width: 160 }}>
                  {value || '-'}
                </div>
              </Tooltip>
            );
          },
        },
        {
          title: '收货企业',
          dataIndex: 'toCompany',
          width: 180,
          key: 'toCompany',
          render: value => {
            return (
              <Tooltip title={value} overlayStyle={{ maxWidth: 'max-content' }}>
                <div className="max-label" style={{ width: 160 }}>
                  {value || '-'}
                </div>
              </Tooltip>
            );
          },
        },
        {
          title: '货品名称',
          dataIndex: 'goodsType',
          width: 100,
          key: 'goodsType',
          render: value => {
            return (
              <Tooltip title={value} overlayStyle={{ maxWidth: 'max-content' }}>
                <div className="max-label" style={{ width: 83 }}>
                  {value || '-'}
                </div>
              </Tooltip>
            );
          },
        },
        {
          title: '运费单价(元/吨)',
          dataIndex: 'unitPrice',
          width: 180,
          key: 'unitPrice',
          render: formatPrice,
        },
        {
          title: '车队长',
          dataIndex: 'fleetCaptionId',
          width: 120,
          key: 'fleetCaptionId',
          render: (value, record) => {
            return value === 0 ? '-' : record.fleetCaptionName;
          },
        },
        {
          title: '发货净重',
          dataIndex: 'goodsWeight',
          width: 120,
          key: 'goodsWeight',
          render: (value, record) => {
            return `${((value || 0) / 1000).toFixed(2)}`;
          },
        },
        {
          title: '收货净重',
          dataIndex: 'arrivalGoodsWeight',
          width: 120,
          key: 'arrivalGoodsWeight',
          render: (value, record) => {
            return `${((value || 0) / 1000).toFixed(2)}`;
          },
        },

        {
          title: '运费(元)',
          dataIndex: 'priceSum',
          key: 'priceSum',
          width: 120,
          render: formatPrice,
        },
        {
          title: '创建时间',
          dataIndex: 'createdAt',
          key: 'createdAt',
          // width: 220,
        },
        {
          title: '操作',
          key: 'ctrl',
          fixed: 'right',
          width: 100,
          render: (value, record) => {
            return (
              <Button type="link" size="small" onClick={() => router.push(`/railWay/mine/detail?id=${record.id}`)}>
                详情
              </Button>
            );
          },
        },
      ],
      loading: true,
      dataList: {},
      selectedRowKeys: [],
      page: 1,
      pageSize: 100,
      totalPrice: 0,
      totalWeight: 0,
      btnLoading: false,
      allFilter: {},
      defaultTotalWeight: 0,
      defaultTotalPrice: 0,
      defaultInvoicePrice: 0,
    };
  }

  componentDidMount() {
    this.setDataList();
    this.getInvoiceInfo();
  }

  // 翻页
  onChangePage = page => {
    this.setState({ page }, this.setDataList);
  };

  // 选择行
  onSelectRow = (keys, rows) => {
    this.setState({
      selectedRowKeys: keys,
      selectedRowData: rows,
    });
  };

  // 加载数据
  setDataList = async () => {
    this.setState({
      loading: true,
    });
    const { page, fromCompany, toCompany, begin, end, goodsType, routeId, pageSize } = this.state;
    const params = {
      page,
      limit: pageSize,
      fromCompany: fromCompany || undefined,
      toCompany: toCompany || undefined,
      begin: begin || undefined,
      end: end || undefined,
      goodsType: goodsType || undefined,
      routeId: routeId || undefined,
    };
    const res = await finance.getApplyInvoiceListByRoute({ params });
    if (res.status === 0) {
      this.setState({
        dataList: res.result,
        defaultTotalWeight: res.result.arrivalGoodsWeight,
        defaultTotalPrice: res.result.price,
        defaultInvoicePrice: res.result.invoice_price,
        allFilter: {
          fromCompany,
          toCompany,
          begin,
          end,
          goodsType,
          routeId,
        },
      });
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
        totalPrice: 0,
        totalWeight: 0,
      },
      this.setDataList
    );
  };

  // 行计算
  rowComput = (selectRow, selected) => {
    let { totalPrice, totalWeight } = this.state;
    const { priceSum, arrivalGoodsWeight } = selectRow;
    if (selected) {
      totalPrice += priceSum;
      totalWeight += arrivalGoodsWeight;
    } else {
      totalPrice -= priceSum;
      totalWeight -= arrivalGoodsWeight;
    }
    this.setState({
      totalPrice,
      totalWeight,
    });
  };

  // 总计算
  allRowComput = (selected, selectedRows, changeRows) => {
    let { totalPrice, totalWeight } = this.state;
    let _totalPrice = 0;
    let _totalWeight = 0;
    changeRows.forEach(item => {
      _totalPrice += item.priceSum;
      _totalWeight += item.arrivalGoodsWeight;
    });
    this.setState({
      totalPrice: selected ? totalPrice + _totalPrice : totalPrice - _totalPrice,
      totalWeight: selected ? totalWeight + _totalWeight : totalWeight - _totalWeight,
    });
  };

  // 提交数据
  submit = async ({ isSwitch = false } = {}) => {
    const { selectedRowKeys, totalPrice, invoiceId, selectedRowData } = this.state;
    const { bossId } = localStorage;
    if (!invoiceId) {
      if (bossId) {
        Modal.confirm({
          title: '暂无开票信息',
          content: '此账号无权限维护开票信息，请联系主账号',
        });
      } else {
        Modal.confirm({
          title: '暂无开票信息',
          content: '请到个人中心维护开票信息',
          onOk: () => {
            router.push('/personal/invoice/edit?status=new');
          },
        });
      }
      return;
    }

    if (selectedRowKeys.length === 0) {
      message.error('请选择申请数据');
      return;
    }

    this.setState({
      btnLoading: true,
    });
    const tids = selectedRowData.reduce((total, value) => [...total, ...value.tides.split(',')], []);

    const params = {
      transportIds: tids.join(),
    };

    Modal.confirm({
      title: '提交确认',
      content: `当前选中${selectedRowKeys.length}条数据，是否提交`,
      onOk: async () => {
        const res = await finance.saveAskInvoice({ params });
        if (res.status === 0) {
          message.success('提交成功');
          this.setState(
            {
              selectedRowKeys: [],
              totalPrice: 0,
              totalWeight: 0,
            },
            () => router.push(`/finance/applyInvoice`)
          );
        } else {
          message.error(`提交失败,原因：${res.detail}`);
        }
      },
    });

    this.setState({
      btnLoading: false,
    });
  };

  submitAll = () => {
    const { invoiceId, dataList, allFilter } = this.state;
    const { count } = dataList;
    const { bossId } = localStorage;
    const { begin, end, routeId, fromCompany, toCompany, goodsType } = allFilter;
    if (!invoiceId) {
      if (bossId) {
        Modal.confirm({
          title: '暂无开票信息',
          content: '此账号无权限维护开票信息，请联系主账号',
        });
      } else {
        Modal.confirm({
          title: '暂无开票信息',
          content: '请到个人中心维护开票信息',
          onOk: () => {
            router.push('/personal/invoice/edit?status=new');
          },
        });
      }
      return;
    }

    if (count === 0) {
      message.warn('没有可提交的数据');
      return;
    }

    Modal.confirm({
      title: '提交确认',
      content: `当前共有${count}条数据，是否提交全部`,
      onOk: async () => {
        const params = {
          isAll: 1,
          begin,
          end,
          routeId,
          fromCompany,
          toCompany,
          goodsType,
        };
        const res = await finance.saveAskInvoice({ params });
        if (res.status === 0) {
          message.success('提交成功');
          router.push(`/finance/applyInvoice`);
        } else {
          message.error(`提交失败,原因：${res.description} ${res.detail || ''}`);
        }
      },
    });
  };

  // 获取开票信息
  getInvoiceInfo = async () => {
    const res = await personalApi.getInvoiceInfo();
    if (res.status === 0) {
      this.setState({
        invoiceId: res.result.id,
      });
    } else if (res.status === 8) {
      this.setState({
        invoiceId: false,
      });
    }
  };

  resetFilter = () => {
    this.setState(
      {
        routeId: '',
        goodsType: '',
        fromCompany: '',
        toCompany: '',
        begin: undefined,
        end: undefined,
        orderNo: '',
        page: 1,
      },
      this.setDataList
    );
  };

  render() {
    const {
      routeView,
      loading,
      columns,
      dataList,
      page,
      pageSize,
      selectedRowKeys,
      totalPrice,
      totalWeight,
      btnLoading,
      routeId,
      goodsType,
      fromCompany,
      toCompany,
      defaultTotalWeight,
      defaultTotalPrice,
      defaultInvoicePrice,
    } = this.state;
    // 未勾选
    const isEmpty = selectedRowKeys.length === 0;
    return (
      <Layout {...routeView}>
        <Search onSearch={this.query} onReset={this.resetFilter}>
          <Search.Item label="创建时间" br>
            <DatePicker.RangePicker
              value={this.state.begin && this.state.end ? [moment(this.state.begin), moment(this.state.end)] : null}
              allowClear
              style={{ width: 376 }}
              showTime={{
                defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
              }}
              format="YYYY-MM-DD HH:mm:ss"
              onChange={(date, string) => this.setState({ begin: string[0], end: string[1] })}
            />
          </Search.Item>
          <Search.Item label="专线号">
            <Input
              value={routeId}
              placeholder="请输入专线号"
              allowClear
              onChange={e => this.setState({ routeId: e.target.value })}
            />
          </Search.Item>
          <Search.Item label="发货企业">
            <Input
              value={fromCompany}
              placeholder="请输入发货企业"
              allowClear
              onChange={e => this.setState({ fromCompany: e.target.value })}
            />
          </Search.Item>
          <Search.Item label="收货企业">
            <Input
              value={toCompany}
              placeholder="请输入收货企业"
              allowClear
              onChange={e => this.setState({ toCompany: e.target.value })}
            />
          </Search.Item>
          <Search.Item label="货品名称">
            <Input
              value={goodsType}
              placeholder="请输入货品名称"
              allowClear
              onChange={e => this.setState({ goodsType: e.target.value })}
            />
          </Search.Item>
        </Search>

        <Content style={{ marginTop: 24 }}>
          <header>
            专线列表
            <div style={{ float: 'right' }}>
              <Dropdown
                overlay={() => (
                  <Menu>
                    <Menu.Item key="2" onClick={this.submit}>
                      提交选中
                    </Menu.Item>
                    <Menu.Item key="1" onClick={this.submitAll}>
                      提交全部
                    </Menu.Item>
                  </Menu>
                )}>
                <Button type="primary" loading={btnLoading}>
                  提交
                  <DownOutlined />
                </Button>
              </Dropdown>
            </div>
          </header>

          <section>
            <Msg>
              {!isEmpty && <span style={{ marginRight: 12 }}>已选</span>}

              <span>
                专线数
                <span className="total-num">{isEmpty ? dataList.count : selectedRowKeys.length}</span>个
              </span>
              <span style={{ marginLeft: 32 }}>
                总净重
                <span className="total-num">{((isEmpty ? defaultTotalWeight : totalWeight) / 1000).toFixed(2)}</span>吨
              </span>
              <span style={{ marginLeft: 32 }}>
                运费总额
                <span className="total-num">{((isEmpty ? defaultTotalPrice : totalPrice) / 100).toFixed(2)}</span>元
              </span>
              <span style={{ marginLeft: 32 }}>
                含税总额
                <span className="total-num">
                  {((isEmpty ? defaultInvoicePrice : totalPrice * 1.09) / 100).toFixed(2)}
                </span>
                元
              </span>
            </Msg>
            <Table
              loading={loading}
              columns={columns}
              dataSource={dataList.data}
              rowSelection={{
                selectedRowKeys: selectedRowKeys,
                onSelect: this.rowComput,
                onSelectAll: this.allRowComput,
                onChange: this.onSelectRow,
                // fixed: 'left',
              }}
              pagination={{
                pageSize,
                showSizeChanger: true,
                current: page,
                total: dataList.count,
                onChange: page => this.onChangePage(page),
                onShowSizeChange: (current, size) => {
                  this.setState({ pageSize: size, page: 1 }, this.setDataList);
                },
              }}
              scroll={{ x: 'auto' }}
            />
          </section>
        </Content>
      </Layout>
    );
  }
}

export default ApplyInvoiceByRoute;
