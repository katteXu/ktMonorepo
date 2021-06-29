import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Input, Form, Select, message } from 'antd';
import { product } from '@api';
import styles from './styles.less';
const formItemLayout = {
  labelAlign: 'left',
};
const FormCompnent = ({ formData, onSubmit, onChangeGoods }, ref) => {
  const [form] = Form.useForm();
  const [GoodsType, setGoodsType] = useState([]);

  useEffect(() => {
    initGoodsType();
  }, []);
  // 目标货品
  const handleChangeGoodsType = value => {
    setGoodsDetail(value);
    const targetGood = GoodsType.find(item => item.id === value);
    onChangeGoods && onChangeGoods(targetGood);
  };

  // 绑定详情信息
  const setGoodsDetail = async id => {
    // 先重置表单
    form.resetFields();
    if (!id) {
      return;
    }

    const params = { id };
    const res = await product.getGoodsDetail({ params });
    if (res.status === 0) {
      const { goodsComponent } = res.result;
      const formData = {
        goodsName: id,
        unitPrice: goodsComponent.unitPrice ? (goodsComponent.unitPrice / 100).toFixed(2) : '',
        standard_mad: {
          min: goodsComponent.waterContentMin && (goodsComponent.waterContentMin / 100).toFixed(2),
          max: goodsComponent.waterContentMax && (goodsComponent.waterContentMax / 100).toFixed(2),
        },
        standard_ad: {
          min: goodsComponent.ashContentMin && (goodsComponent.ashContentMin / 100).toFixed(2),
          max: goodsComponent.ashContentMax && (goodsComponent.ashContentMax / 100).toFixed(2),
        },
        standard_vdaf: {
          min: goodsComponent.volatilizationMin && (goodsComponent.volatilizationMin / 100).toFixed(2),
          max: goodsComponent.volatilizationMax && (goodsComponent.volatilizationMax / 100).toFixed(2),
        },
        standard_crc: goodsComponent.cinder && (goodsComponent.cinder / 100).toFixed(0),
        standard_std: {
          min: goodsComponent.sulfurMin && (goodsComponent.sulfurMin / 100).toFixed(2),
          max: goodsComponent.sulfurMax && (goodsComponent.sulfurMax / 100).toFixed(2),
        },
        standard_fcd: {
          min: goodsComponent.carbonMin && (goodsComponent.carbonMin / 100).toFixed(2),
          max: goodsComponent.carbonMax && (goodsComponent.carbonMax / 100).toFixed(2),
        },
        standard_r: {
          min: goodsComponent.recoveryMin && (goodsComponent.recoveryMin / 100).toFixed(2),
          max: goodsComponent.recoveryMax && (goodsComponent.recoveryMax / 100).toFixed(2),
        },
        standard_mt: {
          min: goodsComponent.totalWaterContentMin && (goodsComponent.totalWaterContentMin / 100).toFixed(2),
          max: goodsComponent.totalWaterContentMax && (goodsComponent.totalWaterContentMax / 100).toFixed(2),
        },
        standard_gri: {
          min: goodsComponent.bondMin && (goodsComponent.bondMin / 100).toFixed(2),
          max: goodsComponent.bondMax && (goodsComponent.bondMax / 100).toFixed(2),
        },
        standard_y: {
          min: goodsComponent.colloidMin && (goodsComponent.colloidMin / 100).toFixed(2),
          max: goodsComponent.colloidMax && (goodsComponent.colloidMax / 100).toFixed(2),
        },
        standard_gangue: {
          min: goodsComponent.stoneMin && (goodsComponent.stoneMin / 100).toFixed(2),
          max: goodsComponent.stoneMax && (goodsComponent.stoneMax / 100).toFixed(2),
        },
        standard_middle: {
          min: goodsComponent.midCoalMin && (goodsComponent.midCoalMin / 100).toFixed(2),
          max: goodsComponent.midCoalMax && (goodsComponent.midCoalMax / 100).toFixed(2),
        },
        standard_coal: {
          min: goodsComponent.cleanCoalMin && (goodsComponent.cleanCoalMin / 100).toFixed(2),
          max: goodsComponent.cleanCoalMax && (goodsComponent.cleanCoalMax / 100).toFixed(2),
        },
      };

      form.setFieldsValue(formData);
    } else {
      message.error(res.detail || res.description);
    }
  };

  const initGoodsType = async () => {
    const params = {
      coalBlend: 1,
    };
    const res = await product.getGoodsList({ params });
    if (res.status === 0) {
      setGoodsType(res.result);
    }
  };

  // 小值验证
  const validateMin = name => {
    const min_field = [`standard_${name}`, 'min'];
    const max_field = [`standard_${name}`, 'max'];
    const field = form.getFieldsValue([min_field, max_field]);
    const { max, min } = field[`standard_${name}`];
    if (min && max) {
      if (+min > +max) {
        return Promise.reject('数字大小位置有误');
      }
    }
    return Promise.resolve();
  };

  // 触发小值验证
  const validateMax = name => {
    return Promise.resolve();
  };

  useImperativeHandle(ref, () => ({
    submit: async () => {
      try {
        const res = await form.validateFields();
        return res;
      } catch (error) {
        console.log('错误信息', error);
      }
    },
  }));

  return (
    <Form {...formItemLayout} className={styles.form} autoComplete="off" layout="inline" form={form}>
      <div className={styles.row} style={{ marginTop: 24 }}>
        <div className={styles.col}>
          <Form.Item
            label="目标货品"
            style={{ width: 403 }}
            name="goodsName"
            rules={[{ required: true, message: '目标货品不可为空' }]}>
            <Select
              style={{ width: 200 }}
              allowClear
              placeholder="请选择目标货品"
              className={styles.ipt}
              optionFilterProp="children"
              showSearch
              onChange={handleChangeGoodsType}>
              {GoodsType.map(({ id, goodsName }) => (
                <Select.Option value={id} key={id}>
                  {goodsName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </div>
        <div className={styles.col}>
          <Form.Item
            label="成本单价"
            name="unitPrice"
            validateFirst={true}
            rules={[
              { required: true, message: '内容不可为空' },
              {
                pattern: /^(-?\d+)(\.\d{1,2})?$/,
                message: '内容不可为负数且不可超过2位小数',
              },
              {
                pattern: /^(0|[1-9][0-9]*)(\.\d+)?$/,
                message: '内容不可为负数且不可超过2位小数',
              },
            ]}>
            <Input style={{ width: 200 }} className={styles.ipt} placeholder="请输入成本单价" addonAfter={'元/吨'} />
          </Form.Item>
        </div>
      </div>

      <div className={styles.row}>
        {/* 水分 */}
        <div className={`${styles.col} ${styles['db-input']}`}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>水分(% Mad)
              </div>
            }
            name={['standard_mad', 'min']}
            validateFirst={true}
            rules={[
              { required: false, message: '内容不可为空' },
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
              {
                validator: () => validateMin('mad'),
              },
            ]}>
            <Input placeholder="请输入" />
          </Form.Item>
          <span>≤Mad≤</span>
          <Form.Item
            label=""
            colon={false}
            name={['standard_mad', 'max']}
            validateFirst={true}
            rules={[
              { required: false, message: '内容不可为空' },
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
              {
                validator: () => validateMax('mad'),
              },
            ]}>
            <Input placeholder="请输入" />
          </Form.Item>
        </div>
        {/* 灰分 */}
        <div className={`${styles.col} ${styles['db-input']}`}>
          <Form.Item
            label="灰分(% Ad)"
            name={['standard_ad', 'min']}
            validateFirst={true}
            rules={[
              { required: true, message: '内容不可为空' },
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
              {
                validator: () => validateMin('ad'),
              },
            ]}>
            <Input placeholder="请输入" />
          </Form.Item>
          <span>≤Ad≤</span>
          <Form.Item
            label=""
            colon={false}
            name={['standard_ad', 'max']}
            validateFirst={true}
            rules={[
              { required: true, message: '内容不可为空' },
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
              {
                validator: () => validateMax('ad'),
              },
            ]}>
            <Input placeholder="请输入" />
          </Form.Item>
        </div>
      </div>

      <div className={styles.row}>
        <div className={`${styles.col} ${styles['db-input']}`}>
          {/* 挥发 */}
          <Form.Item
            label="挥发(% Vdaf)"
            name={['standard_vdaf', 'min']}
            validateFirst={true}
            rules={[
              { required: true, message: '内容不可为空' },
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
              {
                validator: () => validateMin('vdaf'),
              },
            ]}>
            <Input placeholder="请输入" />
          </Form.Item>
          <span>≤Vdaf≤</span>
          <Form.Item
            label=""
            colon={false}
            name={['standard_vdaf', 'max']}
            validateFirst={true}
            rules={[
              { required: true, message: '内容不可为空' },
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
              {
                validator: () => validateMax('vdaf'),
              },
            ]}>
            <Input placeholder="请输入" />
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
            name="standard_crc"
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
            <Input style={{ width: 96 }} className={styles.ipt} placeholder="请输入" />
          </Form.Item>
        </div>
      </div>
      <div className={styles.row}>
        {/* 全硫 */}
        <div className={`${styles.col} ${styles['db-input']}`}>
          <Form.Item
            label="全硫(% Std)"
            name={['standard_std', 'min']}
            validateFirst={true}
            rules={[
              { required: true, message: '内容不可为空' },
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
              {
                validator: () => validateMin('std'),
              },
            ]}>
            <Input placeholder="请输入" />
          </Form.Item>
          <span>≤Std≤</span>
          <Form.Item
            label=""
            colon={false}
            name={['standard_std', 'max']}
            validateFirst={true}
            rules={[
              { required: true, message: '内容不可为空' },
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
              {
                validator: () => validateMax('std'),
              },
            ]}>
            <Input placeholder="请输入" />
          </Form.Item>
        </div>
        {/* 固定碳 */}
        <div className={`${styles.col} ${styles['db-input']}`}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>固定碳(% Fcd)
              </div>
            }
            name={['standard_fcd', 'min']}
            validateFirst={true}
            rules={[
              { required: false, message: '内容不可为空' },
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
              {
                validator: () => validateMin('fcd'),
              },
            ]}>
            <Input placeholder="请输入" />
          </Form.Item>
          <span>≤Fcd≤</span>
          <Form.Item
            label=""
            colon={false}
            name={['standard_fcd', 'max']}
            validateFirst={true}
            rules={[
              { required: false, message: '内容不可为空' },
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
              {
                validator: () => validateMax('fcd'),
              },
            ]}>
            <Input placeholder="请输入" />
          </Form.Item>
        </div>
      </div>
      <div className={styles.row}>
        {/* 回收 */}
        <div className={`${styles.col} ${styles['db-input']}`}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>回收(% r)
              </div>
            }
            // label="回收(% r)"
            name={['standard_r', 'min']}
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
              {
                validator: () => validateMin('r'),
              },
            ]}>
            <Input placeholder="请输入" />
          </Form.Item>
          <span>≤r≤</span>
          <Form.Item
            label=""
            colon={false}
            name={['standard_r', 'max']}
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
              {
                validator: () => validateMax('r'),
              },
            ]}>
            <Input placeholder="请输入" />
          </Form.Item>
        </div>
        {/* 全水分 */}
        <div className={`${styles.col} ${styles['db-input']}`}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>全水分(% Mt)
              </div>
            }
            // label="全水分(% Mt)"
            name={['standard_mt', 'min']}
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
              {
                validator: () => validateMin('mt'),
              },
            ]}>
            <Input placeholder="请输入" />
          </Form.Item>
          <span>≤Mt≤</span>
          <Form.Item
            label=""
            colon={false}
            name={['standard_mt', 'max']}
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
              {
                validator: () => validateMax('mt'),
              },
            ]}>
            <Input placeholder="请输入" />
          </Form.Item>
        </div>
      </div>
      <div className={styles.row}>
        {/* 粘结指数 */}
        <div className={`${styles.col} ${styles['db-input']}`}>
          <Form.Item
            label="粘结指数(GRI)"
            name={['standard_gri', 'min']}
            validateFirst={true}
            rules={[
              { required: true, message: '内容不可为空' },
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
              {
                validator: () => validateMin('gri'),
              },
            ]}>
            <Input placeholder="请输入" />
          </Form.Item>
          <span>≤GRI≤</span>
          <Form.Item
            label=""
            colon={false}
            name={['standard_gri', 'max']}
            validateFirst={true}
            rules={[
              { required: true, message: '内容不可为空' },
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
              {
                validator: () => validateMax('gri'),
              },
            ]}>
            <Input placeholder="请输入" />
          </Form.Item>
        </div>
        {/* 胶质层 */}
        <div className={`${styles.col} ${styles['db-input']}`}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>胶质层(Y)
              </div>
            }
            // label="胶质层(Y)"
            name={['standard_y', 'min']}
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
              {
                validator: () => validateMin('y'),
              },
            ]}>
            <Input placeholder="请输入" />
          </Form.Item>
          <span>≤Y≤</span>
          <Form.Item
            label=""
            colon={false}
            name={['standard_y', 'max']}
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
              {
                validator: () => validateMax('y'),
              },
            ]}>
            <Input placeholder="请输入" />
          </Form.Item>
        </div>
      </div>
      <div className={styles.row}>
        {/* 含矸石 */}
        <div className={`${styles.col} ${styles['db-input']}`}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>含矸石(%)
              </div>
            }
            // label="含矸石(%)"
            name={['standard_gangue', 'min']}
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
              {
                validator: () => validateMin('gangue'),
              },
            ]}>
            <Input placeholder="请输入" />
          </Form.Item>
          <span>≤%≤</span>
          <Form.Item
            label=""
            colon={false}
            name={['standard_gangue', 'max']}
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
              {
                validator: () => validateMax('gangue'),
              },
            ]}>
            <Input placeholder="请输入" />
          </Form.Item>
        </div>
        {/* 含中煤 */}
        <div className={`${styles.col} ${styles['db-input']}`}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>含中煤(%)
              </div>
            }
            // label="含中煤(%)"
            name={['standard_middle', 'min']}
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
              {
                validator: () => validateMin('middle'),
              },
            ]}>
            <Input placeholder="请输入" />
          </Form.Item>
          <span>≤%≤</span>
          <Form.Item
            label=""
            colon={false}
            name={['standard_middle', 'max']}
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
              {
                validator: () => validateMax('middle'),
              },
            ]}>
            <Input placeholder="请输入" />
          </Form.Item>
        </div>
      </div>
      <div className={styles.row}>
        {/* 含精煤 */}
        <div className={`${styles.col} ${styles['db-input']}`}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>含精煤(%)
              </div>
            }
            // label="含精煤(%)"
            name={['standard_coal', 'min']}
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
              {
                validator: () => validateMin('coal'),
              },
            ]}>
            <Input placeholder="请输入" />
          </Form.Item>
          <span>≤%≤</span>
          <Form.Item
            label=""
            colon={false}
            name={['standard_coal', 'max']}
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
              {
                validator: () => validateMax('coal'),
              },
            ]}>
            <Input placeholder="请输入" />
          </Form.Item>
        </div>
        <div className={`${styles.col} ${styles['db-input']}`}></div>
      </div>
    </Form>
  );
};

export default forwardRef(FormCompnent);
