import { useState, useEffect } from 'react';
// import { Steps } from '@components/pound/Settlment';
import { Layout, Content, Ellipsis, Steps } from '@components';
import { SettlmentForm } from '@components/pound/Settlment';
import { Button, Table, Modal, message, Popconfirm, Input } from 'antd';
import { QuestionCircleFilled } from '@ant-design/icons';
import { Format } from '@utils/common';
import { EditOutlined } from '@ant-design/icons';
import Link from 'next/link';
import styles from './styles.less';
import moment from 'moment';
import { useRouter } from 'next/router';
import { pound, downLoadFile } from '@api';
import { Permission } from '@store';
// 编辑单元格
const EditCell = ({ title, editable, children, dataIndex, record, reload, ...restProps }) => {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(false);
  const [value, setValue] = useState(() => {
    if (dataIndex) {
      return record[dataIndex] ? record[dataIndex] / 100 : 0;
    } else {
      return '';
    }
  });

  useEffect(() => {
    if (dataIndex) {
      setValue(record[dataIndex] ? record[dataIndex] / 100 : 0);
    }
  }, [record]);

  const toggleEdit = () => {
    setEditing(!editing);
  };

  // 编辑输入框
  const handleChangeInput = e => {
    const { value } = e.target;
    // validateInput(value);
    // setValue(value);
    let val;
    val = value
      .replace(/[^\d.]/g, '')
      .replace(/^\./g, '')
      .replace('.', '$#$')
      .replace(/\./g, '')
      .replace('$#$', '.')
      .replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');
    validateInput(val);
    setValue(val);
  };

  const handleSave = async () => {
    if (error) {
      message.error('请输入非0数字');
    } else {
      const params = {
        pIds: record.ids.join(','),
        unitPrice: value * 100,
      };
      const res = await pound.updatePrice({ params });
      if (res.status === 0) {
        message.success('运费单价修改成功');
        toggleEdit();
        reload();
      } else {
        message.error(`${res.detail || res.description}`);
      }
    }
  };

  const validateInput = value => {
    let error = true;
    if (/^([1-9]\d*|0)(\.\d{1,2})?$/.test(value)) {
      error = false;
    } else {
      error = true;
    }
    // 为0
    if (value === '0') {
      error = true;
    }

    setError(error);
    return !error;
  };

  return (
    <td {...restProps}>
      {editable ? (
        editing ? (
          <Input
            value={value || ''}
            onBlur={handleSave}
            autoFocus={true}
            className={`${styles['edit-input']} ${error && styles.error}`}
            onChange={handleChangeInput}
          />
        ) : (
          <>
            {value ? (value * 1).toFixed(2) : '0.00'}
            <EditOutlined className={styles['edit-cell']} onClick={toggleEdit} />
          </>
        )
      ) : (
        <>{children}</>
      )}
    </td>
  );
};
const Order = props => {
  const router = useRouter();
  const { permissions, isSuperUser } = Permission.useContainer();
  const routeView = {
    title: '查看结算单',
    pageKey: 'settlment',
    longKey: 'poundManagement.settlment',
    breadNav: [
      '过磅管理',
      <Link href="/poundManagement/settlment">
        <a>人工结算</a>
      </Link>,
      '查看结算单',
    ],
    pageTitle: '查看结算单',
    useBack: true,
  };

  const columns = [
    {
      title: '磅单类型',
      dataIndex: 'receiveOrSend',
      key: 'receiveOrSend',
      width: '120px',
      render: value => (value ? '收货' : '发货'),
    },
    {
      title: '发货企业',
      dataIndex: 'fromCompany',
      key: 'fromCompany',
      width: '120px',
      render: value => <Ellipsis value={value} width={130} />,
    },
    {
      title: '收货企业',
      dataIndex: 'toCompany',
      key: 'toCompany',
      width: '120px',
      render: value => <Ellipsis value={value} width={130} />,
    },
    {
      title: '车牌号',
      dataIndex: 'trailerPlateNumber',
      key: 'trailerPlateNumber',
      width: '120px',
    },
    {
      title: '原发净重(吨)',
      dataIndex: 'fromGoodsWeight',
      key: 'fromGoodsWeight',
      width: '120px',
      align: 'right',
      render: Format.weight,
    },
    {
      title: '实收净重(吨)',
      dataIndex: 'toGoodsWeight',
      key: 'toGoodsWeight',
      width: '120px',
      align: 'right',
      render: Format.weight,
    },
    {
      title: '运费单价(元/吨)',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: '120px',
      align: 'right',
      render: Format.price,
      onCell: record => {
        return {
          record,
          editable: true,
          dataIndex: 'unitPrice',
          title: '运费单价(元/吨)',
          reload: () => getRemoteData(),
        };
      },
    },
    {
      title: '运输车数(辆)',
      dataIndex: 'count',
      key: 'count',
      width: '120px',
      align: 'right',
    },
    {
      title: '结算金额(元)',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: '120px',
      align: 'right',
      render: Format.price,
    },
    {
      title: '操作',
      dataIndex: 'ctrl',
      key: 'ctrl',
      width: '100px',
      align: 'right',
      fixed: 'right',
      render: (value, record) => {
        const ids = record.ids;
        return (
          <Popconfirm
            title="是否解散该数据？"
            placement="topRight"
            icon={<QuestionCircleFilled />}
            onConfirm={() => handleRemove(ids)}>
            <Button type="link" size="small" className="delete">
              解散
            </Button>
          </Popconfirm>
        );
      },
    },
  ];

  // 弹窗
  const [showModal, setShowModal] = useState(false);

  // 表单数据
  const [formData, setFormData] = useState({
    cardNumber: '',
    payTime: moment(),
    payName: '',
    payMobilNumber: '',
  });

  const [total, setTotal] = useState({
    allCount: 0,
    totalPriceSum: 0,
    totalPriceZn: '',
    fromGoodsWeightSum: 0,
    toGoodsWeightSum: 0,
  });

  useEffect(() => {
    getRemoteData();
  }, []);

  const [dataList, setDataList] = useState({});

  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportDetailLoading, setExportDetailLoading] = useState(false);

  // 提交表单
  const submitSettlment = async (data, isPay) => {
    const { payName, payTime, payMobilNumber, cardNumber, remark } = data;
    const pIds = dataList.data.reduce((arr, item) => [...arr, ...(item.ids || [])], []);
    const params = {
      payName,
      payTime: moment(payTime).format('YYYY-MM-DD HH:mm:ss'),
      payMobilNumber,
      cardNumber,
      pIds: pIds.join(','),
      manPayStatus: 3,
      accountStatus: isPay ? 1 : 0, //是否打款
      remark,
    };

    const res = await pound.updateStatus({ params });
    if (res.status === 0) {
      message.success('结算成功');
      sessionStorage.setItem('settlment_tab', 'list');
      router.back();
    } else {
      message.error(`${res.detail || res.description}`);
    }

    setShowModal(false);
  };

  // 导出
  const handleExport = async () => {
    if (dataList.data && dataList.data.length > 0) {
      setExportLoading(true);
      const params = {
        dump: 1,
      };
      const res = await pound.getPoundBillAccountList({ params });
      if (res.status === 0) {
        downLoadFile(res.result, '结算单');
        message.success('数据导出成功');
      } else {
        message.error(`数据导出失败，原因：${res.detail || res.description}`);
      }
      setExportLoading(false);
    } else {
      message.warn(`数据导出失败，原因：没有可导出的数据`);
    }
  };

  // 导出明细
  const handleExportDetail = async () => {
    if (dataList.data && dataList.data.length > 0) {
      setExportDetailLoading(true);
      const params = {
        dump: 1,
      };
      const res = await pound.getPoundBillAccountDetailExport({ params });
      if (res.status === 0) {
        downLoadFile(res.result, '结算单明细');
        message.success('数据导出成功');
      } else {
        message.error(`数据导出失败，原因：${res.detail || res.description}`);
      }
      setExportDetailLoading(false);
    } else {
      message.warn(`数据导出失败，原因：没有可导出的数据`);
    }
  };

  // 查询
  const getRemoteData = async () => {
    setLoading(true);

    const res = await pound.getPoundBillAccountList();

    if (res.status === 0) {
      setDataList(res.result);
      setTotal({ ...res.result });
      setFormData({
        payTime: res.result.payTime ? moment(res.result.payTime) : moment(),
        payName: res.result.payName,
        payMobilNumber: res.result.payMobilNumber,
        cardNumber: res.result.cardNumber,
      });
    } else {
      message.error(`${res.detail || res.description}`);
    }
    setLoading(false);
  };

  // 解散
  const handleRemove = async ids => {
    if (ids && ids.length > 0) {
      const params = {
        pIds: ids.join(','),
        manPayStatus: 1,
      };

      const res = await pound.updateStatus({ params });
      if (res.status === 0) {
        message.success('解散成功');
        getRemoteData();
      } else {
        message.error(`${res.detail || res.description}`);
      }
    } else {
      message.error('解散失败，磅单数据异常');
    }
  };

  // 结算按钮
  const handleShowSettlment = () => {
    if (dataList && dataList.data.length > 0) {
      setShowModal(true);
    } else {
      message.error('暂无可结算的磅单');
    }
  };
  const canEdit = isSuperUser || permissions.includes('MAN_PAY_UNIT_PRICE_MANAGEMENT');

  return (
    <Layout {...routeView}>
      <Content style={{ marginBottom: 56 }}>
        <section style={{ position: 'relative', paddingTop: 24 }}>
          <Steps
            data={[
              {
                title: '添加待结算磅单',
                key: true,
              },
              {
                title: '查看结算单',
                key: true,
              },
            ]}
          />

          <div className={styles.ctrl} style={{ marginTop: 16 }}>
            <Button onClick={handleExport} loading={exportLoading}>
              导出
            </Button>
            <Button onClick={handleExportDetail} loading={exportDetailLoading} style={{ marginLeft: 8 }}>
              导出明细
            </Button>
          </div>

          <div className={styles['table-block']}>
            {/* <div className={styles.header}>
              <div>
                <span>结算银行卡号：{formData.cardNumber || '--'}</span>
                <span>结算日期：{formData.payTime.format('YYYY-MM-DD HH:mm:ss')}</span>
              </div>
              <div>
                <span>结算姓名：{formData.payName || '--'}</span>
                <span>结算手机号：{formData.payMobilNumber || '--'}</span>
              </div>
            </div> */}
            <Table
              loading={loading}
              dataSource={dataList.data}
              columns={columns}
              components={{
                body: {
                  cell: canEdit ? EditCell : '',
                },
              }}
              pagination={false}
              scroll={{ x: 'auto' }}
              summary={pageData => {
                return (
                  <Table.Summary.Row className={styles.footer}>
                    <Table.Summary.Cell colSpan={4}>合计(大写)：{total.totalPriceZn}</Table.Summary.Cell>
                    <Table.Summary.Cell>
                      <div className={styles.item1}>{Format.weight(total.fromGoodsWeightSum)}</div>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell>
                      <div className={styles.item1}>{Format.weight(total.toGoodsWeightSum)}</div>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell></Table.Summary.Cell>
                    <Table.Summary.Cell>
                      <div className={styles.item1}>{total.allCount}</div>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell>
                      <div className={styles.item2}>{Format.price(total.totalPriceSum)}</div>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell></Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
          </div>

          <div className={styles['ctrl-bottom']}>
            <Button onClick={() => router.back()}>上一步</Button>
            <Button style={{ marginLeft: 8 }} type="primary" onClick={handleShowSettlment}>
              结算
            </Button>
          </div>
        </section>
      </Content>
      <Modal
        title="结算"
        onCancel={() => {
          setShowModal(false);
        }}
        visible={showModal}
        width={480}
        destroyOnClose
        footer={null}>
        <SettlmentForm
          formData={formData}
          onSubmit={submitSettlment}
          onClose={() => {
            setShowModal(false);
          }}
        />
      </Modal>
    </Layout>
  );
};

export default Order; // connect(({ menu }) => ({ menu }))(Order);
