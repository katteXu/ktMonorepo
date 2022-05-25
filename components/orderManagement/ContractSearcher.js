import { useState, useEffect, useCallback } from 'react';
import { Select } from 'antd';
import { useDebounceFn } from 'ahooks';

const Index = props => {
  const { onChange, placeholder, disabled, value, style, keyWord, getRemoteData } = props;
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   getInitialData();
  // }, []);

  // const getInitialData = async () => {
  //   const res = await getData(1, value);
  //   if (res.status === 0) {
  //     const _options = res.result.data.map(item => ({
  //       ...item,
  //       value: item.contractNo,
  //       key: item.id,
  //     }));
  //     setOptions(_options);
  //   } else {
  //     setOptions([]);
  //   }
  // };

  // 获取数据
  const getData = useCallback(
    async (page, v) => {
      const params = {
        size: 10,
        page,
        [keyWord]: v,
      };
      const res = await getRemoteData({ params });
      return res;
    },
    [value]
  );

  const { run: onSearchContract } = useDebounceFn(
    async value => {
      // if (value.length < 2) {
      //   return;
      // } else {
      setLoading(true);
      const res = await getData(1, value);
      if (res.status === 0) {
        const _options = res.result.data.map(item => ({
          ...item,
          value: item.contractNo,
          key: item.id,
        }));
        setOptions(_options);
      } else {
        setOptions([]);
      }
      setLoading(false);
      // }
    },
    { wait: 500 }
  );

  const handleChange = useCallback(onSearchContract, []);

  return (
    <Select
      loading={loading}
      placeholder={placeholder}
      disabled={disabled}
      style={{ width: '100%', ...style }}
      onChange={onChange}
      showSearch={true}
      onSearch={handleChange}
      value={value}
      optionFilterProp="children"
      filterOption={() => true}>
      {options.map((val, item) => (
        <Select.Option key={item} value={val.key} item={val}>
          {val.value}
        </Select.Option>
      ))}
    </Select>
  );
};

export default Index;
