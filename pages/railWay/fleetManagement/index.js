import { Component } from 'react';
import { Row, Button, Col, Input, Table, Modal, message } from 'antd';
import Router from 'next/router';
import { Layout, Content } from '@components';
import { CreateFleet } from '@components/fleetManagement';
import { railWay } from '@api';
import s from './fleetManagement.less';
import { QuestionCircleFilled } from '@ant-design/icons';
class FleetManagement extends Component {
  state = {
    inputValue: '',
    tableLoading: true,
    page: 1,
    dataSource: [],
    pagination: '',
    addCarTeamVisiable: false,
    createTeamLoading: false,
  };

  submitData = {};

  routeView = {
    title: '车队管理',
    pageKey: 'fleetManagement',
    longKey: 'railWay.fleetManagement',
    breadNav: '专线管理.车队管理',
    pageTitle: '车队管理',
  };

  columns = [
    {
      title: '车队名',
      dataIndex: 'fleetName',
      key: 'fleetName',
    },
    {
      title: '车队长',
      dataIndex: 'captain',
      key: 'captain',
    },
    {
      title: '车队长手机号',
      dataIndex: 'captainTel',
      key: 'captainTel',
    },
    {
      title: '车队车辆',
      dataIndex: 'carNum',
      key: 'carNum',
    },
    {
      title: '操作',
      dataIndex: 'do',
      key: 'do',
      align: 'right',
      render: (text, { key, fleetName, status }) => (
        <div>
          <a onClick={() => Router.push(`/railWay/fleetManagement/fleetDetail?id=${key}&fleetName=${fleetName}`)}>
            详情
          </a>
          <a className={s.delete} onClick={() => this.deleteOneFleet(key, fleetName, status)}>
            删除
          </a>
        </div>
      ),
    },
  ];

  componentDidMount() {
    const { page } = this.state;
    this.requestCarManagement({ page });
  }

  // 删除车队
  deleteOneFleet = (id, fleetName, status) => {
    const { page } = this.state;
    Modal.confirm({
      title: `确定删除${fleetName}车队？`,
      icon: <QuestionCircleFilled />,
      onOk: async () => {
        if (status !== 'LEISURE') {
          Modal.error({
            title: '该车队有进行中的派车，不能删除',
          });
        } else {
          const { status, detail, description } = await railWay.deleteOneFleet({ id });

          if (!status) {
            message.success('删除车队成功', 1.5, () => this.handleSearch(page));
          } else {
            Modal.error({
              title: '删除车队失败',
              content: detail || description,
            });
          }
        }
      },
    });
  };

  // 请求车队列表
  requestCarManagement = async params => {
    this.setState({ tableLoading: true });

    const { status, result, detail, description } = await railWay.getFleetList(params);

    if (!status) {
      const { data, count } = result;
      let dataSource = data.map(
        ({ id, name, carCount, fleetLeader: { mobilePhoneNumber, name: fleetLeaderName }, status }) => ({
          key: id,
          fleetName: name,
          captain: fleetLeaderName,
          captainTel: mobilePhoneNumber,
          carNum: carCount,
          status,
        })
      );

      let pagination = {
        total: count,
        current: params.page,
        onChange: this.handleSearch,
      };

      this.setState({
        dataSource,
        pagination,
        page: params.page,
        tableLoading: false,
      });
    } else {
      Modal.error({
        title: '请求车队列表失败',
        content: detail || description,
        onOk: () => this.setState({ tableLoading: false }),
      });
    }
  };

  handleSearch = (page = 1) => {
    let { inputValue } = this.state;
    inputValue = inputValue.replace(/^\s+|\s+$/g, '');

    let params = { page };
    inputValue && (params.name = inputValue);

    this.requestCarManagement(params);
  };

  // 创建车队的回调
  handleSureAddOneFleet = () => {
    this.refs.createFleetCom.validateFields(async (err, { name, leaderName, mobilePhoneNumber, isModify }) => {
      if (!err) {
        this.setState({ createTeamLoading: true });

        const { addOneFleet } = railWay;
        let params = {
          name,
          leaderName,
          mobilePhoneNumber,
        };

        isModify = isModify || this.submitData.isModify;
        isModify !== undefined && (params.isModify = isModify);
        const response = await addOneFleet(params);

        const { detail, description, status } = response;
        this.submitData = {};
        if (!status) {
          message.success('新增车队成功', 1.5, () => {
            this.setState(
              {
                createTeamLoading: false,
                addCarTeamVisiable: false,
              },
              () => {
                this.handleSearch();
                this.refs['createFleetCom'].resetFields();
              }
            );
          });
        } else if (status === 31) {
          Modal.confirm({
            title: '新建失败',
            content: `${detail || description} ?`,
            icon: <QuestionCircleFilled />,
            onCancel: () => {
              this.setState(
                {
                  createTeamLoading: false,
                },
                () => {
                  this.submitData = {
                    name,
                    leaderName,
                    mobilePhoneNumber,
                    isModify: 0,
                  };
                  this.handleSureAddOneFleet();
                }
              );
            },
            onOk: () => {
              this.setState(
                {
                  createTeamLoading: false,
                },
                () => {
                  this.submitData = {
                    name,
                    leaderName,
                    mobilePhoneNumber,
                    isModify: 1,
                  };
                  this.handleSureAddOneFleet();
                }
              );
            },
          });
        } else {
          Modal.error({
            title: '新增车队失败',
            content: detail || description,
            onOk: () => this.setState({ createTeamLoading: false }),
          });
        }
      }
    });
  };

  // 取消创建车队的回调
  handleCancelCreate = () => {
    this.refs.createFleetCom.resetFields();
    this.setState({ addCarTeamVisiable: false });
  };

  render() {
    const { tableLoading, dataSource, pagination, addCarTeamVisiable, createTeamLoading } = this.state;

    return (
      <Layout {...this.routeView}>
        <Row type="flex" justify="end">
          <Button type="primary" onClick={() => this.setState({ addCarTeamVisiable: true })}>
            新建车队
          </Button>
        </Row>
        <div className={s.filterArea}>
          <div className={s.filterAreaItem}>
            <p>车队名：</p>
            <Input
              allowClear
              placeholder="请输入车队名"
              onChange={e => this.setState({ inputValue: e.target.value })}
              onPressEnter={() => this.handleSearch()}
            />
          </div>
          <div className={s.filterAreaItem}>
            <Button type="primary" onClick={() => this.handleSearch()}>
              查询
            </Button>
          </div>
        </div>
        <Content style={{ marginTop: 12 }}>
          <section>
            <Table loading={tableLoading} columns={this.columns} dataSource={dataSource} pagination={pagination} />
          </section>
        </Content>

        <Modal
          title="增加车队"
          visible={addCarTeamVisiable}
          confirmLoading={createTeamLoading}
          onCancel={this.handleCancelCreate}
          onOk={this.handleSureAddOneFleet}>
          <CreateFleet ref="createFleetCom" />
        </Modal>
      </Layout>
    );
  }
}

export default FleetManagement;
