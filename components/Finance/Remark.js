import { useState, useEffect } from 'react';
import { Checkbox, Select } from 'antd';
// 备注信息编辑
const Remark = ({
  onChange,
  invoiceGoodsWeightSum = 0,
  tmp_trailerPlateNumber = '',
  goodsNameList = [],
  railWayList = [],
  personList = [],
  tmp_truck_type = '',
}) => {
  const [goodsName, setGoodsName] = useState([]);
  const [railWay, setRailWay] = useState([]);
  const [totalWeight, setTotalWeight] = useState();
  const [company, setCompany] = useState([]);
  const [number, setNumber] = useState();
  const [carType, setCarType] = useState();

  useEffect(() => {
    const v = `${goodsName.length > 0 ? '货品名称:' + goodsName.join() + ';\n' : ''}${
      railWay.length > 0 ? '装卸地址:' + railWay.join() + ';\n' : ''
    }${totalWeight ? '收货净重:' + totalWeight + ';\n' : ''}${
      company.length > 0 ? '发货企业:' + company.join() + ';\n' : ''
    }${number ? '车牌号:' + number + ';\n' : ''}${carType ? '车辆类型:' + carType + ';\n' : ''}`;
    onChange && onChange(v);
  }, [goodsName, railWay, totalWeight, company, number, carType]);

  // 复选框操作
  const checkboxChange = (e, callback) => {
    if (e.target.checked) {
      callback(e.target.value);
    } else {
      callback('');
    }
  };

  return (
    <div>
      <div>
        <span style={{ display: 'inline-block', width: 60 }}>收货净重</span>：
        {invoiceGoodsWeightSum ? (
          <Checkbox
            onChange={e => checkboxChange(e, setTotalWeight)}
            value={(invoiceGoodsWeightSum / 1000).toFixed(2) + '吨'}>
            {(invoiceGoodsWeightSum / 1000).toFixed(2)}吨
          </Checkbox>
        ) : (
          ''
        )}
        <span style={{ display: 'inline-block', marginLeft: 40 }}>车牌号</span>：
        {tmp_trailerPlateNumber && (
          <Checkbox onChange={e => checkboxChange(e, setNumber)} value={tmp_trailerPlateNumber + '等'}>
            {tmp_trailerPlateNumber}等
          </Checkbox>
        )}
        <span style={{ display: 'inline-block', marginLeft: 40 }}>车辆类型</span>：
        {tmp_truck_type && (
          <Checkbox onChange={e => checkboxChange(e, setCarType)} value={tmp_truck_type}>
            {tmp_truck_type}
          </Checkbox>
        )}
      </div>
      <div style={{ marginTop: 10 }}>
        <span style={{ display: 'inline-block', width: 60, textAlignLast: 'justify' }}>货品名称</span>：
        <Select
          mode="multiple"
          style={{ width: 500 }}
          placeholder="请选择货品名称"
          allowClear
          onChange={value => setGoodsName(value)}>
          {Array.from(new Set(goodsNameList)).map(item => (
            <Select.Option value={item} key={item}>
              {item}
            </Select.Option>
          ))}
        </Select>
      </div>
      <div style={{ marginTop: 10 }}>
        <span style={{ display: 'inline-block', width: 60, textAlignLast: 'justify' }}>装卸地址</span>：
        <Select
          mode="multiple"
          style={{ width: 500 }}
          placeholder="请选择装卸货地址"
          allowClear
          onChange={value => setRailWay(value)}>
          {Array.from(new Set(railWayList)).map(item => (
            <Select.Option value={item} key={item}>
              {item}
            </Select.Option>
          ))}
        </Select>
      </div>
      <div style={{ marginTop: 10 }}>
        <span style={{ display: 'inline-block', width: 60, textAlignLast: 'justify' }}>发货企业</span>：
        <Select
          mode="multiple"
          style={{ width: 500 }}
          placeholder="请选择发货企业"
          allowClear
          onChange={value => setCompany(value)}>
          {Array.from(new Set(personList)).map(item => (
            <Select.Option value={item} key={item}>
              {item}
            </Select.Option>
          ))}
        </Select>
      </div>
    </div>
  );
};

export default Remark;
