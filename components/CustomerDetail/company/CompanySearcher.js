import { useState, useCallback } from 'react';
import { Select } from 'antd';
import { useDebounceFn } from 'ahooks';

const Index = props => {
  const { onChange, placeholder, disContent, value, style, keyWord, getRemoteData } = props;
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const { run: onSearchCompany } = useDebounceFn(
    async value => {
      if (value.length < 2) {
        return;
      } else {
        setLoading(true);
        const res = await getData(1, value);
        if (res.status === 0) {
          const _options = res.result.data.ENTERPRISES.map(item => ({
            value: item.ENTNAME,
            key: item.ENTNAME,
          }));
          setOptions(_options);
        } else {
          setOptions([]);
        }
        setLoading(false);
      }
    },
    { wait: 500 }
  );

  const handleChange = useCallback(onSearchCompany, []);

  return (
    <Select
      loading={loading}
      placeholder={placeholder}
      disabled={disContent}
      style={{ width: '100%', ...style }}
      onChange={onChange}
      showSearch={true}
      onSearch={handleChange}
      value={value}
      optionFilterProp="children"
      notFoundContent={false}
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
