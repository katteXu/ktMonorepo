import { useState, useEffect, forwardRef } from 'react';
import { Cascader } from 'antd';
// import areaData from './area.json';
import { getProvinceList, getCityList, getCountyList } from '@api';

/**
 *
 * @param {boolean} useCode 是否启用地区编码 若启用 则value 返回格式为 ['北京市-101010','北京市-202020','西城区-303030']
 * @param {*} ref
 */
const AreaPicker = ({ dataSource, onChange, placeholder, className, value, useCode }, ref) => {
  useEffect(() => {
    (async () => {
      const res = await getProvinceList();
      if (res.status === 0) {
        const provinceList = res.result.data.map(({ province, provinceCode }) => {
          const value = useCode ? `${province}-${provinceCode}` : province;
          return { label: province, value, isLeaf: false, isProvince: true };
        });
        initData(provinceList);
      }
    })();
  }, []);

  // 设置数据
  const [data, setData] = useState([]);

  // change事件
  const handleChange = value => {
    onChange && onChange(value);
  };

  // 加载远程数据
  const loadRemoteData = async value => {
    const targetOption = value[value.length - 1];
    targetOption.loading = true;
    const param = targetOption.value.split('-')[0];
    if (targetOption.isProvince) {
      const res = await getCityList(param);
      targetOption.loading = false;
      if (res.status === 0) {
        const list = res.result.data.map(({ city, cityCode }) => {
          const value = useCode ? `${city}-${cityCode}` : city;
          return { label: city, value, isCity: true, isLeaf: false };
        });
        targetOption.children = list;
        setData([...data]);
      }
    }
    if (targetOption.isCity) {
      const res = await getCountyList(param);
      targetOption.loading = false;
      if (res.status === 0) {
        const list = res.result.data.map(({ county, countyCode }) => {
          const value = useCode ? `${county}-${countyCode}` : county;
          return { label: county, value };
        });
        targetOption.children = list;
        setData([...data]);
      }
    }
  };

  const initData = data => {
    setData(data);
  };

  // 渲染函数
  const AddressRender = value => {
    // console.log(value);
    return value && value.map(v => v.split('-')[0]).join('/');
  };

  return (
    <Cascader
      ref={ref}
      value={value}
      loadData={loadRemoteData}
      displayRender={() => AddressRender(value)}
      options={data}
      onChange={value => handleChange(value)}
      placeholder={placeholder || '请选择省市'}
      className={className}
    />
  );
};

export default forwardRef(AreaPicker);
