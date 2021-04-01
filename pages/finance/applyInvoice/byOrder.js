/** @format */

import React, { PureComponent } from 'react';
import { DownOutlined, SettingOutlined } from '@ant-design/icons';
import { Row, Col, Input, DatePicker, Button, Table, Modal, message, Tooltip, Dropdown, Menu } from 'antd';
import moment from 'moment';
import { Layout, Content, Search, Msg } from '@components';
import router from 'next/router';
import Link from 'next/link';
import { finance } from '@api';
import Title from '@components/Finance/Title';
import personalApi from '@api/personalCenter';
import styles from '../styles.less';

const formatWeight = value => {
  return ((value || 0) / 1000).toFixed(2);
};

const formatPrice = value => {
  return ((value || 0) / 100).toFixed(2);
};

class ApplyInvoice extends PureComponent {
  static async getInitialProps(props) {
    const { isServer } = props;
    return {};
  }
  constructor(props) {
    super(props);
    this.state = {
      routeView: {
        title: '运单列表',
        pageKey: 'applyInvoice',
        longKey: 'finance.applyInvoice',
        breadNav: [
          '财务中心',
          <Link href="/finance/applyInvoice">
            <a>申请开票</a>
          </Link>,
          '运单列表',
        ],
        pageTitle: '运单列表',
        useBack: true,
      },
      columns: [
        {
          title: '车牌号',
          dataIndex: 'trailerPlateNumber',
          width: 100,
          key: 'trailerPlateNumber',
        },
        {
          title: '司机姓名',
          dataIndex: 'name',
          width: 90,
          key: 'name',
        },
        {
          title: '发货净重(吨)',
          dataIndex: 'goodsWeight',
          key: 'goodsWeight',
          width: 120,
          align: 'right',
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
          title: '运费单价(元/吨)',
          dataIndex: 'unitPrice',
          width: 150,
          align: 'right',
          key: 'unitPrice',
          render: formatPrice,
        },
        {
          title: '运费(元)',
          dataIndex: 'realTotalPrice',
          key: 'realTotalPrice',
          width: 120,
          align: 'right',
          render: (value, record) => formatPrice(record.realPrice),
        },
        {
          title: '专线号',
          dataIndex: 'routeId',
          key: 'routeId',
          width: 80,
          render: (value, record) => value,
        },
        {
          title: '发货企业',
          dataIndex: 'fromCompany',
          width: 160,
          key: 'fromCompany',
          render: value => {
            return (
              <Tooltip title={value} overlayStyle={{ maxWidth: 'max-content' }}>
                <div className="max-label" style={{ width: 120 }}>
                  {value || '-'}
                </div>
              </Tooltip>
            );
          },
        },
        {
          title: '发货地址',
          dataIndex: 'fromAddress',
          width: 240,
          key: 'fromAddress',
          render: value => {
            return (
              <Tooltip title={value} overlayStyle={{ maxWidth: 'max-content' }}>
                <div className="max-label" style={{ width: 220 }}>
                  {value || '-'}
                </div>
              </Tooltip>
            );
          },
        },
        {
          title: '收货企业',
          dataIndex: 'toCompany',
          width: 160,
          key: 'toCompany',
          render: value => {
            return (
              <Tooltip title={value} overlayStyle={{ maxWidth: 'max-content' }}>
                <div className="max-label" style={{ width: 120 }}>
                  {value || '-'}
                </div>
              </Tooltip>
            );
          },
        },
        {
          title: '收货地址',
          dataIndex: 'toAddress',
          width: 240,
          key: 'toAddress',
          render: value => {
            return (
              <Tooltip title={value} overlayStyle={{ maxWidth: 'max-content' }}>
                <div className="max-label" style={{ width: 220 }}>
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
          width: 180,
          render: value => {
            return (
              <Tooltip title={value} overlayStyle={{ maxWidth: 'max-content' }}>
                <div className="max-label" style={{ width: 120 }}>
                  {value || '-'}
                </div>
              </Tooltip>
            );
          },
        },

        {
          title: '承运时间',
          dataIndex: 'payTime',
          key: 'payTime',
          width: 220,
          render: (value, record) => record.createdAt,
        },
        {
          title: '操作',
          // dataIndex: 'ctrl',  表头设置默认不要dataIndex
          key: 'ctrl',
          align: 'right',
          fixed: 'right',
          width: 100,
          render: (value, record) => {
            return (
              <Button
                size="small"
                type="link"
                onClick={() => router.push(`/transport/transportStatistics/detail?id=${record.id}`)}>
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
      showColumns: [],
      tempColumns: [],
      allColumns: [],
      allFilter: {},
      defaultTotalWeight: 0,
      defaultTotalPrice: 0,
      defaultInvoicePrice: 0,
    };
  }

  componentDidMount() {
    this.getColumnsList();
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
    });
  };

  // 加载数据
  setDataList = async () => {
    this.setState({
      loading: true,
    });
    const { page, fromCompany, toCompany, begin, end, goodsType, routeId, orderNo, pageSize } = this.state;
    const params = {
      page,
      limit: pageSize,
      fromCompany: fromCompany || undefined,
      toCompany: toCompany || undefined,
      begin: begin || undefined,
      end: end || undefined,
      goodsType: goodsType || undefined,
      routeId: routeId || undefined,
      orderNo: orderNo || undefined,
    };
    const res = await finance.getApplyInvoiceList({ params });
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
    const { realPrice, arrivalGoodsWeight } = selectRow;
    if (selected) {
      totalPrice += realPrice;
      totalWeight += arrivalGoodsWeight;
    } else {
      totalPrice -= realPrice;
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
      _totalPrice += item.realPrice;
      _totalWeight += item.arrivalGoodsWeight;
    });
    this.setState({
      totalPrice: selected ? totalPrice + _totalPrice : totalPrice - _totalPrice,
      totalWeight: selected ? totalWeight + _totalWeight : totalWeight - _totalWeight,
    });
  };

  // 提交数据
  submit = async () => {
    const { selectedRowKeys, totalPrice, invoiceId } = this.state;
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

    const params = {
      transportIds: selectedRowKeys.join(),
      invoicePriceSum: Math.round(totalPrice * 1.09),
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

  // 提交全部
  submitAll = async () => {
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

  // 获取表头
  getColumnsList = async () => {
    const [resAll, resUser] = await Promise.all([finance.getColumnsList(), finance.getUserColumns()]);
    if (resAll.status === 0) {
      // 所有表头信息
      this.setState({
        allColumns: resAll.result,
      });
    }

    if (resUser.status === 0) {
      // 用户选择数据
      this.setState({
        showColumns: resUser.result.map(item => item.title.titleCode),
        tempColumns: resUser.result.map(item => item.titleId),
      });
    }
  };

  // 保存表头
  saveColumns = async () => {
    const { tempColumns, allColumns } = this.state;
    const params = {
      ids: tempColumns.join(),
    };
    const res = await finance.setColumns({ params });
    if (res.status === 0) {
      message.success('设置成功');
      this.setState(
        {
          showEditColumns: false,
        },
        () => {
          const _col = allColumns.filter(item => tempColumns.includes(item.id)).map(item => item.titleCode);

          this.setState({
            showColumns: _col,
          });
        }
      );
    } else {
      message.error(`设置失败，原因：${res.detail ? res.detail : res.description}`);
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
      tempColumns,
      showColumns,
      allColumns,
      routeId,
      goodsType,
      fromCompany,
      toCompany,
      begin,
      end,
      orderNo,
      defaultTotalWeight,
      defaultTotalPrice,
      defaultInvoicePrice,
    } = this.state;
    // 未勾选
    const isEmpty = selectedRowKeys.length === 0;
    return (
      <Layout {...routeView}>
        <Search onSearch={this.query} onReset={this.resetFilter}>
          <Search.Item label="承运时间" br>
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
            运单列表
            <div style={{ float: 'right', lineHeight: '33px' }}>
              <Title />
              <span>
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
                  <Button type="primary">
                    提交
                    <DownOutlined />
                  </Button>
                </Dropdown>
                <Tooltip title="表头设置">
                  <SettingOutlined
                    style={{ marginLeft: 15, verticalAlign: 'middle' }}
                    twoToneColor="#848485"
                    onClick={() => {
                      this.setState({ showEditColumns: true });
                    }}
                  />
                </Tooltip>
              </span>
            </div>
          </header>

          <section>
            <Msg>
              {!isEmpty && <span style={{ marginRight: 12 }}>已选</span>}

              <span>
                运单数<span className="total-num">{isEmpty ? dataList.count : selectedRowKeys.length}</span>个
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
              columns={
                showColumns.length === 0
                  ? columns
                  : columns.filter(item => (item.dataIndex ? showColumns.includes(item.dataIndex) : true))
              }
              dataSource={dataList.data}
              rowSelection={{
                selectedRowKeys: selectedRowKeys,
                fixed: 'left',
                onSelect: this.rowComput,
                onSelectAll: this.allRowComput,
                onChange: this.onSelectRow,
              }}
              rowClassName={(record, index) => {
                if (record.arrivalGoodsWeight / 1000 > 40) {
                  return styles.red;
                }

                if (record.arrivalGoodsWeight / 1000 < 10) {
                  return styles.green;
                }

                if (record.realPrice / 100 < 50) {
                  return styles.yellow;
                }
              }}
              pagination={{
                onChange: page => this.onChangePage(page),
                pageSize,
                onShowSizeChange: (current, size) => {
                  this.setState({ pageSize: size, page: 1 }, this.setDataList);
                },
                current: page,
                total: dataList.count,
              }}
              scroll={{ x: 2000 }}
            />
          </section>
        </Content>

        <Modal
          title="申请开票表头设置"
          visible={this.state.showEditColumns}
          footer={null}
          onCancel={() => this.setState({ showEditColumns: false })}>
          <Table
            columns={[
              {
                title: '字段',
                dataIndex: 'titleName',
                key: 'titleName',
              },
            ]}
            bodyStyle={{ height: '550px' }}
            scroll={{ y: true }}
            pagination={false}
            rowSelection={{
              selectedRowKeys: tempColumns,
              onChange: selectedRowKeys => {
                this.setState({
                  tempColumns: selectedRowKeys,
                });
              },
            }}
            dataSource={allColumns}
          />
          <Row style={{ marginTop: 40 }}>
            <Col style={{ textAlign: 'center' }}>
              <Button onClick={() => this.setState({ showEditColumns: false })}>取消</Button>
              <Button type="primary" onClick={() => this.saveColumns()} style={{ marginLeft: 30 }}>
                确定
              </Button>
            </Col>
          </Row>
        </Modal>
      </Layout>
    );
  }
}

export default ApplyInvoice;
