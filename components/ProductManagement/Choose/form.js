// 表单
import React, { useState, useRef } from 'react';
import { Input, Button, message } from 'antd';
import StandardForm from './standar_form';
import { Content, ChildTitle } from '@components';
import { product } from '@api';
import styles from './styles.less';
import { Format } from '@utils/common';

const FormComponent = ({ handleToStep, dataSource, handleDataInfo, changeLoading }) => {
  const formRef = useRef();

  const [list, setList] = useState(dataSource);
  // 目标货品
  const [targetGood, setTargetGood] = useState({});

  // 下一步执行表单提交
  const handleSubmit = async () => {
    // 表单数据
    const data = await formRef.current.submit();
    if (!data) {
      return;
    }
    changeLoading(true);
    // 原料煤配比设置
    if (list.length > 0) {
      const msg = validateList();
      if (msg) {
        message.error(msg);
        return;
      }
    }

    // 目标数据
    const targetGoods = {
      ...targetGood,
      unitPrice: data.unitPrice ? (data.unitPrice * 100).toFixed(0) * 1 : 0,
      waterContentMin: data.standard_mad.min ? (data.standard_mad.min * 100).toFixed(0) * 1 : 0,
      waterContentMax: data.standard_mad.max ? (data.standard_mad.max * 100).toFixed(0) * 1 : 0,
      ashContentMin: data.standard_ad.min ? (data.standard_ad.min * 100).toFixed(0) * 1 : 0,
      ashContentMax: data.standard_ad.max ? (data.standard_ad.max * 100).toFixed(0) * 1 : 0,
      volatilizationMin: data.standard_vdaf.min ? (data.standard_vdaf.min * 100).toFixed(0) * 1 : 0,
      volatilizationMax: data.standard_vdaf.max ? (data.standard_vdaf.max * 100).toFixed(0) * 1 : 0,
      cinder: data.standard_crc ? (data.standard_crc * 100).toFixed(0) * 1 : 0,
      sulfurMin: data.standard_std.min ? (data.standard_std.min * 100).toFixed(0) * 1 : 0,
      sulfurMax: data.standard_std.max ? (data.standard_std.max * 100).toFixed(0) * 1 : 0,
      carbonMin: data.standard_fcd.min ? (data.standard_fcd.min * 100).toFixed(0) * 1 : 0,
      carbonMax: data.standard_fcd.max ? (data.standard_fcd.max * 100).toFixed(0) * 1 : 0,
      recoveryMin: data.standard_r.min ? (data.standard_r.min * 100).toFixed(0) * 1 : 0,
      recoveryMax: data.standard_r.max ? (data.standard_r.max * 100).toFixed(0) * 1 : 0,
      totalWaterContentMin: data.standard_mt.min ? (data.standard_mt.min * 100).toFixed(0) * 1 : 0,
      totalWaterContentMax: data.standard_mt.max ? (data.standard_mt.max * 100).toFixed(0) * 1 : 0,
      bondMin: data.standard_gri.min ? (data.standard_gri.min * 100).toFixed(0) * 1 : 0,
      bondMax: data.standard_gri.max ? (data.standard_gri.max * 100).toFixed(0) * 1 : 0,
      colloidMin: data.standard_y.min ? (data.standard_y.min * 100).toFixed(0) * 1 : 0,
      colloidMax: data.standard_y.max ? (data.standard_y.max * 100).toFixed(0) * 1 : 0,
      stoneMin: data.standard_gangue.min ? (data.standard_gangue.min * 100).toFixed(0) * 1 : 0,
      stoneMax: data.standard_gangue.max ? (data.standard_gangue.max * 100).toFixed(0) * 1 : 0,
      midCoalMin: data.standard_middle.min ? (data.standard_middle.min * 100).toFixed(0) * 1 : 0,
      midCoalMax: data.standard_middle.max ? (data.standard_middle.max * 100).toFixed(0) * 1 : 0,
      cleanCoalMin: data.standard_coal.min ? (data.standard_coal.min * 100).toFixed(0) * 1 : 0,
      cleanCoalMax: data.standard_coal.max ? (data.standard_coal.max * 100).toFixed(0) * 1 : 0,
    };

    const params = {
      rawMaterial:
        list.length > 0
          ? list.map(item => ({
              ...item,
              proportionMax: ((item.proportionMax ? item.proportionMax : 100) * 100).toFixed(0) * 1,
              proportionMin: ((item.proportionMin ? item.proportionMin : 0) * 100).toFixed(0) * 1,
            }))
          : [],
      targetGoods,
    };
    const res = await product.submitCoalBlending({ params });

    if (res.status === 0) {
      // message.success('配煤完成');
      handleToStep(4);
      handleDataInfo(res.result);
    } else {
      changeLoading(false);
      message.error(res.detail || res.description);
    }
  };

  // 目标货品选择
  const handleChangeGoods = value => {
    setTargetGood(value);
    if (value) {
      handleToStep(3);
    } else {
      handleToStep(2);
    }
  };

  // 设置最小
  const handleChangeMin = (inventoryId, value) => {
    const row = list.find(r => r.inventoryId === inventoryId);
    row.proportionMin = value;
    setList([...list]);
  };

  // 设置最大
  const handleChangeMiax = (inventoryId, value) => {
    const row = list.find(r => r.inventoryId === inventoryId);
    row.proportionMax = value;
    setList([...list]);
  };

  const handleRemove = inventoryId => {
    if (list.length === 2) {
      message.warn('移除失败，至少保留两种原料煤');
      return;
    }
    const _list = list.filter(r => r.inventoryId !== inventoryId);
    setList([..._list]);
  };

  // 校验原料配比设置列表
  const validateList = () => {
    for (let i = 0; i < list.length; i++) {
      const { proportionMin, proportionMax, goodsName } = list[i];
      if (proportionMin && proportionMax) {
        // 最小占比
        if (proportionMin > 100 || proportionMin < 0) {
          return `${goodsName} 最小占比应为0-100`;
        }

        // 最大占比
        if (proportionMax > 100 || proportionMax < 0) {
          return `${goodsName} 最大占比应为0-100`;
        }

        if (+proportionMin < +proportionMax) {
        } else {
          return `${goodsName} 最小占比应小于最大占比`;
        }
      }
    }
  };
  console.log(list);
  return (
    <Content style={{ marginTop: 16 }}>
      <header>原料煤配比设置</header>
      <section style={{ paddingBottom: 48 }}>
        <div className={styles.form}>
          {list.length > 0 ? (
            <table className={styles.table}>
              <tr className={styles.header}>
                <td>已选原料煤</td>
                <td>当前库存(吨)</td>
                <td>最小占比(%)</td>
                <td>最大占比(%)</td>
                <td style={{ textAlign: 'right' }}>操作</td>
              </tr>
              {list.map(item => {
                return (
                  <tr className={styles['data-row']} key={item.goodsName}>
                    <td>{item.goodsName}</td>
                    <td>{Format.weight(item.inventoryValue)}</td>
                    <td>
                      <Input
                        value={item.proportionMin}
                        placeholder="请输入最小占比"
                        className={styles.ipt}
                        onChange={e => handleChangeMin(item.inventoryId, e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        value={item.proportionMax}
                        placeholder="请输入最大占比"
                        className={styles.ipt}
                        onChange={e => handleChangeMiax(item.inventoryId, e.target.value)}
                      />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Button type="link" size="small" danger onClick={() => handleRemove(item.inventoryId)}>
                        移除
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </table>
          ) : (
            <div className={styles.allData}>未勾选原料煤，则按平台中现有货品集输出最优配比方案</div>
          )}

          {/* <header style={{ marginTop: 12, border: 0, paddingLeft: 0, fontSize: 14 }}> */}
          <ChildTitle className="hei14" style={{ fontSize: 14, marginTop: 24, marginBottom: 8, fontWeight: 'bold' }}>
            配煤指标
          </ChildTitle>
          {/* </header> */}

          <StandardForm onChangeGoods={handleChangeGoods} ref={formRef} />
          <div className={styles.bottom}>
            <Button onClick={() => handleToStep(1)}>上一步</Button>
            <Button style={{ marginLeft: 8 }} type="primary" onClick={handleSubmit}>
              下一步
            </Button>
          </div>
        </div>
      </section>
    </Content>
  );
};

export default FormComponent;
