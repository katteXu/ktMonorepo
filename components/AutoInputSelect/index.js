import React, { useState, useEffect, useCallback } from 'react';
import { getListGoods, customer } from '@api';
import { Select } from 'antd';
import { useDebounceFn } from 'ahooks';

const Index = props => {
  const { onChange, placeholder, allowClear, mode, value } = props;
  const [dataSource, setDataSource] = useState([]);
  const [options, setOptions] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    // 初始化选项数据
    initOptions();
  }, []);

  // 设置货物类型数据源
  const setGoodsType = async () => {
    const res = await getListGoods();
    if (res.status === 0) {
      const data = res.result.map((item, key) => ({
        value: item.goodsName,
        key: item.id,
      }));
      setDataSource(unique(data));
      setOptions(unique(data));
    }
  };

  useEffect(() => {
    if (props.newGoodsType) {
      setGoodsType();
    }
  }, [props.newGoodsType]);
  useEffect(() => {
    if (props.newCompany) {
      setCompany();
    }
  }, [props.newCompany]);

  const unique = data => {
    let map = new Map();
    for (let item of data) {
      if (!map.has(item.value)) {
        map.set(item.value, item);
      }
    }
    return [...map.values()];
  };

  // 设置企业数据源
  const setCompany = async () => {
    const params = { page: 1 };
    const res = await customer.getDataList({ params });
    if (res.status === 0) {
      const data = res.result.data.map((item, key) => ({
        value: item.companyName,
        key: item.id,
      }));
      setPage(res.result.page + 1);
      setOptions(data);
    }
  };

  // 初始化选项数据
  const initOptions = async () => {
    if (mode === 'goodsType') {
      setGoodsType();
    } else {
      setCompany();
    }
  };

  // 获取企业数据
  const getCompanyData = useCallback(
    async (page, v) => {
      const params = {
        companyName: v || value,
        page,
      };

      const res = await customer.getDataList({ params });
      return res;
    },
    [value]
  );

  // 搜索
  const onSearchGoodsType = value => {
    const _options = dataSource.filter(item => item.value.includes(value));
    setOptions(_options);
  };

  const { run: onSearchCompany } = useDebounceFn(
    async value => {
      setLoading(true);

      setSearchValue(value);
      const res = await getCompanyData(1, value);
      if (res.status === 0) {
        const _options = res.result.data.map(item => ({
          value: item.companyName,
          key: item.id,
        }));
        setPage(res.result.page + 1);
        setOptions(_options);
      } else {
        setOptions([]);
      }
      setLoading(false);
    },
    { wait: 500 }
  );

  const handleChange = useCallback(mode === 'goodsType' ? onSearchGoodsType : onSearchCompany, [mode, dataSource]);

  const loadMore = async e => {
    if (mode === 'company') {
      const { scrollHeight, scrollTop, clientHeight } = e.target;

      if (scrollHeight - 200 < clientHeight + scrollTop) {
        handleClick();
      }
    }
  };

  const { run: handleClick } = useDebounceFn(
    async () => {
      setLoading(true);
      const res = await getCompanyData(page, searchValue);
      if (res.status === 0) {
        const _options = res.result.data.map(item => ({
          value: item.companyName,
          key: item.id,
        }));
        if (_options.length > 0) {
          setOptions([...options, ..._options]);
          setPage(res.result.page + 1);
        } else {
          console.log('没有更多');
        }
      } else {
        setOptions(options);
      }
      setLoading(false);
    },
    { wait: 500 }
  );
  return (
    <Select
      loading={loading}
      placeholder={placeholder}
      style={{ width: '100%', ...props.style }}
      onChange={onChange}
      showSearch={true}
      // onSearch={mode === 'company' ? () => {} : handleChange}
      onSearch={handleChange}
      value={value}
      optionFilterProp="children"
      allowClear={allowClear}
      onPopupScroll={loadMore}>
      {options.map((val, item) => (
        <Select.Option key={item} value={val.key} item={val}>
          {val.value}
        </Select.Option>
      ))}
    </Select>
  );
};

export default Index;
