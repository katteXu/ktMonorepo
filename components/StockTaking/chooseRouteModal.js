import { useState, useCallback, useEffect } from 'react';
import { Modal, Spin, Input, Button, Pagination } from 'antd';
// import s from '@styles/supplement.less';
import { Search } from '@components';
import { getRoute } from '@api';
const Index = ({ handleSureChooseRoute, userId }) => {
  const [routes, setRoutes] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  // 查询条件
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
    fromCompany: '',
    toCompany: '',
    goodsType: '',
  });

  const handleChangeFromCompany = useCallback(e => {
    const fromCompany = e.target.value;
    setQuery(() => ({ ...query, fromCompany }));
  });

  const handleChangeToCompany = useCallback(e => {
    const toCompany = e.target.value;
    setQuery(() => ({ ...query, toCompany }));
  });

  const handleChangeGoodsType = useCallback(e => {
    const goodsName = e.target.value;
    setQuery(() => ({ ...query, goodsName }));
  });

  /**
   * 查询事件
   */
  const handleSearch = useCallback(() => {
    setQuery({ ...query, page: 1 });
    requestRouteList({ ...query, page: 1 });
  }, [query]);

  /**
   * 重置事件
   */
  const handleReset = useCallback(() => {
    const query = {
      page: 1,
      pageSize: 10,
      fromCompany: '',
      toCompany: '',
      goodsName: '',
    };
    setQuery(query);
    requestRouteList({ ...query, page: 1 });
  }, []);

  // 分页
  const onChangePage = useCallback(
    page => {
      setQuery({ ...query, page });
      requestRouteList({ ...query, page });
    },
    [query]
  );

  useEffect(() => {
    requestRouteList({ ...query });
  }, []);

  // 请求专线列表
  const requestRouteList = async ({ fromCompany, toCompany, goodsName, page, pageSize }) => {
    setLoading(true);
    const { status, result, detail, description } = await getRoute({
      params: {
        limit: pageSize,
        fromCompany,
        toCompany,
        goodsName,
        onlyPound: '1',
        userId: userId,
        page,
      },
    });

    if (!status) {
      const { data, count } = result;
      setRoutes(data);
      setCount(count);
    } else {
      Modal.error({
        title: '获取专线失败',
        content: detail || description,
        // onOk: () => this.setState({ loading: false }),
      });
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Search onSearch={handleSearch} onReset={handleReset}>
        <Search.Item label="发货企业">
          <Input
            placeholder="请输入发货企业"
            style={{ flex: 1 }}
            value={query.fromCompany}
            onChange={handleChangeFromCompany}
          />
        </Search.Item>
        <Search.Item label="收货企业" style={{ marginRight: 0, paddingRight: 0 }}>
          <Input
            style={{ flex: 1 }}
            placeholder="请输入收货企业"
            value={query.toCompany}
            onChange={handleChangeToCompany}
          />
        </Search.Item>
        <Search.Item label="货品名称">
          <Input
            style={{ flex: 1 }}
            placeholder="请输入货品名称"
            value={query.goodsName}
            onChange={handleChangeGoodsType}
          />
        </Search.Item>
      </Search>
      <div className={s['modal-content']} style={{ flex: 1, marginTop: 16 }}>
        <Spin spinning={loading}>
          <ul>
            {routes.map(item => {
              const {
                id,
                fromAddress,
                toAddress,
                fromAddressCompany,
                toAddressCompany,
                // fromCompany,
                // toCompany,
                goodsType,
                unitPrice,
                remark,
              } = item;

              const fromCompany = fromAddressCompany.id ? fromAddressCompany.companyName : fromAddress.companyName;
              const toCompany = toAddressCompany.id ? toAddressCompany.companyName : toAddress.companyName;
              return (
                <li
                  key={id}
                  onClick={() => {
                    handleSureChooseRoute(id, fromCompany, toCompany, goodsType, unitPrice);
                  }}>
                  <div>
                    <span style={{ display: 'inline-block', maxWidth: 320 }}>发货企业：{fromCompany}</span>
                    <span style={{ display: 'inline-block', maxWidth: 320 }}>收货企业：{toCompany}</span>
                    {remark && <span>专线备注：{remark}</span>}
                  </div>
                  <div>
                    <span>货品名称：{goodsType}</span>
                    <span>运费单价：{unitPrice ? `${(unitPrice / 100).toFixed(2)} 元` : '-'}</span>
                    {remark && <span style={{ display: 'inline-block', height: 21 }}></span>}
                  </div>
                </li>
              );
            })}
          </ul>
        </Spin>
      </div>
      <div className={s['pagination-box']}>
        <Pagination
          current={query.page}
          size="default"
          total={count}
          onChange={onChangePage}
          showSizeChanger={false}
          showTotal={false}
        />
      </div>
    </div>
  );
};
export default Index;
