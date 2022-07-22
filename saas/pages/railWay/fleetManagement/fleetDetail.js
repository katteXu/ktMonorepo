import { Component } from 'react';
import { withRouter } from 'next/router';
import { Row, Button, Input, Table, Modal, Result, message } from 'antd';
import BatchImport from '@components/BatchImport';
import { railWay } from '@api';
import { CreateTruck, ModifyTruck } from '@components/fleetManagement';
import { Layout, Content } from '@components';
import s from './styles.less';
import { QuestionCircleFilled } from '@ant-design/icons';
import { getQuery } from '@utils/common';
class FleetDetail extends Component {
  state = {
    inputValue: '',
    loading: true,
    dataSource: [],
    pagination: '',
    page: 1,
    visible: false,
    addOneTruckLoading: false,
    showModal: false,
    success: 0,
    fail: 0,
    failRow: [],
    uploadResult: false,
    deleteOneCarModal: false,

    modifyVisible: false,
    modifyOneTruckLoading: false,
    modifyData: {},
  };

  routeView = {
    title: '车队详情',
    pageKey: 'fleetManagement',
    longKey: 'railWay.fleetManagement.fleetDetail',
    breadNav: '专线管理.车队管理.车队详情',
    useBack: true,
    pageTitle: '车队详情',
  };

  columns = [
    {
      title: '车牌号',
      dataIndex: 'trailerPlateNumber',
      key: 'trailerPlateNumber',
    },
    {
      title: '司机姓名',
      dataIndex: 'driverName',
      key: 'driverName',
    },
    {
      title: '驾驶证号',
      dataIndex: 'driverLicenseNumber',
      key: 'driverLicenseNumber',
    },
    {
      title: '行驶证号',
      dataIndex: 'truckLicenseNumber',
      key: 'truckLicenseNumber',
    },
    {
      title: '道路运输证号号',
      dataIndex: 'roadNumber',
      key: 'roadNumber',
    },
    {
      title: '从业资格证号',
      dataIndex: 'qualificationNumber',
      key: 'qualificationNumber',
    },
    {
      title: '核定载重',
      dataIndex: 'truckLoad',
      key: 'truckLoad',
    },
    {
      title: '状态',
      dataIndex: 'statusText',
      key: 'statusText',
    },
    {
      title: '操作',
      dataIndex: 'do',
      key: 'do',
      align: 'right',
      render: (text, record) => (
        <>
          <a
            className={record.status === 'IN_TRANSIT' ? s.notModify : ''}
            onClick={
              record.status !== 'IN_TRANSIT'
                ? () => this.modify(record)
                : () => {
                  console.log('111');
                }
            }>
            修改
          </a>
          <a className={s.delete} onClick={() => this.delete(record)}>
            删除
          </a>
        </>
      ),
    },
  ];

  createTruckRef = null;
  modifyTruckRef = null;

  componentDidMount() {
    this.requestFleetTruckList({ page: 1 });
    this.routeView.breadNav = `专线管理.车队管理.${getQuery().fleetName}`;
  }

  // 修改车辆信息
  modify = record => {
    this.setState({
      modifyVisible: true,
      modifyData: {
        ...record,
        fleetName: getQuery().fleetName,
      },
    });
  };

  delete = ({ key: id, trailerPlateNumber, status }) => {
    const { page } = this.state;
    if (status === 'IN_TRANSIT') {
      Modal.error({
        title: '删除失败',
        content: '有进行中的派车，不能删除，请取消派车后再删除！',
      });
    } else {
      Modal.confirm({
        title: '删除车辆',
        icon: <QuestionCircleFilled />,
        content: '是否删除车辆' + trailerPlateNumber,
        onOk: async () => {
          const { status, detail, description } = await railWay.deleteFleetTruck({ id });
          if (!status) {
            message.success('删除成功', 1, () => this.requestFleetTruckList({ page }));
          } else {
            Modal.error({
              title: '删除失败',
              content: detail || description,
            });
          }
        },
      });
    }
  };

