import React, { useState, useEffect, useCallback } from 'react';
import { customer, getListContract } from '@api';
import { Select } from 'antd';
import { useDebounceFn } from 'ahooks';
const Index = props => {
  const { onChange, placeholder, allowClear, mode, disContent, value, newCompany, style } = props;
  const [dataSource, setDataSource] = useState([]);
  const [options, setOptions] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [pageC, setPageC] = useState(1);
  useEffect(() => {
    // 初始化选项数据
    initOptions();
  }, []);

  // 设置合同类型数据源
  const setContract = async () => {
    const params = { page: 1 };
    const res = await getListContract({ params });
    if (res.status === 0) {
      const data = res.result.data.map((item, key) => ({
        value: item.title,
        key: item.id,
        ...item,
      }));
      setDataSource(unique(data));
      setPageC(Number(res.result.page) + 1);

      setOptions(data);
    }
  };

  const unique = data => {
    let map = new Map();
    for (let item of data) {
      if (!map.has(item.value)) {
        map.set(item.value, item);
      }
    }
    return [...map.values()];
  };

  useEffect(() => {
    if (props.newCompany) {
      setCompany();
    }
  }, [props.newCompany]);

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
    if (mode === 'contract') {
      setContract();
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

  // 获取合同数据
  const getContractData = useCallback(
    async (page, v) => {
      const params = {
        companyName: v || value,
        page,
      };
      const res = await getListContract({ params });
      return res;
    },
    [value]
  );

  // 搜索
  // const onSearchContract = value => {
  //   const _options = dataSource.filter(item => item.value.includes(value));
  //   setOptions(_options);
  // };

  const { run: onSearchContract } = useDebounceFn(
    async value => {
      setLoading(true);
      const res = await getContractData(1, value);

      if (res.status === 0) {
        const _options = res.result.data.map(item => ({
          value: item.companyName,
          key: item.id,
          ...item,
        }));
        setPageC(Number(res.result.page) + 1);
        setOptions(_options);
      } else {
        setOptions([]);
      }
      setLoading(false);
    },
    { wait: 500 }
  );

  const { run: onSearchCompany } = useDebounceFn(
    async value => {
      setLoading(true);
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

  const handleChange = useCallback(mode === 'contract' ? onSearchContract : onSearchCompany, [mode, dataSource]);

  const loadMore = async e => {
    if (mode === 'company') {
      const { scrollHeight, scrollTop, clientHeight } = e.target;

      if (scrollHeight - 200 < clientHeight + scrollTop) {
        handleClick();
      }
    } else if (mode === 'contract') {
      const { scrollHeight, scrollTop, clientHeight } = e.target;

      if (scrollHeight - 200 < clientHeight + scrollTop) {
        handleClickContract();
      }
    }
  };

  const { run: handleClickContract } = useDebounceFn(
    async () => {
      setLoading(true);
      const res = await getContractData(pageC);

      if (res.status === 0) {
        const _options = res.result.data.map(item => ({
          value: item.title,
          key: item.id,
          ...item,
        }));

        if (_options.length > 0) {
          setOptions([...options, ..._options]);
          setPageC(Number(res.result.page) + 1);
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

  const { run: handleClick } = useDebounceFn(
    async () => {
      setLoading(true);
      const res = await getCompanyData(page);
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
      disabled={disContent}
      style={{ width: '100%', ...style }}
      onChange={onChange}
      showSearch={mode === 'contract' ? false : true}
      onSearch={mode === 'contract' ? () => {} : handleChange}
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
