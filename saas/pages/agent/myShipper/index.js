import { DatePicker, Input, Button, Table, Modal, message, Popconfirm } from 'antd';
import { PureComponent } from 'react';
import { Layout, Search } from '@components';
import ShipperForm from '@components/Agent/shipperForm';
import agent from '@api/agent';
import moment from 'moment';

import { QuestionCircleFilled } from '@ant-design/icons';
const formatWeight = value => {
  return ((value || 0) / 1000).toFixed(2);
};

const formatPrice = value => {
  return ((value || 0) / 100).toFixed(2);
};
class MyShipper extends PureComponent {
  static async getInitialProps(props) {
    const { isServer } = props;
    return {};
  }
  constructor(props) {
    super(props);
    this.state = {
      routeView: {
        title: '我的货主',
        pageKey: 'agent/myShipper',
        longKey: 'agent/myShipper',
        breadNav: '我的货主',
        pageTitle: '我的货主',
      },
      columns: [
        {
          title: '账号',
          dataIndex: 'username',
          key: 'username',
          width: 130,
        },
        {
          title: '企业名称',
          dataIndex: 'companyName',
          key: 'companyName',
          width: 250,
        },
        {
          title: '发货总量(吨)',
          dataIndex: 'goodsWeightSum',
          key: 'goodsWeightSum',
          width: 120,
          render: formatWeight,
        },
        {
          title: '收货总量(吨)',
          dataIndex: 'arrivalGoodsWeightSum',
          key: 'arrivalGoodsWeightSum',
          width: 120,
          render: formatWeight,
        },
        {
          title: '总运单数',
          dataIndex: 'transportNum',
          key: 'transportNum',
          width: 120,
        },
        {
          title: '开票金额(不含税)(元)',
          dataIndex: 'invoicePriceNum',
          key: 'invoicePriceNum',
          width: 220,
          render: formatPrice,
        },
        {
          title: '操作',
          dataIndex: 'id',
          key: 'id',
          width: 60,
          fixed: 'right',
          align: 'right',
          render: (value, record) => {
            return (
              <Popconfirm
                title="确认解除绑定？"
                placement="topRight"
                icon={<QuestionCircleFilled />}
                onConfirm={() => this.remove(record)}>
                <Button type="link" danger size="small">
                  解绑
                </Button>
              </Popconfirm>
            );
          },
        },
      ],
      page: 1,
      loading: true,
      dataList: {},
    };
  }

  // 初始化
  componentDidMount() {
    this.setDataList();
  }

  // 解绑
  remove = async ({ id }) => {
    const params = {
      id,
    };
    const res = await agent.removeGoodsOwner({ params });
    if (res.status === 0) {
      message.success('解绑成功');
      this.setDataList();
    } else {
      message.error(`${res.detail ? res.detail : res.description}`);
    }
  };

  // 设置数据
  setDataList = async () => {
    this.setState({
      loading: true,
    });
    const { begin, end, companyName } = this.state;
    const params = {
      begin: begin || undefined,
      end: end || undefined,
      companyName: companyName || undefined,
    };
    const res = await agent.getGoodsOwnerInfoList({ params });

    if (res.status === 0) {
      this.setState({
        dataList: res.result,
      });
    } else {
      message.error(`${res.detail ? res.detail : res.description}`);
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
      },
      this.setDataList
    );
  };

  // 保存货主
  handleSubmit = async formData => {
    const { username, sms } = formData;
    const params = {
      username,
      sms,
    };
    const res = await agent.addGoodsOwner({ params });
    if (res.status === 0) {
      message.success('新增货主成功');
      this.setState({ showModal: false });
      this.setDataList();
    } else {
      message.error(`${res.detail ? res.detail : res.description}`);
    }
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
  render() {
    const { routeView, columns, loading, dataList, page } = this.state;
    return (
      <Layout {...routeView}>
        <div style={{ background: '#fff', padding: 16 }}>
          <Button type="primary" onClick={() => this.setState({ showModal: true })} style={{ marginBottom: 16 }}>
            新增货主
          </Button>
          <Search onSearch={this.query}>
            <Search.Item label="时间" br>
              <DatePicker.RangePicker
                showTime={{
                  defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
                }}
                onChange={(value, string) => {
                  this.setState({
                    begin: string[0],
                    end: string[1],
                  });
                }}
                style={{ width: 376 }}
              />
            </Search.Item>
            <Search.Item label="企业名称">
              <Input
                allowClear
                onChange={e =>
                  this.setState({
                    companyName: e.target.value,
                  })
                }
                placeholder="请输入企业名称"
              />
            </Search.Item>
          </Search>

          <Table
            loading={loading}
            dataSource={dataList.data}
            columns={columns}
            style={{ marginTop: 16 }}
            rowKey="id"
            pagination={{
              onChange: page => this.onChangePage(page),
              showSizeChanger: false,
              pageSize: 10,
              current: page,
              total: dataList.count,
            }}
          />
        </div>

        <Modal
          destroyOnClose
          title="新增货主"
          footer={null}
          visible={this.state.showModal}
          onCancel={() => this.setState({ showModal: false })}>
          <ShipperForm onClose={() => this.setState({ showModal: false })} onSubmit={this.handleSubmit} />
        </Modal>
      </Layout>
    );
  }
}

export default MyShipper;
