/** @format */

import React, { PureComponent } from 'react';
import { DatePicker, Button, Table, Modal, message } from 'antd';
import moment from 'moment';
import { Layout, Content, Search, Msg } from '@components';
import router from 'next/router';
import Link from 'next/link';
import { finance } from '@api';
import Title from '@components/Finance/Title';
import personalApi from '@api/personalCenter';
import styles from '../styles.less';
import { getQuery } from '@utils/common';
const formatWeight = value => {
  return ((value || 0) / 1000).toFixed(2);
};

const formatPrice = value => {
  return ((value || 0) / 100).toFixed(2);
};

class RejectInvoice extends PureComponent {
  static async getInitialProps(props) {
    const { isServer } = props;
    return {};
  }
  constructor(props) {
    super(props);
    this.state = {
      routeView: {
        title: '驳回修改',
        pageKey: 'invoiceList',
        longKey: 'finance.invoiceList',
        breadNav: [
          '财务中心',
          <Link href="/finance/invoiceList">
            <a>开票列表</a>
          </Link>,
          '驳回修改',
        ],
        pageTitle: '驳回修改',
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
          width: 100,
          key: 'name',
        },
        {
          title: '运费单价(元/吨)',
          dataIndex: 'unitPrice',
          width: 210,
          key: 'unitPrice',
          render: formatPrice,
        },
        {
          title: '运费(元)',
          dataIndex: 'realPrice',
          key: 'realPrice',
          width: 150,
          render: formatPrice,
        },
        {
          title: '发货净重(吨)',
          dataIndex: 'goodsWeight',
          key: 'goodsWeight',
          width: 160,
          render: formatWeight,
        },
        {
          title: '收货净重(吨)',
          dataIndex: 'arrivalGoodsWeight',
          key: 'arrivalGoodsWeight',
          width: 160,
          render: formatWeight,
        },

        {
          title: '承运时间',
          dataIndex: 'createdAt',
          key: 'createdAt',
          width: 180,
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
    const { batchId } = getQuery();
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
      batchId,
    };
    const res = await finance.getRejectInvoice({ params });
    if (res.status === 0) {
      this.setState({
        dataList: res.result,
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

  removeConfirm = () => {
    const { selectedRowKeys } = this.state;
    if (selectedRowKeys.length === 0) {
      message.warn('请选择一条数据');
      return;
    }
    Modal.confirm({
      title: '确认删除',
      content: (
        <p>
          确认删除当前
          <span style={{ color: '#3D86EF' }}>{this.state.selectedRowKeys.length}</span>
          条运单吗？
        </p>
      ),
      onOk: this.remove,
    });
  };

  remove = async () => {
    const { selectedRowKeys } = this.state;
    const { batchId } = getQuery();
    const params = {
      batchId,
      transportIds: selectedRowKeys.join(),
    };
    const res = await finance.deleteRejectInvoice({ params });
    if (res.status === 0) {
      message.success('删除成功');
      router.push(`/finance/invoiceList/view?batchId=${batchId}&status=REJECT_APPROVE`);
    } else {
      message.error(`${res.detail ? res.detail : res.description}`);
    }
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
        begin: undefined,
        end: undefined,
        pageSize: 100,
        page: 1,
      },
      this.query
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
      begin,
      end,
    } = this.state;
    return (
      <Layout {...routeView}>
        <Search onSearch={this.query} onReset={this.resetFilter}>
          <Search.Item label="承运时间" br>
            <DatePicker.RangePicker
              allowClear
              value={begin && end ? [moment(begin), moment(end)] : null}
              style={{ width: 376 }}
              showTime={{
                defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
              }}
              format="YYYY-MM-DD HH:mm:ss"
              onChange={(date, string) => this.setState({ begin: string[0], end: string[1] })}
            />
          </Search.Item>
        </Search>

        <Content style={{ marginTop: 24 }}>
          <header>
            运单列表
            <div style={{ float: 'right' }}>
              <Title />
              <Button
                style={{ marginLeft: 15 }}
                type="primary"
                ghost
                loading={btnLoading}
                onClick={() => router.push(`/finance/invoiceList/rejectSelectList?batchId=${getQuery().batchId}`)}>
                按运单添加
              </Button>
              <Button
                style={{ marginLeft: 15 }}
                type="primary"
                ghost
                loading={btnLoading}
                onClick={() => router.push(`/finance/invoiceList/byRoute?batchId=${getQuery().batchId}`)}>
                按专线添加
              </Button>
              <Button style={{ marginLeft: 15 }} type="danger" ghost onClick={this.removeConfirm}>
                删除
              </Button>
            </div>
          </header>
          <section>
            <Msg>
              <span>
                已选运单
                <span className="total-num">{selectedRowKeys.length}</span>个
              </span>
              <span style={{ marginLeft: 32 }}>
                总净重
                <span className="total-num">{(totalWeight / 1000).toFixed(2)}</span>吨
              </span>
              <span style={{ marginLeft: 32 }}>
                运费总额
                <span className="total-num">{(totalPrice / 100).toFixed(2)}</span>元
              </span>
              <span style={{ marginLeft: 32 }}>
                含税总额
                <span className="total-num">{((totalPrice * 1.09) / 100).toFixed(2)}</span>元
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
                showSizeChanger: true,
                pageSizeOptions: ['100', '200', '500'],
                onShowSizeChange: (current, size) => {
                  this.setState({ pageSize: size, page: 1 }, this.setDataList);
                },
                current: page,
                total: dataList.count,
              }}
            />
          </section>
        </Content>
      </Layout>
    );
  }
}

export default RejectInvoice;
