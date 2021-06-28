import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';

import { Select } from 'antd';
import { useDebounceFn } from 'ahooks';
import { inventory } from '@api';

const Index = (props, ref) => {
  const { onChange, placeholder, allowClear, value, style, disabled } = props;
  const [options, setOptions] = useState([]);
  useEffect(() => {
    // 初始化选项数据
    setGoodsType();
  }, []);

  // 设置货物类型数据源
  const setGoodsType = async () => {
    const params = {
      isPage: 0,
    };
    const res = await inventory.wareHouseList({ params });
    if (res.status === 0) {
      setOptions(res.result);
    }
  };
  //刷新
  useImperativeHandle(ref, () => ({
    refresh: () => {
      setGoodsType();
    },
  }));

  return (
    <Select
      placeholder={placeholder}
      style={{ width: '100%', ...style }}
      onChange={onChange}
      showSearch={true}
      value={value}
      disabled={disabled}
      optionFilterProp="children"
      allowClear={allowClear}>
      <Select.Option value={-1}>暂不分库</Select.Option>
      {options.map((val, item) => (
        <Select.Option key={item} value={val.id} item={val}>
          {val.name}
        </Select.Option>
      ))}
    </Select>
  );
};
export default forwardRef(Index);