  requestFleetTruckList = async params => {
    this.setState({ loading: true });

    const { status, result, detail, description } = await railWay.getFleetTruckList({
      ...params,
      id: getQuery().id,
    });

    if (!status) {
      const { data, count } = result;
      let dataSource = data.map(
        ({
          id,
          status,
          trailerPlateNumber,
          driverName,
          driverLicenseNumber,
          truckLicenseNumber,
          roadNumber,
          qualificationNumber,
          truckLoad,
        }) => ({
          key: id,
          status,
          statusText: status === 'LEISURE' ? '空闲中' : status === 'IN_TRANSIT' ? '有进行中的派车' : '其他',
          trailerPlateNumber,
          driverName,
          driverLicenseNumber,
          truckLicenseNumber,
          roadNumber,
          qualificationNumber,
          truckLoad: (truckLoad / 1000).toFixed(2),
        })
      );

      let pagination = {
        total: count,
        current: params.page,
        onChange: page => this.handleSearch(page),
      };

      this.setState({
        loading: false,
        dataSource,
        pagination,
        page: params.page,
      });
    } else {
      this.setState(
        {
          loading: false,
          page: params.page,
        },
        () => {
          Modal.error({
            title: '获取车辆列表失败',
            content: detail || description,
          });
        }
      );
    }
  };

  handleSearch = (page = 1) => {
    let { inputValue } = this.state;
    inputValue = inputValue.replace(/^\s+|\s+$/g, '');

    let params = { page };
    inputValue && (params.trailerPlateNumber = inputValue);

    this.requestFleetTruckList(params);
  };

  downLoadTmp = async () => {
    const { status, result, detail, description } = await railWay.downTemplate();
    if (!status) {
      location.href = result;
    } else {
      message.error({
        title: '文件下载失败',
        content: detail || description,
      });
    }
  };

  upload = async file => {
    const res = await railWay.banctImportFleetTrucker({ excelUrl: file });
    if (!res.status) {
      const { success, fail, failRow } = res.result;

      this.setState(
        {
          success,
          fail,
          failRow,
          showModal: false,
          uploadResult: true,
        },
        () => success > 0 && this.requestFleetTruckList({ page: 1 })
      );
    } else {
      const { detail, description } = res;
      Modal.error({
        title: '上传文件失败',
        content: detail || description,
      });
    }
  };

  closeResult = () => {
    this.setState(
      {
        uploadResult: false,
      },
      () => this.requestFleetTruckList({ page: 1 })
    );
  };

  // 新增车辆的回调
  handleSureAddOneTruck = () => {
    this.createTruckRef.validateFields(async (err, values) => {
      if (!err) {
        let params = {
          id: getQuery().id,
          ...values,
          truckLoad: (values.truckLoad * 1000).toFixed(0),
          trailerPlateNumber: values.trailerPlateNumber.toUpperCase(),
        };

        this.setState({ addOneTruckLoading: true });
        const { status, detail, description } = await railWay.addFleetTruck(params);
        if (!status) {
          message.success('新增成功', 1.5, () =>
            this.setState(
              {
                addOneTruckLoading: false,
                visible: false,
              },
              () => this.handleSearch()
            )
          );
        } else {
          Modal.error({
            title: '新增失败',
            content: detail || description,
            onOk: () => this.setState({ addOneTruckLoading: false }),
          });
        }
      }
    });
  };

  // 取消创建车队车辆的回调
  handleCancelCreateTruck = () => {
    this.createTruckRef.resetFields();
    this.setState({ visible: false });
  };

