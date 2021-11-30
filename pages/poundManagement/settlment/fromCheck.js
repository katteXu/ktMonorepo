import { useState, useEffect, useCallback } from 'react';
import { Input, Button, Checkbox, Table, message, Modal } from 'antd';
import { Layout, Content, Search, Msg, Ellipsis, AutoInput, DateRangePicker } from '@components';
import { EditPriceForm, Upload } from '@components/pound/Settlment';
import moment from 'moment';
import styles from './styles.less';
import Link from 'next/link';
import { Format, getDateRange } from '@utils/common';
import { EditOutlined, CheckCircleTwoTone } from '@ant-design/icons';
import { pound } from '@api';
import { useRouter } from 'next/router';
// 编辑单元格
const EditCell = ({ title, editable, children, dataIndex, record, reload, ...restProps }) => {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(false);
  const [value, setValue] = useState(() => {
    if (dataIndex) {
      return record[dataIndex] ? record[dataIndex] / 1000 : 0;
    } else {
      return '';
    }
  });

  useEffect(() => {
    if (dataIndex) {
      setValue(record[dataIndex] ? record[dataIndex] / 1000 : 0);
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
        pId: record.id,
        weight: value * 1000,
      };
      const res = await pound.updateWeight({ params });
      if (res.status === 0) {
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
    // 为0;
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

const FromCheck = () => {
  const routeView = {
    title: '发货审核',
    pageKey: 'settlment',
    longKey: 'poundManagement.settlment',
    breadNav: [
      '过磅管理',
      <Link href="/poundManagement/settlment">
        <a>人工结算</a>
      </Link>,
      '发货审核',
    ],
    pageTitle: '发货审核',
    useBack: true,
  };

  const router = useRouter();

  const columns = [
    {
      title: '出站时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '120px',
    },
    {
      title: '收货企业',
      dataIndex: 'toCompany',
      key: 'toCompany',
      width: '120px',
      render: value => <Ellipsis value={value} width={130} />,
    },
    {
      title: '货品名称',
      dataIndex: 'goodsType',
      key: 'goodsType',
      width: '120px',
    },
    {
      title: '车牌号',
      dataIndex: 'trailerPlateNumber',
      key: 'trailerPlateNumber',
      width: '120px',
    },
    {
      title: '毛重(吨)',
      dataIndex: 'totalWeight',
      key: 'totalWeight',
      width: '120px',
      align: 'right',
      render: Format.weight,
    },
    {
      title: '皮重(吨)',
      dataIndex: 'carWeight',
      key: 'carWeight',
      width: '120px',
      align: 'right',
      render: Format.weight,
    },
    {
      title: '发货净重(吨)',
      dataIndex: 'fromGoodsWeight',
      key: 'fromGoodsWeight',
      width: '120px',
      align: 'right',
      render: Format.weight,
    },
    {
      title: '收货净重(吨)',
      dataIndex: 'toGoodsWeight',
      key: 'toGoodsWeight',
      width: '120px',
      align: 'right',
      render: Format.weight,
      onCell: record => {
        return {
          record,
          editable: true,
          dataIndex: 'toGoodsWeight',
          title: '收货净重',
          reload: () => getRemoteData(query),
        };
      },
    },
    {
      title: '货物单价',
      dataIndex: 'goodsUnitPrice',
      key: 'goodsUnitPrice',
      width: '120px',
      align: 'right',
      render: Format.price,
    },
    {
      title: '路损(吨)',
      dataIndex: 'loss',
      key: 'loss',
      width: '120px',
      align: 'right',
      render: Format.weight,
    },
    {
      title: '路耗(元)',
      dataIndex: 'lossPrice',
      key: 'lossPrice',
      width: '120px',
      align: 'right',
      render: Format.price,
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
      title: '结算费用(元)',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: '120px',
      align: 'right',
      render: Format.price,
    },
  ];

  const [total, setTotal] = useState({
    sum_count: 0,
    sum_fromGoodsWeight: 0,
  });

  // 已选信息
  const [totalCheck, setTotalCheck] = useState({
    check_count: 0,
    check_fromGoodsWeight: 0,
  });

  const [query, setQuery] = useState(() => {
    const [begin, end] = getDateRange(-1, 'day');
    return {
      page: 1,
      pageSize: 10,
      begin,
      end,
      toCompany: '',
      goodsType: '',
      plate: '',
      dateStatus: 'toYesterday',
    };
  });

  const [checkedAll, setCheckedAll] = useState(false);
  const [indexList, setIndexList] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isSumLossWeight, setIsSumLossWeight] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [showModalGoods, setShowModalGoods] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [checkSettlementLoading, setCheckSettlementLoading] = useState(false);
  useEffect(() => {
    if (query.pageSize) {
      setIndexList([...new Array(query.pageSize).keys()]);
    }
  }, [query.pageSize]);

  useEffect(() => {
    getRemoteData(query);
  }, []);

  const [dataList, setDataList] = useState({});

  // 查询
  const handleSearch = () => {
    clearCheckData();
    setQuery({ ...query, page: 1 });
    getRemoteData({ ...query, page: 1 });
  };
  const handleReset = () => {
    clearCheckData();
    const query = {
      page: 1,
      pageSize: 10,
      begin: undefined,
      end: undefined,
      toCompany: '',
      goodsType: '',
      plate: '',
    };
    setQuery(query);
    getRemoteData(query);
    setTotalCheck({
      check_count: 0,
      check_fromGoodsWeight: 0,
    });
  };

  // 时间输入
  const handleChangeDate = useCallback(({ begin, end }, dateStatus) => {
    const _begin = begin ? moment(begin).format('YYYY-MM-DD HH:mm:ss') : undefined;
    const _end = end ? moment(end).format('YYYY-MM-DD HH:mm:ss') : undefined;
    setQuery(() => ({ ...query, begin: _begin, end: _end, dateStatus }));
  });

  // 收货企业
  const handleChangeCompany = value => {
    const toCompany = value;
    setQuery(() => ({ ...query, toCompany }));
  };

  // 货品名称
  const handleChangeGoodsName = value => {
    const goodsType = value;
    setQuery(() => ({ ...query, goodsType }));
  };

  // 车牌号
  const handleChangePlate = e => {
    const plate = e.target.value;
    setQuery(() => ({ ...query, plate }));
  };

  const [loading, setLoading] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);
  // 分页
  const onChangePage = useCallback(
    (page, pageSize) => {
      setQuery({ ...query, page, pageSize });
      getRemoteData({ ...query, page, pageSize });
    },
    [dataList]
  );

  // 切页码
  const onChangePageSize = useCallback(
    (current, pageSize) => {
      setQuery({ ...query, page: 1, pageSize });
      getRemoteData({ ...query, page: 1, pageSize });
    },
    [dataList]
  );

  // 选中单一值
  const onSelectRow = (record, selected, selectedRows, nativeEvent) => {
    const fromGoodsWeight = record.fromGoodsWeight;
    const key = record.id;
    if (selected) {
      setSelectedRowKeys([...selectedRowKeys, key]);
    } else {
      const i = selectedRowKeys.indexOf(key);
      selectedRowKeys.splice(i, 1);
      setSelectedRowKeys([...selectedRowKeys]);
    }

    // 计算总净重
    let _check_fromGoodsWeight = 0;
    _check_fromGoodsWeight += fromGoodsWeight || 0;

    if (selected) {
      setTotalCheck(total => {
        return {
          check_fromGoodsWeight: total.check_fromGoodsWeight + _check_fromGoodsWeight,
        };
      });
    } else {
      setTotalCheck(total => {
        return {
          check_fromGoodsWeight: total.check_fromGoodsWeight - _check_fromGoodsWeight,
        };
      });
    }
  };

  // 选中所有
  const onSelectAll = (selected, selectedRows, changeRows) => {
    changeRows.forEach(record => {
      const key = record.id;
      const fromGoodsWeight = record.fromGoodsWeight;
      const i = selectedRowKeys.indexOf(key);
      if (selected) {
        if (i === -1) selectedRowKeys.push(key);
      } else {
        selectedRowKeys.splice(i, 1);
      }

      // 计算总净重
      let _check_fromGoodsWeight = 0;
      _check_fromGoodsWeight += fromGoodsWeight || 0;
      if (selected) {
        if (i === -1) {
          setTotalCheck(total => {
            return {
              check_fromGoodsWeight: total.check_fromGoodsWeight + _check_fromGoodsWeight,
            };
          });
        }
      } else {
        setTotalCheck(total => {
          return {
            check_fromGoodsWeight: total.check_fromGoodsWeight - _check_fromGoodsWeight,
          };
        });
      }
    });

    setSelectedRowKeys([...selectedRowKeys]);
  };

  /**
   * 清空选中数据
   */
  const clearCheckData = () => {
    setCheckedAll(false);
    setSelectedRowKeys([]);
  };

  // 全选按钮
  const handleCheckedAll = () => {
    if (dataList.count) {
      clearCheckData();
      setCheckedAll(!checkedAll);
      setTotalCheck({
        check_count: 0,
        check_fromGoodsWeight: 0,
      });
    } else {
      message.warn('当前列表没有数据');
      setCheckedAll(false);
    }
  };

  // 编辑单价
  const handleEditPrice = async data => {
    const { unitPrice } = data;

    let params = getParams();

    params.unitPrice = unitPrice * 100;
    // 发货
    params.type = 0;

    const res = await pound.updatePrice({ params });
    if (res.status === 0) {
      message.success('运费单价修改成功');
      getRemoteData(query);
      setShowModal(false);
    } else {
      message.error(`${res.detail || res.description}`);
    }
  };
  // 编辑货物单价
  const handleEditPriceGoods = async data => {
    const { unitPrice } = data;

    let params = getParams();

    params.unitPrice = unitPrice * 100;
    // 发货
    params.type = 0;

    const res = await pound.updateManPayGoodsUnitPrice({ params });
    if (res.status === 0) {
      message.success('货物单价修改成功');
      getRemoteData(query);
      setShowModalGoods(false);
    } else {
      message.error(`${res.detail || res.description}`);
    }
  };

  // 查询
  const getRemoteData = async ({ toCompany, goodsType, plate, page, pageSize, begin, end }) => {
    setLoading(true);
    const hasDate = begin && end;
    const params = {
      type: 0,
      manPayStatus: 0,
      toCompany,
      goodsType,
      plate,
      page,
      limit: pageSize,
      begin: hasDate ? begin : undefined,
      end: hasDate ? end : undefined,
    };

    const res = await pound.getPoundBillList({ params });

    if (res.status === 0) {
      setDataList(res.result);
      setTotal({ ...res.result });
      setIsSumLossWeight(res.result.isSumLossWeight);
    } else {
      message.error(`${res.detail || res.description}`);
    }
    setLoading(false);
  };

  // 导入上传
  const handleUpload = async excelUrl => {
    const params = {
      excelUrl,
    };
    const res = await pound.importPoundBillWeight({ params });
    if (res.status === 0) {
      message.success('导入成功');
      getRemoteData(query);
      setShowUploadModal(false);
    } else {
      message.error(`${res.detail || res.description}`);
    }
  };

  // 审核通过
  const handleAudit = async () => {
    if (selectedRowKeys.length === 0 && !checkedAll) {
      message.error('请选择审核的磅单');
      return;
    }

    let params = getParams();

    params.manPayStatus = 1;
    // 发货
    params.type = 0;
    setCheckLoading(true);
    const res = await pound.updateStatus({ params });
    if (res.status === 0) {
      clearCheckData();
      getRemoteData(query);
      Modal.confirm({
        icon: <CheckCircleTwoTone twoToneColor="#52c41a" />,
        title: '审核成功，您可以选择',
        okText: '继续审核',
        cancelText: '去结算',
        onOk: () => {
          setTotalCheck({
            check_count: 0,
            check_fromGoodsWeight: 0,
          });
        },
        onCancel: () => {
          sessionStorage.setItem('settlment_tab', 'from');
          router.back();
        },
      });
    } else {
      message.error(`${res.detail || res.description}`);
    }
    setCheckLoading(false);
  };

  const handleAuditSettlement = async () => {
    if (selectedRowKeys.length === 0 && !checkedAll) {
      message.error('请选择审核的磅单');
      return;
    }

    let params = getParams();

    params.manPayStatus = 2;
    // 发货
    params.type = 0;
    params.passApprove = 1;
    setCheckSettlementLoading(true);
    const res = await pound.updateStatus({ params });
    if (res.status === 0) {
      clearCheckData();
      getRemoteData(query);
      Modal.confirm({
        icon: <CheckCircleTwoTone twoToneColor="#52c41a" />,
        title: '已审核并添加到结算，您可以选择',
        okText: '继续审核',
        cancelText: '去结算',
        onOk: () => {
          setTotalCheck({
            check_count: 0,
            check_fromGoodsWeight: 0,
          });
        },
        onCancel: () => {
          sessionStorage.setItem('settlment_tab', 'from');
          router.back();
        },
      });
    } else {
      message.error(`${res.detail || res.description}`);
    }
    setCheckSettlementLoading(false);
  };

  // 提交参数
  const getParams = () => {
    let params = {};
    const query = getCallbackQuery();
    if (checkedAll) {
      params = {
        begin: query.begin,
        end: query.end,
        goodsType: query.goodsType || undefined,
        plate: query.plate || undefined,
        toCompany: query.toCompany || undefined,
        isAll: 1,
      };
    } else {
      params = {
        pIds: selectedRowKeys.join(','),
      };
    }

    return params;
  };

  // 获取查询条件
  const getCallbackQuery = useCallback(() => {
    return query;
  }, [dataList]);

  // 数据选择
  // const isChecked = selectedRowKeys.length !== 0 || checkedAll;
  const isChecked = selectedRowKeys.length === 0 ? true : false;

  return (
    <Layout {...routeView}>
      <Content style={{ marginBottom: 56 }}>
        <section style={{ position: 'relative' }}>
          <Search onSearch={handleSearch} onReset={handleReset}>
            <Search.Item label="出站时间" br>
              <DateRangePicker
                quickBtn={true}
                onChange={handleChangeDate}
                value={{ begin: query.begin, end: query.end }}
                dateStatus={query.dateStatus}
              />
            </Search.Item>
            <Search.Item label="收货企业">
              <AutoInput
                mode="company"
                value={query.toCompany}
                allowClear
                placeholder="请输入收货企业"
                onChange={handleChangeCompany}
              />
            </Search.Item>
            <Search.Item label="货品名称">
              <AutoInput
                mode="goodsType"
                value={query.goodsType}
                allowClear
                placeholder="请输入货品名称"
                onChange={handleChangeGoodsName}
              />
            </Search.Item>
            <Search.Item label="车牌号">
              <Input value={query.plate} placeholder="请输入车牌号" onChange={handleChangePlate} allowClear />
            </Search.Item>
          </Search>

          <div className={styles.ctrl}>
            <Button type="primary" ghost onClick={() => setShowUploadModal(true)}>
              导入收货净重
            </Button>
            <Button
              style={{ marginLeft: 8 }}
              type="primary"
              ghost
              disabled={!checkedAll && selectedRowKeys.length === 0}
              onClick={() => setShowModal(true)}>
              编辑单价
            </Button>
            {isSumLossWeight && (
              <Button
                style={{ marginLeft: 8 }}
                type="primary"
                ghost
                disabled={!checkedAll && selectedRowKeys.length === 0}
                onClick={() => setShowModalGoods(true)}>
                编辑货物单价
              </Button>
            )}
          </div>

          <Msg style={{ marginTop: 16 }}>
            <Checkbox onClick={handleCheckedAll} checked={checkedAll}>
              全选(支持跨分页)
            </Checkbox>

            {(!isChecked || checkedAll) && <span style={{ marginRight: 12 }}>已选</span>}
            <>
              <span style={{ marginRight: 32 }}>
                运输车数
                <span className="total-num">{isChecked || checkedAll ? total.sum_count : selectedRowKeys.length}</span>
                辆
              </span>
              <span style={{ marginRight: 32 }}>
                发货净重
                <span className="total-num">
                  {Format.weight(
                    isChecked || checkedAll ? total.sum_fromGoodsWeight : totalCheck.check_fromGoodsWeight
                  )}
                </span>
                吨
              </span>
            </>
          </Msg>

          <Table
            loading={loading}
            dataSource={dataList.data}
            components={{
              body: {
                cell: EditCell,
              },
            }}
            columns={columns}
            rowKey={(record, i) => {
              return checkedAll ? i : record.id;
            }}
            pagination={{
              onChange: onChangePage,
              pageSize: query.pageSize,
              current: query.page,
              showSizeChanger: true,
              total: dataList.count,
            }}
            rowSelection={{
              selectedRowKeys: checkedAll ? indexList : selectedRowKeys,
              onSelect: onSelectRow,
              onSelectAll: onSelectAll,
              columnWidth: '17px',
              getCheckboxProps: () => {
                return { disabled: checkedAll };
              },
            }}
            scroll={{ x: 'auto' }}
          />

          <div className={styles['ctrl-bottom']}>
            <Button
              type="primary"
              loading={checkSettlementLoading}
              onClick={handleAuditSettlement}
              style={{ marginRight: 8 }}>
              审核并结算
            </Button>
            <Button type="primary" ghost loading={checkLoading} onClick={handleAudit}>
              审核通过
            </Button>
          </div>
        </section>
      </Content>
      <Modal
        title="编辑运费单价"
        onCancel={() => {
          setShowModal(false);
        }}
        visible={showModal}
        width={420}
        destroyOnClose
        footer={null}>
        <EditPriceForm onClose={() => setShowModal(false)} onSubmit={handleEditPrice} lableTitle="运费单价" />
      </Modal>
      <Modal
        title="编辑货物单价"
        onCancel={() => {
          setShowModalGoods(false);
        }}
        visible={showModalGoods}
        width={420}
        destroyOnClose
        footer={null}>
        <EditPriceForm onClose={() => setShowModalGoods(false)} onSubmit={handleEditPriceGoods} lableTitle="货物单价" />
      </Modal>

      <Modal
        className={styles.modal}
        title="导入文件"
        onCancel={() => {
          setShowUploadModal(false);
        }}
        visible={showUploadModal}
        width={480}
        destroyOnClose
        style={{ padding: '16px 15px' }}
        footer={null}>
        <Upload onClose={() => setShowUploadModal(false)} onSubmit={handleUpload} />
      </Modal>
    </Layout>
  );
};

export default FromCheck;
