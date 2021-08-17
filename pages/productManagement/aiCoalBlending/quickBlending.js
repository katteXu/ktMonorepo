import React, { useState, useEffect } from 'react';
import { Layout, Content, Image, ChildTitle } from '@components';
import { Button, Table, Input, Select, message } from 'antd';
import router from 'next/router';
import { getGoodsType, product } from '@api';
import style from './styles.less';
import { Format } from '@utils/common';

const Index = () => {
  const routeView = {
    title: '智能配煤',
    pageKey: 'aiCoalBlending',
    longKey: 'productManagement.aiCoalBlending',
    breadNav: '智慧工厂.智能配煤',
    pageTitle: '智能配煤',
    useBack: true,
  };
  const columns = [
    {
      title: '原料煤名称',
      dataIndex: 'goodsName',
      key: 'goodsName',
      width: 120,
    },
    {
      title: '单价(元)',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      align: 'right',
      width: 120,
      render: Format.price,
    },

    {
      title: '灰分(% Ad)',
      dataIndex: 'ashContent',
      key: 'ashContent',
      align: 'right',
      width: 120,
      render: Format.percent,
    },
    {
      title: '挥发(% Vdaf)',
      dataIndex: 'volatilization',
      key: 'volatilization',
      align: 'right',
      width: 120,
      render: Format.percent,
    },
    {
      title: '全硫(% Std)',
      dataIndex: 'sulfur',
      key: 'sulfur',
      align: 'right',
      width: 120,
      render: Format.percent,
    },

    {
      title: '粘结指数(GRI)',
      dataIndex: 'bond',
      key: 'bond',
      align: 'right',
      width: 120,
      render: Format.percent,
    },
    {
      title: '胶质层(Y)',
      dataIndex: 'colloid',
      key: 'colloid',
      align: 'right',
      width: 120,
      render: Format.percent,
    },
    {
      title: '发热量(卡)',
      dataIndex: 'heat',
      key: 'heat',
      align: 'right',
      width: 120,
      render: value => (value / 100).toFixed(0),
    },
  ];

  const [list, setList] = useState([]);
  const [predictedList, setPredictedList] = useState({
    unitPrice: 0,
    ashContent: 0,
    volatilization: 0,
    sulfur: 0,
    bond: 0,
    colloid: 0,
    heat: 0,
  });
  const [data, setData] = useState({});
  const [GoodsType, setGoodsType] = useState([]);

  const [infoValue, setInfoValue] = useState([]);
  const [goodsDetail, setGoodsDetail] = useState('');
  useEffect(() => {
    const list = sessionStorage.getItem('blendingList');

    setList(JSON.parse(list));
    initGoodsType();
    // return () => {
    //   sessionStorage.removeItem('blendingList');
    // };
  }, []);

  const initGoodsType = async () => {
    const params = {
      coalBlend: 1,
    };
    const res = await product.getGoodsList({ params });
    if (res.status === 0) {
      setGoodsType(res.result);
    }
  };

  const submit = async () => {
    if (Object.keys(data).filter(item => !!item).length >= 2) {
      let arr = [];
      list.forEach(item => {
        if (data[item.inventoryId] && data[item.inventoryId].value !== 0) {
          arr.push({
            inventoryId: item.inventoryId,
            proportion: data[item.inventoryId].percent * 100,
            goodsName: item.goodsName,
          });
        }
      });
      if (arr.length >= 2) {
        let params = {
          material: arr,
          predictUnitPrice: parseInt(predictedList.unitPrice),
          predictAshContent: parseInt(predictedList.ashContent),
          predictVolatilization: parseInt(predictedList.volatilization),
          predictSulfur: parseInt(predictedList.sulfur),
          predictBond: parseInt(predictedList.bond),
          predictColloid: parseInt(predictedList.colloid),
          predictHeat: parseInt(predictedList.heat),
          inventoryId: goodsDetail.value,
          goodsName: goodsDetail.label,
        };

        const res = await product.add_forward_coal_blending_scheme({ params });

        if (res.status === 0) {
          router.push('/productManagement/coalBlendingManagement');
        } else {
          message.error(`${res.detail || res.description}`);
        }
      } else {
        message.error('请输入原料配比');
      }
    } else {
      message.error('请输入原料配比');
    }
  };

  const onChangeInput = (value, inventoryId, index) => {
    // console.log(value.test('/^(-)*(d+).(d{1,1}).*$/'));

    // infoValue[index] = value.replace(/^(-)*(\d+)\.(\d{1,1}).*$/, '$1$2.$3');  //可以输入0
    infoValue[index] = value.replace(/^\D*([1-9]\d*\.?\d{0,1})?.*$/, '$1'); //不等于0
    setInfoValue([...infoValue]);

    const total = eval(infoValue.filter(item => !!item).join('+'));

    data[inventoryId] = { value: +value.replace(/^\D*([1-9]\d*\.?\d{0,1})?.*$/, '$1') };
    Object.keys(data).forEach((key, index) => {
      const value = data[key].value;
      if (index === Object.keys(data).length - 1 && index !== 0) {
        data[key].percent = (
          100 -
          eval(
            Object.keys(data)
              .filter(k => key !== k)
              .map(item => data[item].percent)
              .join('+')
          )
        ).toFixed(2);
      } else {
        data[key].percent = ((value / total) * 100).toFixed(2);
      }
    });

    console.log(data);

    setData({ ...data });
  };

  const handleKeyPress = event => {
    if ([189, 187, 69].includes(event.keyCode)) {
      event.preventDefault();
    }
  };

  // 目标货品
  const handleChangeGoodsType = value => {
    console.log(value);
    setGoodsDetail(value);
  };

  useEffect(() => {
    // const total = eval(
    //   Object.keys(data)
    //     .map(id => data[id] || 0)
    //     .join('+')
    // );

    let unitPrice = 0;
    let ashContent = 0;
    let volatilization = 0;
    let sulfur = 0;
    let bond = 0;
    let colloid = 0;
    let heat = 0;
    list.forEach(item => {
      unitPrice += item.unitPrice * (data[item.inventoryId] ? data[item.inventoryId].percent / 100 : 0);
      volatilization += item.volatilization * (data[item.inventoryId] ? data[item.inventoryId].percent / 100 : 0);
      ashContent += item.ashContent * (data[item.inventoryId] ? data[item.inventoryId].percent / 100 : 0);
      sulfur += item.sulfur * (data[item.inventoryId] ? data[item.inventoryId].percent / 100 : 0);
      bond += item.bond * (data[item.inventoryId] ? data[item.inventoryId].percent / 100 : 0);
      colloid += item.colloid * (data[item.inventoryId] ? data[item.inventoryId].percent / 100 : 0);
      heat += item.heat * (data[item.inventoryId] ? data[item.inventoryId].percent / 100 : 0);
    });
    setPredictedList({ ...predictedList, unitPrice, volatilization, ashContent, sulfur, bond, colloid, heat });
    // setTotal(total);
  }, [data]);

  return (
    <Layout {...routeView}>
      <Content style={{ padding: '0 16px' }}>
        <ChildTitle style={{ margin: '16px 0 16px', fontWeight: 'bold' }}>原料信息表</ChildTitle>
        <Table columns={columns} rowKey="inventoryId" pagination={false} dataSource={list} scroll={{ x: 'auto' }} />
        <ChildTitle style={{ margin: '16px 0 16px', fontWeight: 'bold' }}>配方信息</ChildTitle>
        <div className={style.blendingBox}>
          <div className={style.box} style={{ width: list.length * 142 }}>
            <div className={style.boxCol}>
              <div>原料煤名称</div>
              <div>配比</div>
              <div>百分比(%)</div>
            </div>
            {list.map((item, index) => {
              return (
                <div className={style.boxCol} key={index}>
                  <div>{item.goodsName}</div>
                  <div>
                    <Input
                      value={infoValue[index]}
                      style={{ width: '80%', height: 30 }}
                      type="number"
                      min={1}
                      onKeyDown={handleKeyPress}
                      onChange={e => onChangeInput(e.target.value, item.inventoryId, index)}
                    />
                  </div>
                  <div>
                    {/* {+data[item.inventoryId] ? ((data[item.inventoryId] / total) * 100).toFixed(2) + '%' : ''} */}
                    {data[item.inventoryId] && data[item.inventoryId].percent * 1
                      ? `${data[item.inventoryId].percent}%`
                      : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <ChildTitle style={{ margin: '16px 0 16px', fontWeight: 'bold' }}>结果预测</ChildTitle>
        <div className={style.blendingBox}>
          <div className={style.boxBottom}>
            <div className={style.boxBottomCol}>
              <div>成本(元)</div>
              <div>灰分(% Ad)</div>
              <div>挥发(% Vdaf)</div>
              <div>全硫(% Std)</div>
              <div>粘结指数(GRI)</div>
              <div>胶质层(Y) </div>
              <div>发热量(卡)</div>
            </div>
            <div className={style.boxBottomCol}>
              <div>{Format.percent(predictedList.unitPrice)}</div>
              <div>{Format.percent(predictedList.ashContent)}</div>
              <div>{Format.percent(predictedList.volatilization)}</div>
              <div>{Format.percent(predictedList.sulfur)}</div>
              <div>{Format.percent(predictedList.bond)}</div>
              <div>{Format.percent(predictedList.colloid)}</div>
              <div>{Format.percent(predictedList.heat)}</div>
            </div>
          </div>
        </div>

        <ChildTitle style={{ margin: '16px 0 16px', fontWeight: 'bold' }}>目标货品</ChildTitle>
        <div style={{ marginLeft: 10 }}>
          <label>货品名称：</label>
          <Select
            style={{ width: 200 }}
            allowClear
            placeholder="请选择目标货品"
            className={style.ipt}
            optionFilterProp="children"
            showSearch
            labelInValue
            onChange={handleChangeGoodsType}>
            {GoodsType.map(({ id, goodsName }) => (
              <Select.Option value={id} key={id} label={goodsName}>
                {goodsName}
              </Select.Option>
            ))}
          </Select>
        </div>

        <div>
          <Button onClick={submit} type="primary" style={{ margin: '16px 0 48px 10px' }}>
            保存
          </Button>
        </div>
      </Content>
    </Layout>
  );
};
export default Index;
