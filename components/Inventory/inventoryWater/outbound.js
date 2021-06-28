import { useState, useEffect, useCallback } from 'react';
import { Select, DatePicker, message, Input, Button, Table, Modal } from 'antd';
import { inventory } from '@api';
import { keepState, getState, clearState, Format, getQuery } from '@utils/common';
import { Search, Msg } from '@components';
import AddStockOutForm from '@components/Inventory/inventoryWater/addStockOutForm';
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
      title: '客户',
      dataIndex: 'supplyCompany',
      key: 'supplyCompany',
      width: 200,
      render: value => value || '-',
    },
    {
      title: '仓库',
      dataIndex: 'wareHouseName',
      key: 'wareHouseName',
      width: 200,
      render: value => value || '-',
    },
    {
      title: '出库类型',
      dataIndex: 'dataTypeZn',
      key: 'dataTypeZn',
      width: 200,
      render: value => value || '-',
    },
    {
      title: '出库数量(吨)',
      dataIndex: 'changeValue',
      key: 'changeValue',
      width: 200,
      align: 'right',
      render: Format.weight,
    },
    {
      title: '出库时间',
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
          onClick={() => {
            keepState({
              query: {
                ...query,
                num: 2,
              },
            });
            router.push(`/inventory/inventoryWater/outboundDetail?id=${record.id}`);
          }}>
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
    supplyCompany: '',
    wareHouseName: '',
  });

  const [loading, setLoading] = useState(false);
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

  const getDataInfo = async ({ page, pageSize, begin, end, type, goodsName, supplyCompany, wareHouseName }) => {
    setLoading(true);
    const params = {
      goodsName,
      limit: pageSize,
      page,
      changeTimeBegin: begin,
      changeTimeEnd: end,
      type,
      supplyCompany,
      wareHouseName,
    };

    const res = await inventory.inventoryOutList({ params });

    if (res.status === 0) {
      setDataList(res.result);
      setTotal({
        totalWeight: res.result.totalWeight,
        count: res.result.count,
      });
      // 持久化状态
      keepState({
        query: {
          page,
          pageSize,
          begin,
          end,
          type,
          goodsName,
          count: res.result.count,
          supplyCompany,
          wareHouseName,
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
      supplyCompany: '',
      wareHouseName: '',
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

  // 供应商
  const handleChangeCompany = useCallback(e => {
    const supplyCompany = e.target.value;
    setQuery(() => ({ ...query, supplyCompany }));
  });
  // 仓库
  const handleChangeWarehouse = useCallback(e => {
    const wareHouseName = e.target.value;
    setQuery(() => ({ ...query, wareHouseName }));
  });

  return (
    <section>
      {(isSuperUser || permissions.includes('INVENTORY_OPERATE')) && (
        <Button type="primary" style={{ marginBottom: 16 }} onClick={() => setShowNewStorage(true)}>
          新增出库
        </Button>
      )}
      {/* onExport={handleExport} exportLoading={exportLoading} */}
      <Search onSearch={handleSearch} onReset={handleReset}>
        <Search.Item label="出库时间" br>
          <DatePicker.RangePicker
            style={{ width: 376 }}
            value={query.begin && query.end ? [moment(query.begin), moment(query.end)] : null}
            showTime={{
              defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
            }}
            onChange={handleChangeDate}
          />
        </Search.Item>
        <Search.Item label="出库类型">
          <Select value={query.type} placeholder="请选择出库类型" style={{ width: '100%' }} onChange={handleChangeType}>
            {/* <Option value="">全部</Option> */}
            <Option value="POUND">销售出库</Option>
            <Option value="COAL_WASH">洗煤出库</Option>
            <Option value="COAL_BLENDING">配煤出库</Option>
            <Option value="MANUAL">手动出库</Option>
            <Option value="INVENTORY_CHECK">盘点出库</Option>
          </Select>
        </Search.Item>
        <Search.Item label="货品名称">
          <Input allowClear value={query.goodsName} placeholder="请输入货品名称" onChange={handleChangeGoodsType} />
        </Search.Item>
        <Search.Item label="客户">
          <Input allowClear value={query.supplyCompany} placeholder="请输入客户" onChange={handleChangeCompany} />
        </Search.Item>
        <Search.Item label="仓库">
          <Input allowClear value={query.wareHouseName} placeholder="请输入仓库" onChange={handleChangeWarehouse} />
        </Search.Item>
      </Search>

      <Msg style={{ marginTop: 16 }}>
        合计：
        <span style={{ marginLeft: 8 }}>出库次数</span>
        <span className={'total-num'}>{total.count}</span>条<span style={{ marginLeft: 32 }}>出库数量总计</span>
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
        title="新增出库">
        <AddStockOutForm
          onClose={() => setShowNewStorage(false)}
          onSubmit={() => {
            handleSearch(), setShowNewStorage(false);
          }}
        />
      </Modal>
    </section>
  );
};

export default Index;
