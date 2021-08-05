import React, { useState, useEffect } from 'react';
import { Layout, Content, Image, ChildTitle } from '@components';
import { Button, Table, Input, Select } from 'antd';
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
      dataIndex: 'colloid',
      key: 'colloid',
      align: 'right',
      width: 120,
      // render: Format.percent,
    },
  ];

  const columns1 = [
    {
      title: '成本(元)',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
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
      dataIndex: 'colloid1',
      key: 'colloid',
      align: 'right',
      width: 120,
      // render: Format.percent,
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
    colloid1: 0,
  });
  const [status, setStatus] = useState({});
  const [GoodsType, setGoodsType] = useState([]);
  const [total, setTotal] = useState(0);
  const [infoValue, setInfoValue] = useState([]);
  useEffect(() => {
    const list = sessionStorage.getItem('blendingList');
    console.log(JSON.parse(list));
    setList(JSON.parse(list));
    initGoodsType();
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

  const submit = () => {
    delete console.log(status);
  };

  const onChangeInput = (value, inventoryId, index) => {
    if (+value) {
      status[inventoryId] = value;
    } else {
      delete status[inventoryId];
    }
    infoValue[index] = value.replace(/^(-)*(\d+)\.(\d{1,2}).*$/, '$1$2.$3');
    console.log(infoValue);
    setInfoValue([...infoValue]);
    setStatus({ ...status });
  };

  // 目标货品
  const handleChangeGoodsType = value => {
    setGoodsDetail(value);
    const targetGood = GoodsType.find(item => item.id === value);
    onChangeGoods && onChangeGoods(targetGood);
  };

  useEffect(() => {
    const total = eval(
      Object.keys(status)
        .map(id => status[id] || 0)
        .join('+')
    );

    let unitPrice = 0;
    let ashContent = 0;
    let volatilization = 0;
    let sulfur = 0;
    let bond = 0;
    let colloid = 0;
    let colloid1 = 0;
    list.forEach(item => {
      unitPrice += item.unitPrice * (status[item.inventoryId] ? status[item.inventoryId] / total : 0);
      volatilization += item.volatilization * (status[item.inventoryId] ? status[item.inventoryId] / total : 0);
      ashContent += item.ashContent * (status[item.inventoryId] ? status[item.inventoryId] / total : 0);
      sulfur += item.sulfur * (status[item.inventoryId] ? status[item.inventoryId] / total : 0);
      bond += item.bond * (status[item.inventoryId] ? status[item.inventoryId] / total : 0);
      colloid += item.colloid * (status[item.inventoryId] ? status[item.inventoryId] / total : 0);
      colloid1 += item.colloid1 * (status[item.inventoryId] ? status[item.inventoryId] / total : 0);
    });
    setPredictedList({ ...predictedList, unitPrice, volatilization, ashContent, sulfur, bond, colloid, colloid1 });
    setTotal(total);
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
                <div className={style.boxCol}>
                  <div>{item.goodsName}</div>
                  <div>
                    <Input
                      value={infoValue[index]}
                      style={{ width: '80%', height: 30 }}
                      type="number"
                      min={0}
                      onChange={e => onChangeInput(e.target.value, item.inventoryId, index)}
                    />
                  </div>
                  <div>
                    {+status[item.inventoryId] ? ((status[item.inventoryId] / total) * 100).toFixed(2) + '%' : ''}
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
              <div>{Format.percent(predictedList.colloid)}</div>
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
          onChange={handleChangeGoodsType}>
          {GoodsType.map(({ id, goodsName }) => (
            <Select.Option value={id} key={id}>
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
