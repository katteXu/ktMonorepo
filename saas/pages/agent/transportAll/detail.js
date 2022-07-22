import React, { PureComponent } from 'react';
import router from 'next/router';
import Link from 'next/link';
import { LoadingOutlined } from '@ant-design/icons';
import { Select, Input, Button, Table, message } from 'antd';
import { Layout, Content, Search, Status, Msg } from '@components';
import s from './styles.less';
import agent from '@api/agent';
import { getQuery } from '@utils/common';
const { Option } = Select;

const formatPrice = value => {
  return ((value || 0) / 100).toFixed(2) + '元';
};

const formatWeight = (value, record) => {
  return ((value || 0) / 1000).toFixed(2) + (record.unitName || '吨');
};

class Detail extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      routeView: {
        title: '汇总明细',
        pageKey: 'agent/transportAll',
        longKey: 'agent/transportAll',
        // breadNav: '运费汇总.企业详情.汇总明细',
        breadNav: [
          <Link href="/agent/transportAll">
            <a>运费汇总</a>
          </Link>,
          <a onClick={() => router.back()}>企业详情</a>,
          '汇总明细',
        ],
        useBack: true,
        pageTitle: '汇总明细',
      },
      loading: true,
      dataList: {},

      fromCompany: '',
      toCompany: '',
      goodsType: '',
      unitPrice: '',
      status: '',
      trailerPlateNumber: '',

      columns: [
        {
          title: '车牌号',
          dataIndex: 'trailerPlateNumber',
          key: 'trailerPlateNumber',
          width: 90,
        },
        {
          title: '司机姓名',
          dataIndex: 'name',
          key: 'name',
          width: 110,
        },
        {
          title: '司机账号',
          dataIndex: 'username',
          key: 'username',
          width: 90,
        },
        {
          title: '运单状态',
          dataIndex: 'status',
          key: 'status',
          width: 90,
          render: value => {
            return <Status.Order code={value} />;
          },
        },
        {
          title: '车队长',
          dataIndex: 'fleetCaptainName',
          key: 'fleetCaptainName',
          width: 130,
          render: text => text || '-',
        },
        {
          title: '发货净重',
          dataIndex: 'goodsWeight',
          key: 'goodsWeight',
          render: formatWeight,
          width: 90,
        },
        {
          title: '收货净重',
          dataIndex: 'arrivalGoodsWeight',
          key: 'arrivalGoodsWeight',
          render: formatWeight,
          width: 90,
        },
        {
          title: '结算金额',
          dataIndex: 'price',
          key: 'price',
          width: 90,
          render: (value, { realPrice }) => {
            return realPrice === 0 ? formatPrice(value) : formatPrice(realPrice);
          },
        },
        {
          title: '操作',
          dataIndex: 'detail',
          width: 130,
          render: (text, record) => (
            <Button
              type="link"
              size="small"
              onClick={() => router.push(`/agent/transportStatistics/detail?id=${record.id}`)}>
              详情
            </Button>
          ),
        },
      ],
      page: 1,
    };
  }

  defaultStatus = {
    PROCESS: <span style={{ color: '#46B8AF' }}>运输中</span>,
    DONE: <span style={{ color: '#477AEF' }}>已完成</span>,
    WAIT_PAY: <span style={{ color: '#E44040' }}>待结算</span>,
    CHECKING: <span>待审核</span>,
    REJECT: <span>已驳回</span>,
    WAIT_CONFIRMED: <span>待装货</span>,
    APPLY_CANCEL: <span>待取消</span>,
    PAYING: <span>支付中</span>,
    WAIT_FLEET_CAPTAIN_PAY: <span style={{ color: '#477AEF' }}>已完成</span>,
    FLEET_CAPTAIN_PAYING: <span style={{ color: '#477AEF' }}>已完成</span>,
  };

  componentDidMount() {
    const { railWayInfo } = getQuery();
    this.setState({
      railWayInfo,
    });
    this.setDataList();
  }

  // 设置数据
  setDataList = async () => {
    this.setState({
      loading: true,
    });
    const { userId, routeId, begin, end } = getQuery();
    const { page, status, trailerPlateNumber } = this.state;
    const params = {
      userId,
      routeId,
      begin,
      end,
      limit: 10,
      page,
      userId,
      status: status || undefined,
      trailerPlateNumber: trailerPlateNumber || undefined,
    };
    const res = await agent.getUserListTwoDetailTwo({ params });
    if (res.status === 0) {
      this.setState({
        dataList: res.result,
        totalWaitPayPrice: res.result.totalWaitPayPrice,
        totalPayPrice: res.result.totalPayPrice,
        totalArrivalGoodsWeight: res.result.totalArrivalGoodsWeight,
      });
    } else {
      message.error(`获取数据失败，${res.detail ? res.detail : res.description}`);
      this.setState({
        dataList: {},
      });
    }
    this.setState({
      loading: false,
    });
  };

  // 参数准备
  handleQuery = () => {
    const { status, trailerPlateNumber } = this.state;
    let params = { page: 1 };

    status && (params.status = status);
    trailerPlateNumber && (params.trailerPlateNumber = trailerPlateNumber);

    this.setDataList(params);
  };

  onChangePage = page => {
    this.setState(
      {
        page,
      },
      this.setDataList
    );
  };

  render() {
    const {
      routeView,
      loading,
      dataList,
      columns,
      page,
      totalWaitPayPrice,
      totalPayPrice,
      totalArrivalGoodsWeight,
      railWayInfo,
    } = this.state;
    const { count } = dataList;

    return (
      <Layout {...routeView}>
        <div style={{ background: '#fff', padding: 16 }}>
          <div className={s.routeInfo}>
            <label>专线信息</label>：{railWayInfo}
          </div>
          <Search onSearch={this.handleQuery}>
            <Search.Item label="运单状态">
              <Select
                style={{ width: '100%' }}
                allowClear
                placeholder="请选择"
                className={s.selectLg}
                onChange={status => this.setState({ status })}>
                <Option value="DONE">已完成</Option>
                <Option value="WAIT_PAY">待支付</Option>
                <Option value="APPLY_CANCEL">待取消</Option>
                <Option value="PAYING">支付中</Option>
              </Select>
            </Search.Item>
            <Search.Item label="车牌号">
              <Input
                allowClear
                placeholder="请输入车牌号"
                onChange={e => this.setState({ trailerPlateNumber: e.target.value })}
              />
            </Search.Item>
          </Search>
          <Content style={{ marginTop: 16 }}>
            <Msg>
              <span>车次</span>
              <span className={'total-num'}>
                {!loading ? count || 0 : <LoadingOutlined style={{ fontSize: 20 }} />}
              </span>
              辆<span style={{ marginLeft: 32 }}>待支付运费</span>
              <span className={'total-num'}>
                {!loading ? ((totalWaitPayPrice || 0) / 100).toFixed(2) : <LoadingOutlined style={{ fontSize: 20 }} />}
              </span>
              元<span style={{ marginLeft: 32 }}>已支付运费</span>
              <span className={'total-num'}>
                {!loading ? ((totalPayPrice || 0) / 100).toFixed(2) : <LoadingOutlined style={{ fontSize: 20 }} />}
              </span>
              元<span style={{ marginLeft: 32 }}>收货净重</span>
              <span className={'total-num'}>
                {!loading ? (
                  ((totalArrivalGoodsWeight || 0) / 1000).toFixed(2)
                ) : (
                  <LoadingOutlined style={{ fontSize: 20 }} />
                )}
              </span>
              吨
            </Msg>
            <Table
              loading={loading}
              dataSource={dataList.data}
              columns={columns}
              pagination={{
                onChange: page => this.onChangePage(page),
                showSizeChanger: false,
                pageSize: 10,
                current: page,
                total: dataList.count,
              }}
            />
          </Content>
        </div>
      </Layout>
    );
  }
}

export default Detail;
