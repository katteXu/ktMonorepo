import { useState, useEffect } from 'react';
import { Layout, Content, Ellipsis } from '@components';
import { EditForm } from '@components/pound/Settlment';
import { Button, Table, Modal, message } from 'antd';
import { Format } from '@utils/common';
import Link from 'next/link';
import moment from 'moment';
import styles from './styles.less';
import { useRouter } from 'next/router';
import { pound, downLoadFile } from '@api';

const View = () => {
  const router = useRouter();
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
  ];

  // 弹窗
  const [showModal, setShowModal] = useState(false);
  // 表单数据
  const [formData, setFormData] = useState({
    cardNumber: '',
    payTime: moment(),
    payName: '',
    payMobilNumber: '',
    remark: '',
  });

  const [total, setTotal] = useState({
    allCount: 0,
    totalPriceSum: 0,
    totalPriceZn: '',
  });

  useEffect(() => {
    getRemoteData();
  }, []);

  const [dataList, setDataList] = useState({});

  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportDetailLoading, setExportDetailLoading] = useState(false);

  // 提交表单
  const submitSettlment = async data => {
    const { payName, payTime, payMobilNumber, cardNumber, remark } = data;
    const params = {
      payName,
      payTime: moment(payTime).format('YYYY-MM-DD HH:mm:ss'),
      payMobilNumber,
      cardNumber,
      id: router.query.id,
      remark,
    };

    const res = await pound.updateAccountData({ params });
    if (res.status === 0) {
      message.success('编辑成功');
      setFormData({
        payName,
        payTime,
        payMobilNumber,
        cardNumber,
        remark,
      });
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
        id: router.query.id,
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
        listId: router.query.id,
        // dump: true,
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
    const params = {
      id: router.query.id,
    };
    const res = await pound.getPoundBillAccountList({ params });

    if (res.status === 0) {
      setDataList(res.result);
      setTotal({ ...res.result });
      setFormData({
        payTime: res.result.payTime ? moment(res.result.payTime) : moment(),
        payName: res.result.payName,
        payMobilNumber: res.result.payMobilNumber,
        cardNumber: res.result.cardNumber,
        remark: res.result.remark,
      });
    } else {
      message.error(`${res.detail || res.description}`);
    }
    setLoading(false);
  };

  return (
    <Layout {...routeView}>
      <Content style={{ marginBottom: 56 }}>
        <section style={{ position: 'relative' }}>
          <div className={styles.ctrl} style={{ marginTop: 0 }}>
            <Button onClick={handleExport} loading={exportLoading}>
              导出
            </Button>
            <Button onClick={handleExportDetail} loading={exportDetailLoading} style={{ marginLeft: 8 }}>
              导出明细
            </Button>
          </div>

          <div className={styles['table-block']}>
            <div className={styles.header}>
              <div>
                <span>结算银行卡号：{formData.cardNumber || '--'}</span>
                <span>结算日期：{formData.payTime.format('YYYY-MM-DD HH:mm:ss')}</span>
              </div>
              <div>
                <span>结算姓名：{formData.payName || '--'}</span>
                <span>结算手机号：{formData.payMobilNumber || '--'}</span>
              </div>
            </div>

            <Table
              loading={loading}
              dataSource={dataList.data}
              columns={columns}
              pagination={false}
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
                  </Table.Summary.Row>
                );
              }}
              scroll={{ x: 'auto' }}
            />
            <div className={styles.remark}>
              <span>备注：</span>
              <span>{formData.remark || '--'}</span>
            </div>
          </div>

          <div className={styles['ctrl-bottom']}>
            <Button style={{ marginLeft: 8 }} type="primary" onClick={() => setShowModal(true)}>
              编辑
            </Button>
          </div>
        </section>
      </Content>

      <Modal
        title="编辑"
        onCancel={() => {
          setShowModal(false);
        }}
        visible={showModal}
        width={480}
        destroyOnClose
        footer={null}>
        <EditForm
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

export default View;