  // 确定新增车队车辆的回调
  handleSureModifyOneTruck = () => {
    this.modifyTruckRef.validateFields(async (err, values) => {
      if (!err) {
        let params = {
          cid: this.state.modifyData.key,
          ...values,
          truckLoad: (values.truckLoad * 1000).toFixed(0),
          trailerPlateNumber: values.trailerPlateNumber.toUpperCase(),
        };

        this.setState({ modifyOneTruckLoading: true });
        const { status, detail, description } = await railWay.modifyFleetTruck(params);
        if (!status) {
          message.success('修改成功', 1.5, () =>
            this.setState(
              {
                modifyOneTruckLoading: false,
                modifyVisible: false,
              },
              () => this.handleSearch()
            )
          );
        } else {
          Modal.error({
            title: '修改失败',
            content: detail || description,
            onOk: () => this.setState({ modifyOneTruckLoading: false }),
          });
        }
      }
    });
  };

  // 取消修改车队车辆的回调
  handleCancelModifyTruck = () => {
    this.modifyTruckRef.resetFields();
    this.setState({ modifyVisible: false });
  };

  render() {
    const {
      visible,
      loading,
      dataSource,
      pagination,
      addOneTruckLoading,
      showModal,
      uploadResult,
      success,
      fail,
      failRow,
      modifyVisible,
      modifyOneTruckLoading,
      modifyData,
    } = this.state;
    const { router } = this.props;

    return (
      <Layout {...this.routeView}>
        <Row type="flex" justify="end" className={s['top-btn-area']}>
          <Button type="primary" onClick={() => this.setState({ showModal: true })}>
            批量导入
          </Button>
          <Button type="primary" onClick={() => this.setState({ visible: true })}>
            增加车辆
          </Button>
        </Row>
        <div className={s.filterArea}>
          <div className={s.filterAreaItem}>
            <p>车牌号：</p>
            <Input
              allowClear
              placeholder="请输入车牌号"
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
            <Table loading={loading} columns={this.columns} dataSource={dataSource} pagination={pagination} />
          </section>
        </Content>

        {/* 增加车辆 */}
        <Modal
          visible={visible}
          title="增加车辆"
          confirmLoading={addOneTruckLoading}
          onCancel={this.handleCancelCreateTruck}
          onOk={this.handleSureAddOneTruck}>
          <CreateTruck ref={node => (this.createTruckRef = node)} fleetName={getQuery().fleetName} />
        </Modal>

        {/* 修改车辆 */}
        <Modal
          visible={modifyVisible}
          title="修改车辆信息"
          confirmLoading={modifyOneTruckLoading}
          onCancel={this.handleCancelModifyTruck}
          onOk={this.handleSureModifyOneTruck}>
          <ModifyTruck ref={node => (this.modifyTruckRef = node)} data={modifyData} />
        </Modal>

        <Modal visible={showModal} title="批量导入" footer={null} onCancel={() => this.setState({ showModal: false })}>
          <BatchImport
            handleDownLoad={this.downLoadTmp}
            handleUpload={this.upload}
            onCancel={() => this.setState({ showModal: false })}
          />
        </Modal>

        <Modal
          visible={uploadResult}
          title="批量导入结果"
          footer={null}
          onCancel={() => this.setState({ uploadResult: false })}>
          <Result
            status={fail === 0 ? 'success' : 'warning'}
            title={
              <div>
                该次导入成功
                <span style={{ color: 'rgb(0, 116, 194)', padding: 10 }}>{success}</span>
                条，失败
                <span style={{ color: '#E44040', padding: 5 }}>{fail}</span>条
              </div>
            }
            subTitle={
              fail > 0 && (
                <>
                  <h4>
                    上传失败的文件行数位于第
                    <span style={{ padding: 5 }}>{failRow.join('、')}</span>行
                  </h4>
                  <div style={{ textAlign: 'left' }}>
                    <h4>上传失败的原因：</h4>
                    <p>1. 是否已经导入相同的文件内容；</p>
                    <p>2. 请确保车牌号正确；</p>
                    <p>3. 请确保所属车队填写与已添加车队的信息一致；</p>
                    <p>4. 请确保必填信息完成填写；</p>
                  </div>
                </>
              )
            }
            extra={
              <Button size="large" type="primary" onClick={this.closeResult}>
                确定
              </Button>
            }
          />
        </Modal>
      </Layout>
    );
  }
}

export default withRouter(FleetDetail);
