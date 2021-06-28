import { useState, useCallback, useEffect } from 'react';
import { Input, Table, Checkbox, Button, message, Modal, Empty } from 'antd';
import { Layout, Content, Search, Msg, Ellipsis, DateRangePicker } from '@components';
import moment from 'moment';
import styles from './styles.less';
import Link from 'next/link';
import { Format, getDateRange } from '@utils/common';
import { CheckCircleTwoTone } from '@ant-design/icons';
import { pound } from '@api';
import { useRouter } from 'next/router';

const FromAdd = () => {
  const routeView = {
    title: '发货添加',
    pageKey: 'settlment',
    longKey: 'poundManagement.settlment',
    breadNav: [
      '过磅管理',
      <Link href="/poundManagement/settlment">
        <a>人工结算</a>
      </Link>,
      '发货添加',
    ],
    pageTitle: '发货添加',
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
      title: '运费单价(元/吨)',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: '120px',
      align: 'right',
      render: Format.price,
    },
    {
      title: '结算运费(元)',
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
  };

  // 时间输入
  const handleChangeDate = useCallback(({ begin, end }, dateStatus) => {
    const _begin = begin ? moment(begin).format('YYYY-MM-DD HH:mm:ss') : undefined;
    const _end = end ? moment(end).format('YYYY-MM-DD HH:mm:ss') : undefined;
    setQuery(() => ({ ...query, begin: _begin, end: _end, dateStatus }));
  });

  // 收货企业
  const handleChangeCompany = e => {
    const toCompany = e.target.value;
    setQuery(() => ({ ...query, toCompany }));
  };

  // 货品名称
  const handleChangeGoodsName = e => {
    const goodsType = e.target.value;
    setQuery(() => ({ ...query, goodsType }));
  };

  // 车牌号
  const handleChangePlate = e => {
    const plate = e.target.value;
    setQuery(() => ({ ...query, plate }));
  };

  const [loading, setLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
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
    const key = record.id;
    const fromGoodsWeight = record.fromGoodsWeight;
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

  // 查询
  const getRemoteData = async ({ toCompany, goodsType, plate, page, pageSize, begin, end }) => {
    setLoading(true);
    const hasDate = begin && end;
    const params = {
      type: 0,
      manPayStatus: 1,
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
    } else {
      message.error(`${res.detail || res.description}`);
    }
    setLoading(false);
  };

  // 添加
  const handleAdd = async () => {
    if (selectedRowKeys.length === 0 && !checkedAll) {
      message.error('请选择要添加的磅单');
      return;
    }

    let params = getParams();

    params.manPayStatus = 2;
    // 发货
    params.type = 0;

    setAddLoading(true);
    const res = await pound.updateStatus({ params });
    if (res.status === 0) {
      clearCheckData();
      getRemoteData(query);
      Modal.confirm({
        icon: <CheckCircleTwoTone twoToneColor="#52c41a" />,
        title: '添加成功，是否继续添加？',
        okText: '是',
        cancelText: '否',
        onOk: () => {},
        onCancel: () => router.back(),
      });
    } else {
      message.error(`${res.detail || res.description}`);
    }
    setAddLoading(false);
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

  const getCallbackQuery = useCallback(() => {
    return query;
  }, [dataList]);
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
              <Input value={query.toCompany} placeholder="请输入收货企业" onChange={handleChangeCompany} allowClear />
            </Search.Item>
            <Search.Item label="货品名称">
              <Input value={query.goodsType} placeholder="请输入货品名称" onChange={handleChangeGoodsName} allowClear />
            </Search.Item>
            <Search.Item label="车牌号">
              <Input value={query.plate} placeholder="请输入车牌号" onChange={handleChangePlate} allowClear />
            </Search.Item>
          </Search>

          <Msg style={{ marginTop: 16 }}>
            <Checkbox onClick={handleCheckedAll} checked={checkedAll}>
              全选(支持跨分页)
            </Checkbox>
            {(!isChecked || checkedAll) && <span style={{ marginRight: 12 }}>已选</span>}
            <span style={{ marginRight: 32 }}>
              运输车数
              <span className="total-num">{isChecked || checkedAll ? total.sum_count : selectedRowKeys.length}</span>辆
            </span>
            <span style={{ marginRight: 32 }}>
              发货净重
              <span className="total-num">
                {Format.weight(isChecked || checkedAll ? total.sum_fromGoodsWeight : totalCheck.check_fromGoodsWeight)}
              </span>
              吨
            </span>
          </Msg>

          <Table
            loading={loading}
            dataSource={dataList.data}
            columns={columns}
            rowKey={(record, i) => {
              return checkedAll ? i : record.id;
            }}
            locale={{
              emptyText: <Empty description="暂无磅单，请先审核" image={Empty.PRESENTED_IMAGE_SIMPLE} />,
            }}
            pagination={{
              onChange: onChangePage,
              pageSize: query.pageSize,
              current: query.page,
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
            <Button type="primary" loading={addLoading} onClick={handleAdd}>
              确认添加
            </Button>
          </div>
        </section>
      </Content>
    </Layout>
  );
};

export default FromAdd;
