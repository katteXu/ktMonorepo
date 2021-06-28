import { useState, useEffect, useCallback } from 'react';
import { Select, DatePicker, message, Input, Button, Table, Modal } from 'antd';
import { inventory } from '@api';
import { keepState, getState, clearState, Format, getQuery } from '@utils/common';
import { Search, Msg } from '@components';
import AddStockForm from '@components/Inventory/inventoryWater/addStockForm';
import router from 'next/router';
import moment from 'moment';
import { Permission } from '@store';
const { Option } = Select;
const Index = props => {
  const { permissions, isSuperUser } = Permission.useContainer();
  const columns = [
    {
      title: '货品名称',
      dataIndex: 'goodsName',
      key: 'goodsName',
      width: 200,
      render: value => value || '-',
    },
    {
      title: '入库类型',
      dataIndex: 'dataTypeZn',
      key: 'dataTypeZn',
      width: 200,
      render: value => value || '-',
    },
    {
      title: '入库数量(吨)',
      dataIndex: 'changeValue',
      key: 'changeValue',
      width: 200,
      align: 'right',
      render: Format.weight,
    },
    {
      title: '入库时间',
      dataIndex: 'changeTime',
      key: 'changeTime',
      width: 300,
      render: value => value || '-',
    },
    {
      title: '操作',
      dataIndex: 'ctrl',
      key: 'ctrl',
      width: 100,
      align: 'right',
      fixed: 'right',
      render: (value, record, index) => (
        <Button
          size="small"
          type="link"
          key="detail"
          onClick={() => router.push(`/inventory/inventoryWater/storageDetail?id=${record.id}`)}>
          详情
        </Button>
      ),
    },
  ];
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
    begin: undefined,
    end: undefined,
    type: undefined,
    goodsName: '',
  });

  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [dataList, setDataList] = useState({});
  const [total, setTotal] = useState({
    count: 0,
    totalWeight: 0,
  });
  const [showNewStorage, setShowNewStorage] = useState(false);

  useEffect(() => {
    const { isServer } = props;
    if (isServer) {
      clearState();
    }

    const { startTime, nowTime, type: typeStatus, goodsName } = getQuery();
    // 获取持久化数据
    const state = getState().query;
    setQuery({ ...query, begin: startTime, end: nowTime, type: typeStatus, goodsName });
    getDataInfo({ ...query, begin: startTime, end: nowTime, type: typeStatus, goodsName });
  }, []);

  const getDataInfo = async ({ page, pageSize, begin, end, type, goodsName }) => {
    setLoading(true);

    const params = {
      goodsName,
      limit: pageSize,
      page,
      changeTimeBegin: begin,
      changeTimeEnd: end,
      type,
    };

    const res = await inventory.inventoryInList({ params });

    if (res.status === 0) {
      setDataList(res.result);
      setTotal({
        totalWeight: res.result.totalWeight,
        count: res.result.count,
      });
      // 持久化状态
      keepState({
        query: {
          goodsName,
          page,
          pageSize,
          begin,
          end,
          type,
          count: res.result.count,
        },
      });
    } else {
      message.error(`${res.detail || res.description}`);
    }
    setLoading(false);
  };
  //  查询
  const handleSearch = useCallback(() => {
    setQuery({ ...query, page: 1 });

    getDataInfo({ ...query, page: 1 });
  }, [query]);

  // 重置
  const handleReset = useCallback(() => {
    const query = {
      page: 1,
      pageSize: 10,
      begin: undefined,
      end: undefined,
      type: undefined,
      goodsName: '',
    };
    setQuery(query);
    getDataInfo(query);
  }, []);

  // 分页
  const onChangePage = useCallback(
    (page, pageSize) => {
      setQuery({ ...query, page, pageSize });
      getDataInfo({ ...query, page, pageSize });
    },
    [dataList]
  );

  // 切页码
  const onChangePageSize = useCallback(
    (current, pageSize) => {
      setQuery({ ...query, page: 1, pageSize });
      getDataInfo({ ...query, page: 1, pageSize });
    },
    [dataList]
  );

  // 日期输入
  const handleChangeDate = useCallback((value, string) => {
    const begin = value && value[0] && moment(value[0]).format('YYYY-MM-DD HH:mm:ss');
    const end = value && value[1] && moment(value[1]).format('YYYY-MM-DD HH:mm:ss');
    setQuery(() => ({ ...query, begin, end }));
  });

  // 运单状态
  const handleChangeType = useCallback(value => {
    const type = value;
    setQuery(() => ({ ...query, type }));
  });

  // 货品名称
  const handleChangeGoodsType = useCallback(e => {
    const goodsName = e.target.value;
    setQuery(() => ({ ...query, goodsName }));
  });

  return (
    <section>
      {(isSuperUser || permissions.includes('INVENTORY_OPERATE')) && (
        <Button type="primary" style={{ marginBottom: 16 }} onClick={() => setShowNewStorage(true)}>
          新增入库
        </Button>
      )}

      <Search onSearch={handleSearch} onReset={handleReset}>
        <Search.Item label="入库时间" br>
          <DatePicker.RangePicker
            style={{ width: 376 }}
            value={query.begin && query.end ? [moment(query.begin), moment(query.end)] : null}
            showTime={{
              defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
            }}
            onChange={handleChangeDate}
          />
        </Search.Item>
        <Search.Item label="入库类型">
          <Select
            value={query.type}
            placeholder="请选择入库类型"
            style={{ width: '100%' }}
            onChange={handleChangeType}
            allowClear>
            {/* <Option value="">全部</Option> */}
            <Option value="POUND">采购入库</Option>
            <Option value="MANUAL_PRO">生产入库</Option>
            <Option value="MANUAL">手动入库</Option>
            <Option value="INVENTORY_CHECK">盘点入库</Option>
          </Select>
        </Search.Item>
        <Search.Item label="货品名称">
          <Input allowClear value={query.goodsName} placeholder="请输入货品名称" onChange={handleChangeGoodsType} />
        </Search.Item>
      </Search>

      <Msg style={{ marginTop: 16 }}>
        合计：
        <span style={{ marginLeft: 8 }}>入库次数</span>
        <span className={'total-num'}>{total.count}</span>条<span style={{ marginLeft: 32 }}>入库数量总计</span>
        <span className={'total-num'}>{Format.weight(total.totalWeight)}</span>吨
      </Msg>
      <Table
        loading={loading}
        dataSource={dataList.data}
        columns={columns}
        pagination={{
          onChange: onChangePage,
          showSizeChanger: true,
          pageSize: query.pageSize,
          current: query.page,
          total: dataList.count,
        }}
      />

      <Modal
        width={640}
        destroyOnClose
        maskClosable={false}
        visible={showNewStorage}
        footer={null}
        onCancel={() => {
          setShowNewStorage(false);
        }}
        title="新增入库">
        <AddStockForm
          onClose={() => {
            setShowNewStorage(false);
          }}
          onSubmit={() => {
            setShowNewStorage(false), handleSearch();
          }}
        />
      </Modal>
    </section>
  );
};

export default Index;
