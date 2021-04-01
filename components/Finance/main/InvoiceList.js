// 开票列表 多种状态
import React, { useState, useCallback, useEffect } from 'react';
import { Input, DatePicker, Button, Table, Modal, message } from 'antd';
import { InfoCircleTwoTone } from '@ant-design/icons';
import { Search, Msg } from '@components';
import { Format } from '@utils/common';
import { finance } from '@api';
import PayPasswordInput from '@components/common/PayPasswordInput';
import moment from 'moment';
import styles from '../styles.less';
import router from 'next/router';
const InvoiceList = ({ status, onChangeTabNum, reload, refreshTotalData }) => {
  const columns = [
    {
      title: '批次号',
      dataIndex: 'batchId',
      key: 'batchId',
      width: 90,
    },
    {
      title: '结算净重(吨)',
      dataIndex: 'weightSum',
      key: 'weightSum',
      width: 90,
      align: 'right',
      render: Format.weight,
    },
    {
      title: '运费金额(元)',
      dataIndex: 'priceSum',
      key: 'priceSum',
      align: 'right',
      width: 120,
      render: Format.price,
    },
    {
      title: '含税金额(元)',
      dataIndex: 'invoicePriceSum',
      key: 'invoicePriceSum',
      align: 'right',
      width: 120,
      render: Format.price,
    },
    {
      title: '税费金额(元)',
      dataIndex: 'difference',
      key: 'difference',
      align: 'right',
      width: 90,
      render: Format.price,
    },
    {
      title: '提交时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
    },
    {
      title: '操作',
      dataIndex: 'batchId',
      key: 'ctrl',
      fixed: 'right',
      align: 'right',
      width: 120,
      render: (value, record) => {
        const { difference, id, status } = record;
        return (
          <>
            <Button
              size="small"
              type="link"
              onClick={() => {
                toView(record);
              }}>
              查看
            </Button>
            {status === 'UN_PAY' && (
              <Button
                size="small"
                type="link"
                onClick={() => {
                  setPayInfo({ showPass: true, payId: id, payMoney: difference });
                }}>
                支付
              </Button>
            )}
          </>
        );
      },
    },
  ];

  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState({});
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
    batchId: '',
    begin: undefined,
    end: undefined,
  });

  const [payInfo, setPayInfo] = useState({});

  // 初始化
  useEffect(() => {
    getRemoteData({ ...query });
  }, []);

  useEffect(() => {
    if (reload) {
      // 重置
      handleReset();
    }
  }, [reload]);

  // 修改总数
  useEffect(() => {
    onChangeTabNum && onChangeTabNum({ status, value: dataList.count });
  }, [dataList]);

  const [total, setTotal] = useState({
    weight: 0,
    price: 0,
    invoicePrice: 0,
    difference: 0,
  });

  const handleChangeBatchId = useCallback(e => {
    const batchId = e.target.value;
    setQuery(() => ({ ...query, batchId }));
  });

  const handleChangeDate = useCallback((value, string) => {
    const begin = value && value[0] && moment(value[0]).format('YYYY-MM-DD HH:mm:ss');
    const end = value && value[1] && moment(value[1]).format('YYYY-MM-DD HH:mm:ss');
    setQuery(() => ({ ...query, begin, end }));
  });

  const handleSearch = useCallback(() => {
    setQuery({ ...query, page: 1 });
    getRemoteData({ ...query, page: 1 });
  }, [query]);

  const handleReset = useCallback(() => {
    const query = {
      page: 1,
      pageSize: 10,
      batchId: '',
      begin: undefined,
      end: undefined,
    };
    setQuery(query);
    getRemoteData(query);
  }, []);

  // 分页
  const onChangePage = useCallback(
    page => {
      setQuery({ ...query, page });
      getRemoteData({ ...query, page });
    },
    [query]
  );

  // 切页码
  const onChangePageSize = useCallback(
    (current, pageSize) => {
      setQuery({ ...query, page: 1, pageSize });
      getRemoteData({ ...query, page: 1, pageSize });
    },
    [query]
  );

  // 查看
  const toView = record => {
    const { id, status, batchId, payType } = record;
    const mode = status === 'REJECT_APPROVE' ? 'edit' : 'view';

    const params = {
      id,
      payType,
    };

    router.push(
      `/finance/invoiceList/record?id=${id}&mode=${mode}&batchId=${batchId}&payType=${payType}&status=${status}`
    );
  };

  // 支付
  const pay = async () => {
    const { payId, password } = payInfo;
    if (password && password.length > 0) {
      setPayInfo({ ...payInfo, payLoading: true });
      const params = {
        id: payId,
        payPass: {
          passOne: password[0].value,
          passTwo: password[1].value,
          passThree: password[2].value,
          passFour: password[3].value,
          passFive: password[4].value,
          passSix: password[5].value,
        },
      };
      const res = await finance.payInvoice({ params });
      if (res.status === 0) {
        message.success('支付成功');
        setPayInfo({ ...payInfo, showPass: false, payLoading: false });
        handleReset();
        // 刷新全局金额
        refreshTotalData && refreshTotalData();
      } else {
        setPayInfo({ ...payInfo, payError: res.detail ? res.detail : res.description, payLoading: false });
      }
    } else {
      message.error('请输入完整密码');
    }
  };
  /**
   * 查询数据
   * @param {Object} param0
   */
  const getRemoteData = async ({ batchId, begin, end, page, pageSize = 10 }) => {
    setLoading(true);
    const params = {
      batchId,
      begin: begin || undefined,
      end: end || undefined,
      limit: pageSize,
      status,
      page,
    };

    const res = await finance.getInvoiceList({ params });

    if (res.status === 0) {
      setDataList(res.result);
      setTotal({
        price: res.result.totalPrice,
        invoicePrice: res.result.totalInvoicePrice,
        weight: res.result.totalWeight,
        difference: res.result.totalDifference,
      });
    } else {
      message.error(`${res.detail || res.description}`);
    }
    setLoading(false);
  };

  return (
    <div className={styles['invoice-list']}>
      <Search
        onSearch={() => {
          handleSearch();
          refreshTotalData && refreshTotalData();
        }}
        onReset={() => {
          handleReset();
          refreshTotalData && refreshTotalData();
        }}
        simple>
        <Search.Item label="提交时间">
          <DatePicker.RangePicker
            value={query.begin && query.end ? [moment(query.begin), moment(query.end)] : null}
            allowClear
            style={{ width: '100%' }}
            showTime={{
              defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
            }}
            format="YYYY-MM-DD HH:mm:ss"
            onChange={handleChangeDate}
          />
        </Search.Item>
        <Search.Item label="批次号">
          <Input value={query.batchId} allowClear onChange={handleChangeBatchId} placeholder="请输入批次号" />
        </Search.Item>
      </Search>
      <Msg>
        合计：
        <span style={{ marginLeft: 8 }}>总净重</span>
        <span className={'total-num'}>{Format.weight(total.weight)}</span>吨
        <span style={{ marginLeft: 32 }}>运费总额</span>
        <span className={'total-num'}>{Format.price(total.price)}</span>元
        <span style={{ marginLeft: 32 }}>含税总额</span>
        <span className={'total-num'}>{Format.price(total.invoicePrice)}</span>元
        <span style={{ marginLeft: 32 }}>税费总额</span>
        <span className={'total-num'}>{Format.price(total.difference)}</span>元
      </Msg>
      <Table
        columns={columns}
        loading={loading}
        dataSource={dataList.data}
        rowKey="batchId"
        scroll={{ x: 'auto' }}
        pagination={{
          onChange: onChangePage,
          onShowSizeChange: onChangePageSize,
          pageSize: query.pageSize,
          current: query.page,
          total: dataList.count,
        }}
      />

      <Modal
        width={400}
        destroyOnClose
        maskClosable={false}
        visible={payInfo.showPass}
        footer={null}
        onCancel={() => setPayInfo({ ...payInfo, showPass: false })}
        title="请输入支付密码">
        <div className={styles['password-block']}>
          <div className={styles['confirm-msg']}>
            <InfoCircleTwoTone style={{ fontSize: 18, verticalAlign: 'sub', marginRight: 6 }} twoToneColor="#faad14" />
            您的支付总额为<span className={styles.number}>{(payInfo.payMoney / 100).toFixed(2)}</span>元
          </div>
          <div className={styles['pass-ipt']}>
            <PayPasswordInput onChange={value => setPayInfo({ ...payInfo, password: value })} />
          </div>
          <div className={styles['error-msg']}>{payInfo.payError}</div>
          <div className={styles.btn}>
            <Button type="primary" onClick={pay} loading={payInfo.payLoading}>
              完成
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InvoiceList;
