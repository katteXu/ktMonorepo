import { Input, Button, Form, Radio, Select } from 'antd';
import { useState, useEffect, useCallback } from 'react';
import styles from './styles.less';

const RawForm = ({ onRemove, name, index, rawGoods = [], form }) => {
  // 移除
  const handleRemove = name => {
    onRemove && onRemove();
    // 删除
    const formData = form.getFieldsValue();
    formData[name] = null;
    form.setFieldsValue({ ...formData });
  };

  const handleChangeRawGoods = (id, name) => {
    const item = rawGoods.find(item => item.inventoryId === id);

    if (!item) {
      const formData = form.getFieldsValue();
      formData[name] = null;
      form.setFieldsValue({ ...formData });
      return;
    }
    const params = {
      [name]: {
        ashContent: item.ashContent && (item.ashContent / 100).toFixed(2),
        bond: item.bond && (item.bond / 100).toFixed(2),
        carbon: item.carbon && (item.carbon / 100).toFixed(2),
        cinder: item.cinder && (item.cinder / 100).toFixed(0),
        cleanCoal: item.cleanCoal && (item.cleanCoal / 100).toFixed(2),
        colloid: item.colloid && (item.colloid / 100).toFixed(2),
        goodsName: item.goodsName,
        company: item.company,
        midCoal: item.midCoal && (item.midCoal / 100).toFixed(2),
        recovery: item.recovery && (item.recovery / 100).toFixed(2),
        stone: item.stone && (item.stone / 100).toFixed(2),
        sulfur: item.sulfur && (item.sulfur / 100).toFixed(2),
        totalWaterContent: item.totalWaterContent && (item.totalWaterContent / 100).toFixed(2),
        unitPrice: item.unitPrice && (item.unitPrice / 100).toFixed(2),
        volatilization: item.volatilization && (item.volatilization / 100).toFixed(2),
        warningValue: item.warningValue && (item.warningValue / 100).toFixed(2),
        waterContent: item.waterContent && (item.waterContent / 100).toFixed(2),
      },
    };

    form.setFieldsValue(params);
  };

  return (
    <>
      <div className={styles.title}>
        原料煤{index + 1}
        {name > 2 && (
          <Button type="link" size="small" onClick={() => handleRemove(name)} className={styles['btn-remove']}>
            移除
          </Button>
        )}
      </div>
      <div className={styles.row}>
        <div className={styles.col}>
          <Form.Item
            label="原料煤名称"
            name={[name, 'inventoryId']}
            validateFirst={true}
            rules={[{ required: true, message: '内容不可为空' }]}>
            <Select
              allowClear
              placeholder="请选择原料煤名称"
              onChange={value => handleChangeRawGoods(value, name)}
              style={{ marginLeft: 8 }}>
              {rawGoods.map(v => (
                <Select.Option key={v.inventoryId} value={v.inventoryId}>
                  {v.goodsName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        <div className={styles.col}>
          <Form.Item
            label="占比(%)"
            name={[name, 'proportion']}
            validateFirst={true}
            rules={[
              {
                required: true,
                message: '占比不可为空',
              },
              {
                whitespace: true,
                type: 'number',
                transform: value => Number(value) || 0,
                max: 100,
                message: '占比不可超过100',
              },
              {
                pattern: /^[0-9]+(.?[0-9]{1,2})?$/,
                message: '最多输入两位小数',
              },
            ]}>
            <Input style={{ marginLeft: 8 }} placeholder="请输入占比" />
          </Form.Item>
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.col}>
          <Form.Item
            label="成本单价(元/吨)"
            name={[name, 'unitPrice']}
            validateFirst={true}
            rules={[
              { required: true, message: '成本单价不可为空' },
              { pattern: /^([1-9][0-9]*(\.\d*)?)|(0\.\d*)$/, message: '内容必须是数字且大于0' },
              { pattern: /^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/, message: '最多输入2位小数' },
            ]}>
            <Input style={{ marginLeft: 8 }} placeholder="请输入成本单价" />
          </Form.Item>
        </div>
        <div className={styles.col}></div>
      </div>

      <div className={styles.row}>
        {/* 水分 */}
        <div className={styles.col}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>水分(% Mad)
              </div>
            }
            // label="水分(% Mad)"
            name={[name, 'waterContent']}
            validateFirst={true}
            rules={[
              {
                pattern: /^[0-9]+(.?[0-9]{1,2})?$/,
                message: '最多输入两位小数',
              },
              {
                whitespace: true,
                type: 'number',
                transform: value => Number(value) || 0,
                max: 100,
                message: '内容不可超过100',
              },
            ]}>
            <Input style={{ marginLeft: 8 }} placeholder="请输入" />
          </Form.Item>
        </div>
        {/* 灰分 */}
        <div className={styles.col}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>灰分(% Ad)
              </div>
            }
            // label="灰分(% Ad)"
            name={[name, 'ashContent']}
            validateFirst={true}
            rules={[
              {
                pattern: /^[0-9]+(.?[0-9]{1,2})?$/,
                message: '最多输入两位小数',
              },
              {
                whitespace: true,
                type: 'number',
                transform: value => Number(value) || 0,
                max: 100,
                message: '内容不可超过100',
              },
            ]}>
            <Input style={{ marginLeft: 8 }} placeholder="请输入" />
          </Form.Item>
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.col}>
          {/* 挥发 */}
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>挥发(% Vdaf)
              </div>
            }
            // label="挥发(% Vdaf)"
            name={[name, 'volatilization']}
            validateFirst={true}
            rules={[
              {
                pattern: /^[0-9]+(.?[0-9]{1,2})?$/,
                message: '最多输入两位小数',
              },
              {
                whitespace: true,
                type: 'number',
                transform: value => Number(value) || 0,
                max: 100,
                message: '内容不可超过100',
              },
            ]}>
            <Input style={{ marginLeft: 8 }} placeholder="请输入" />
          </Form.Item>
        </div>
        {/* 焦渣特征 */}
        <div className={styles.col}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>焦渣特征(1-8
                CRC)
              </div>
            }
            // label="焦渣特征(1-8 CRC)"
            name={[name, 'cinder']}
            rules={[
              {
                pattern: /^[0-8]\d*$/,
                message: '请输入正确的数值:1-8',
              },
              {
                whitespace: true,
                type: 'number',
                transform: value => Number(value) || 0,
                max: 8,
                message: '请输入正确的数值:1-8',
              },
            ]}>
            <Input style={{ marginLeft: 8 }} placeholder="请输入" />
          </Form.Item>
        </div>
      </div>
      <div className={styles.row}>
        {/* 全硫 */}
        <div className={styles.col}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>全硫(% Std)
              </div>
            }
            // label="全硫(% Std)"
            name={[name, 'sulfur']}
            validateFirst={true}
            rules={[
              {
                pattern: /^[0-9]+(.?[0-9]{1,2})?$/,
                message: '最多输入两位小数',
              },
              {
                whitespace: true,
                type: 'number',
                transform: value => Number(value) || 0,
                max: 100,
                message: '内容不可超过100',
              },
            ]}>
            <Input style={{ marginLeft: 8 }} placeholder="请输入" />
          </Form.Item>
        </div>
        {/* 固定碳 */}
        <div className={styles.col}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>固定碳(% Fcd)
              </div>
            }
            // label="固定碳(% Fcd)"
            name={[name, 'carbon']}
            validateFirst={true}
            rules={[
              {
                pattern: /^[0-9]+(.?[0-9]{1,2})?$/,
                message: '最多输入两位小数',
              },
              {
                whitespace: true,
                type: 'number',
                transform: value => Number(value) || 0,
                max: 100,
                message: '内容不可超过100',
              },
            ]}>
            <Input style={{ marginLeft: 8 }} placeholder="请输入" />
          </Form.Item>
        </div>
      </div>
      {/* 回收 */}
      <div className={styles.row}>
        <div className={styles.col}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>回收(% r)
              </div>
            }
            // label="回收(% r)"
            name={[name, 'recovery']}
            validateFirst={true}
            rules={[
              {
                pattern: /^[0-9]+(.?[0-9]{1,2})?$/,
                message: '最多输入两位小数',
              },
              {
                whitespace: true,
                type: 'number',
                transform: value => Number(value) || 0,
                max: 100,
                message: '内容不可超过100',
              },
            ]}>
            <Input style={{ marginLeft: 8 }} placeholder="请输入" />
          </Form.Item>
        </div>
        {/* 全水分 */}
        <div className={styles.col}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>全水分(% Mt)
              </div>
            }
            // label="全水分(% Mt)"
            name={[name, 'totalWaterContent']}
            validateFirst={true}
            rules={[
              {
                pattern: /^[0-9]+(.?[0-9]{1,2})?$/,
                message: '最多输入两位小数',
              },
              {
                whitespace: true,
                type: 'number',
                transform: value => Number(value) || 0,
                max: 100,
                message: '内容不可超过100',
              },
            ]}>
            <Input style={{ marginLeft: 8 }} placeholder="请输入" />
          </Form.Item>
        </div>
      </div>
      <div className={styles.row}>
        {/* 粘结指数 */}
        <div className={styles.col}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>粘结指数(GRI)
              </div>
            }
            // label="粘结指数(GRI)"
            name={[name, 'bond']}
            validateFirst={true}
            rules={[
              {
                pattern: /^[0-9]+(.?[0-9]{1,2})?$/,
                message: '最多输入两位小数',
              },
              {
                whitespace: true,
                type: 'number',
                transform: value => Number(value) || 0,
                max: 100,
                message: '内容不可超过100',
              },
            ]}>
            <Input style={{ marginLeft: 8 }} placeholder="请输入" />
          </Form.Item>
        </div>
        {/* 胶质层 */}
        <div className={styles.col}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>胶质层(Y)
              </div>
            }
            // label="胶质层(Y)"
            name={[name, 'colloid']}
            validateFirst={true}
            rules={[
              {
                pattern: /^[0-9]+(.?[0-9]{1,2})?$/,
                message: '最多输入两位小数',
              },
              {
                whitespace: true,
                type: 'number',
                transform: value => Number(value) || 0,
                max: 100,
                message: '内容不可超过100',
              },
            ]}>
            <Input style={{ marginLeft: 8 }} placeholder="请输入" />
          </Form.Item>
        </div>
      </div>
      <div className={styles.row}>
        {/* 含矸石 */}
        <div className={styles.col}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>含矸石(%)
              </div>
            }
            // label="含矸石(%)"
            name={[name, 'stone']}
            validateFirst={true}
            rules={[
              {
                pattern: /^[0-9]+(.?[0-9]{1,2})?$/,
                message: '最多输入两位小数',
              },
              {
                whitespace: true,
                type: 'number',
                transform: value => Number(value) || 0,
                max: 100,
                message: '内容不可超过100',
              },
            ]}>
            <Input style={{ marginLeft: 8 }} placeholder="请输入" />
          </Form.Item>
        </div>
        {/* 含中煤 */}
        <div className={styles.col}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>含中煤(%)
              </div>
            }
            // label="含中煤(%)"
            name={[name, 'midCoal']}
            validateFirst={true}
            rules={[
              {
                pattern: /^[0-9]+(.?[0-9]{1,2})?$/,
                message: '最多输入两位小数',
              },
              {
                whitespace: true,
                type: 'number',
                transform: value => Number(value) || 0,
                max: 100,
                message: '内容不可超过100',
              },
            ]}>
            <Input style={{ marginLeft: 8 }} placeholder="请输入" />
          </Form.Item>
        </div>
      </div>
      <div className={styles.row}>
        {/* 含精煤 */}
        <div className={styles.col}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>含精煤(%)
              </div>
            }
            // label="含精煤(%)"
            name={[name, 'cleanCoal']}
            validateFirst={true}
            rules={[
              {
                pattern: /^[0-9]+(.?[0-9]{1,2})?$/,
                message: '最多输入两位小数',
              },
              {
                whitespace: true,
                type: 'number',
                transform: value => Number(value) || 0,
                max: 100,
                message: '内容不可超过100',
              },
            ]}>
            <Input style={{ marginLeft: 8 }} placeholder="请输入" />
          </Form.Item>
        </div>
        <div className={styles.col}></div>
      </div>
      <Form.Item style={{ display: 'none' }} name={[name, 'goodsName']}>
        <Input style={{ marginLeft: 8 }}></Input>
      </Form.Item>
      <Form.Item style={{ display: 'none' }} name={[name, 'companyName']}>
        <Input style={{ marginLeft: 8 }}></Input>
      </Form.Item>
    </>
  );
};

export default RawForm;
