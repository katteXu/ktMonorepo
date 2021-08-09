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
      render: Format.percent,
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
  const [status, setStatus] = useState({});
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
    if (Object.keys(status).filter(item => !!item).length >= 2) {
      let arr = [];
      list.forEach(item => {
        if (status[item.inventoryId] && status[item.inventoryId].value !== 0) {
          arr.push({
            inventoryId: item.inventoryId,
            proportion: status[item.inventoryId].percent * 100,
            goodsName: item.goodsName,
          });
        }
      });
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
  };

  const onChangeInput = (value, inventoryId, index) => {
    infoValue[index] = value.replace(/^(-)*(\d+)\.(\d{1,1}).*$/, '$1$2.$3');
    setInfoValue([...infoValue]);

    const total = eval(infoValue.filter(item => !!item).join('+'));
    if (true) {
      status[inventoryId] = { value: +value };
      Object.keys(status).forEach((key, index) => {
        const value = status[key].value;
        if (index === Object.keys(status).length - 1 && index !== 0) {
          status[key].percent = (
            100 -
            eval(
              Object.keys(status)
                .filter(k => key !== k)
                .map(item => status[item].percent)
                .join('+')
            )
          ).toFixed(2);
        } else {
          status[key].percent = ((value / total) * 100).toFixed(2);
        }
      });
    }
    console.log(status);

    setStatus({ ...status });
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
    //   Object.keys(status)
    //     .map(id => status[id] || 0)
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
      unitPrice += item.unitPrice * (status[item.inventoryId] ? status[item.inventoryId].percent / 100 : 0);
      volatilization += item.volatilization * (status[item.inventoryId] ? status[item.inventoryId].percent / 100 : 0);
      ashContent += item.ashContent * (status[item.inventoryId] ? status[item.inventoryId].percent / 100 : 0);
      sulfur += item.sulfur * (status[item.inventoryId] ? status[item.inventoryId].percent / 100 : 0);
      bond += item.bond * (status[item.inventoryId] ? status[item.inventoryId].percent / 100 : 0);
      colloid += item.colloid * (status[item.inventoryId] ? status[item.inventoryId].percent / 100 : 0);
      heat += item.heat * (status[item.inventoryId] ? status[item.inventoryId].percent / 100 : 0);
    });
    setPredictedList({ ...predictedList, unitPrice, volatilization, ashContent, sulfur, bond, colloid, heat });
    // setTotal(total);
  }, [status]);

  return (
    <Layout {...routeView}>
      <Content style={{ padding: '0 16px' }}>
        <ChildTitle style={{ margin: '16px 0 16px', fontWeight: 'bold' }}>原料煤信息表</ChildTitle>
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
                      min={0}
                      onKeyDown={handleKeyPress}
                      onChange={e => onChangeInput(e.target.value, item.inventoryId, index)}
                    />
                  </div>
                  <div>
                    {/* {+status[item.inventoryId] ? ((status[item.inventoryId] / total) * 100).toFixed(2) + '%' : ''} */}
                    {status[item.inventoryId] && status[item.inventoryId].percent * 1
                      ? `${status[item.inventoryId].percent}%`
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
        <div>
          <Button onClick={submit} type="primary" style={{ margin: '16px 0 48px 0' }}>
            保存
          </Button>
        </div>
      </Content>
    </Layout>
  );
};
export default Index;
