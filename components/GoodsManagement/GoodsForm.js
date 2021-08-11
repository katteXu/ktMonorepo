import { Input, Button, Form, Radio, Select } from 'antd';
import { useState, useEffect, useCallback } from 'react';
import styles from './goodsForm.less';
import { getGoodsType, getCommon } from '@api';
import { ChildTitle, AutoInputSelect } from '@components';
import { User } from '@store';
// 表单布局
const formItemLayout = {
  labelAlign: 'left',
};

const GoodsForm = ({ formData = {}, onSubmit, onClose }) => {
  const { userInfo, loading: userLoading } = User.useContainer();
  const [form] = Form.useForm();
  const [GoodsType, setGoodsType] = useState([]);
  const [isShowWarehouse, setIsShowWarehouse] = useState(false);
  const [radioRawMaterial, setRadioRawMaterial] = useState();
  const [fromCompany, setFromCompany] = useState({});
  const [newCompany, setNewCompany] = useState(false);
  useEffect(() => {
    initGoodsType();
  }, []);

  useEffect(() => {
    if (!userLoading) {
      setHiddenDate();
    }
  }, [userLoading]);

  const setHiddenDate = async () => {
    const res = await getCommon();
    if (res.status === 0) {
      const currentUserName = userInfo.username;

      const hiddenWarehouseName = res.result.find(item => item.key === 'isShowSupplier').url;
      console.log(currentUserName);
      if (hiddenWarehouseName.includes(currentUserName)) {
        setIsShowWarehouse(true);
      }
    }
  };

  const [loading, setLoading] = useState(false);
  // 提交数据
  const handleSubmit = async values => {
    setLoading(true);
    console.log(values);
    onSubmit && onSubmit({ ...values, id: formData.id, addressCompanyId: fromCompany.id });
    setLoading(false);
  };

  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
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
    form.validateFields([[`standard_${name}`, 'min']], { force: true });
    return Promise.resolve();
  };

  // 初始化货物类型
  const initGoodsType = async () => {
    const res = await getGoodsType();
    if (res.status === 0) {
      setGoodsType(res.result);
    }
  };

  useEffect(() => {
    if (formData.id) {
      form.setFieldsValue({
        id: formData.id,
        goodsType: formData.goodsType,
        goodsName: formData.goodsName,
        rawMaterial: formData.rawMaterial,
        unitPrice: formData.unitPrice,

        standard_mad: {
          min: formData.waterContentMin && formData.waterContentMin / 100,
          max: formData.waterContentMax && formData.waterContentMax / 100,
        },
        standard_ad: {
          min: formData.ashContentMin && formData.ashContentMin / 100,
          max: formData.ashContentMax && formData.ashContentMax / 100,
        },
        standard_vdaf: {
          min: formData.volatilizationMin && formData.volatilizationMin / 100,
          max: formData.volatilizationMax && formData.volatilizationMax / 100,
        },
        standard_crc: formData.cinder && formData.cinder / 100,
        standard_std: {
          min: formData.sulfurMin && formData.sulfurMin / 100,
          max: formData.sulfurMax && formData.sulfurMax / 100,
        },
        standard_fcd: {
          min: formData.carbonMin && formData.carbonMin / 100,
          max: formData.carbonMax && formData.carbonMax / 100,
        },
        standard_r: {
          min: formData.recoveryMin && formData.recoveryMin / 100,
          max: formData.recoveryMax && formData.recoveryMax / 100,
        },
        standard_mt: {
          min: formData.totalWaterContentMin && formData.totalWaterContentMin / 100,
          max: formData.totalWaterContentMax && formData.totalWaterContentMax / 100,
        },
        standard_gri: {
          min: formData.bondMin && formData.bondMin / 100,
          max: formData.bondMax && formData.bondMax / 100,
        },
        standard_y: {
          min: formData.colloidMin && formData.colloidMin / 100,
          max: formData.colloidMax && formData.colloidMax / 100,
        },
        standard_gangue: {
          min: formData.stoneMin && formData.stoneMin / 100,
          max: formData.stoneMax && formData.stoneMax / 100,
        },
        standard_middle: {
          min: formData.midCoalMin && formData.midCoalMin / 100,
          max: formData.midCoalMax && formData.midCoalMax / 100,
        },
        standard_coal: {
          min: formData.cleanCoalMin && formData.cleanCoalMin / 100,
          max: formData.cleanCoalMax && formData.cleanCoalMax / 100,
        },
        standard_heat: {
          min: formData.heatMin && formData.heatMin / 100,
          max: formData.heatMax && formData.heatMax / 100,
        },
        companyName: formData.addressCompany,
      });
      setFromCompany({
        id: formData.addressCompanyId,
        companyName: formData.addressCompany,
      });
      setRadioRawMaterial(formData.rawMaterial);
      console.log(formData);
    }
  }, [formData]);

  const onChangeFromCompany = (e, val) => {
    if (e) {
      const item = val.item;
      setFromCompany({
        id: item.key,
        companyName: item.value,
      });

      form.setFieldsValue({
        companyName: item.value,
      });
    } else {
      setFromCompany({
        companyName: undefined,
      });

      form.setFieldsValue({
        companyName: undefined,
      });
      setNewCompany(true);
      //搜索后需要重新调接口
      setTimeout(() => {
        setNewCompany(false);
      }, 1000);
    }
  };

  const radioOnchange = e => {
    setRadioRawMaterial(e.target.value);
  };

  return (
    <Form
      className={styles.main}
      {...formItemLayout}
      autoComplete="off"
      layout="inline"
      form={form}
      onFinish={handleSubmit}
      onFinishFailed={onFinishFailed}>
      <div className={styles.title}>
        <ChildTitle style={{ height: 26 }}>基础信息</ChildTitle>
      </div>
      <div className={styles.row}>
        <div className={styles.col}>
          <Form.Item label="货物类型" name="goodsType" rules={[{ required: true, message: '请选择货物类型' }]}>
            <Select placeholder="请选择货物类型" style={{ width: 264 }}>
              {GoodsType.map(({ name, key }) => (
                <Select.Option value={key} key={key}>
                  {name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.col}>
          <Form.Item label="货品名称" name="goodsName" rules={[{ required: true, message: '请输入货品名称' }]}>
            <Input style={{ width: 264 }} disabled={formData.id} placeholder="请输入货品名称" />
          </Form.Item>
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.col}>
          <Form.Item
            label="成本单价"
            name="unitPrice"
            validateFirst={true}
            rules={[
              { required: true, message: '成本单价不可为空' },
              { pattern: /^([1-9][0-9]*(\.\d*)?)|(0\.\d*)$/, message: '内容必须是数字且大于0' },
              { pattern: /^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/, message: '最多输入2位小数' },
            ]}>
            <Input style={{ width: 264 }} placeholder="请输入成本单价" addonAfter="元/吨" />
          </Form.Item>
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.col}>
          <Form.Item label="配煤原料" name="rawMaterial" rules={[{ required: true, message: '请选择配煤原料' }]}>
            <Radio.Group style={{ width: 264 }} onChange={e => radioOnchange(e)}>
              <Radio value={1}>是</Radio>
              <Radio value={0} style={{ marginLeft: 24 }}>
                否
              </Radio>
            </Radio.Group>
          </Form.Item>
        </div>
      </div>
      {isShowWarehouse && radioRawMaterial === 1 && (
        <div className={styles.row}>
          <div className={styles.col}>
            <Form.Item label="供应商" name="companyName" rules={[{ required: true, message: '请选择供应商' }]}>
              <AutoInputSelect
                mode="company"
                allowClear
                placeholder="请选择供应商"
                value={fromCompany.companyName}
                onChange={(e, val) => {
                  onChangeFromCompany(e, val);
                }}
                newCompany={newCompany}
                style={{ width: 264 }}
              />
            </Form.Item>
          </div>
        </div>
      )}

      <div className={styles.title} style={{ marginTop: 24 }}>
        <ChildTitle style={{ height: 26 }}>指标标准</ChildTitle>
      </div>

      <div className={styles.row}>
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
            ]}
            onChange={() => validateMax('mad')}>
            <Input placeholder="请输入" />
          </Form.Item>
        </div>
        <div className={`${styles.col} ${styles['db-input']}`}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>灰分(% Ad)
              </div>
            }
            name={['standard_ad', 'min']}
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
                validator: () => validateMin('ad'),
              },
            ]}>
            <Input style={{}} placeholder="请输入" />
          </Form.Item>
          <span>≤Ad≤</span>
          <Form.Item
            label=""
            colon={false}
            name={['standard_ad', 'max']}
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
            ]}
            onChange={() => validateMax('ad')}>
            <Input placeholder="请输入" />
          </Form.Item>
        </div>
      </div>
      <div className={styles.row}>
        <div className={`${styles.col} ${styles['db-input']}`}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>挥发(% Vdaf)
              </div>
            }
            name={['standard_vdaf', 'min']}
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
                validator: () => validateMin('vdaf'),
              },
            ]}>
            <Input style={{}} placeholder="请输入" />
          </Form.Item>
          <span>≤Vdaf≤</span>
          <Form.Item
            label=""
            colon={false}
            name={['standard_vdaf', 'max']}
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
            ]}
            onChange={() => validateMax('vdaf')}>
            <Input placeholder="请输入" />
          </Form.Item>
        </div>
        <div className={styles.col}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>焦渣特征(1-8
                CRC)
              </div>
            }
            name="standard_crc"
            validateFirst={true}
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
            <Input style={{ width: 96 }} placeholder="请输入" />
          </Form.Item>
        </div>
      </div>
      <div className={styles.row}>
        {/* 全硫 */}
        <div className={`${styles.col} ${styles['db-input']}`}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>全硫(% Std)
              </div>
            }
            name={['standard_std', 'min']}
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
                validator: () => validateMin('std'),
              },
            ]}>
            <Input style={{}} placeholder="请输入" />
          </Form.Item>
          <span>≤Std≤</span>
          <Form.Item
            label=""
            colon={false}
            name={['standard_std', 'max']}
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
            ]}
            onChange={() => validateMax('std')}>
            <Input placeholder="请输入" />
          </Form.Item>
        </div>
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
            <Input style={{}} placeholder="请输入" />
          </Form.Item>
          <span>≤Fcd≤</span>
          <Form.Item
            label=""
            colon={false}
            name={['standard_fcd', 'max']}
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
            ]}
            onChange={() => validateMax('fcd')}>
            <Input placeholder="请输入" />
          </Form.Item>
        </div>
      </div>
      <div className={styles.row}>
        <div className={`${styles.col} ${styles['db-input']}`}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>回收(% r)
              </div>
            }
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
            <Input style={{}} placeholder="请输入" />
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
            ]}
            onChange={() => validateMax('r')}>
            <Input placeholder="请输入" />
          </Form.Item>
        </div>
        <div className={`${styles.col} ${styles['db-input']}`}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>全水分(% Mt)
              </div>
            }
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
            <Input style={{}} placeholder="请输入" />
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
            ]}
            onChange={() => validateMax('mt')}>
            <Input placeholder="请输入" />
          </Form.Item>
        </div>
      </div>
      <div className={styles.row}>
        <div className={`${styles.col} ${styles['db-input']}`}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>粘结指数(GRI)
              </div>
            }
            name={['standard_gri', 'min']}
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
                validator: () => validateMin('gri'),
              },
            ]}>
            <Input style={{}} placeholder="请输入" />
          </Form.Item>
          <span>≤GRI≤</span>
          <Form.Item
            label=""
            colon={false}
            name={['standard_gri', 'max']}
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
            ]}
            onChange={() => validateMax('gri')}>
            <Input placeholder="请输入" />
          </Form.Item>
        </div>
        <div className={`${styles.col} ${styles['db-input']}`}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>胶质层(Y)
              </div>
            }
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
            <Input style={{}} placeholder="请输入" />
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
            ]}
            onChange={() => validateMax('y')}>
            <Input placeholder="请输入" />
          </Form.Item>
        </div>
      </div>
      <div className={styles.row}>
        <div className={`${styles.col} ${styles['db-input']}`}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>发热量(卡)
              </div>
            }
            name={['standard_heat', 'min']}
            validateFirst={true}
            rules={[
              {
                pattern: /^[0-8]\d*$/,
                message: '请输入正确的数值',
              },
              {
                whitespace: true,
                type: 'number',
                transform: value => Number(value) || 0,
                max: 10000,
                message: '请输入小于等于10000数值',
              },
              {
                validator: () => validateMin('heat'),
              },
            ]}>
            <Input style={{}} placeholder="请输入" />
          </Form.Item>
          <span>≤cal≤</span>
          <Form.Item
            label=""
            colon={false}
            name={['standard_heat', 'max']}
            validateFirst={true}
            rules={[
              {
                pattern: /^[0-9]\d*$/,
                message: '请输入正确的数值',
              },
              {
                whitespace: true,
                type: 'number',
                transform: value => Number(value) || 0,
                max: 10000,
                message: '请输入小于等于10000数值',
              },
            ]}
            onChange={() => validateMax('heat')}>
            <Input placeholder="请输入" />
          </Form.Item>
        </div>

        <div className={`${styles.col} ${styles['db-input']}`}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>含矸石(%)
              </div>
            }
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
            <Input style={{}} placeholder="请输入" />
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
            ]}
            onChange={() => validateMax('gangue')}>
            <Input placeholder="请输入" />
          </Form.Item>
        </div>
      </div>

      <div className={styles.row}>
        <div className={`${styles.col} ${styles['db-input']}`}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>含中煤(%)
              </div>
            }
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
            ]}
            onChange={() => validateMax('middle')}>
            <Input placeholder="请输入" />
          </Form.Item>
        </div>

        <div className={`${styles.col} ${styles['db-input']}`}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>含精煤(%)
              </div>
            }
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
            <Input style={{}} placeholder="请输入" />
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
            ]}
            onChange={() => validateMax('coal')}>
            <Input placeholder="请输入" />
          </Form.Item>
        </div>
      </div>

      <div className={styles.bottom}>
        <Button size="default" type="primary" htmlType="submit" loading={loading}>
          提交
        </Button>
      </div>
    </Form>
  );
};

export default GoodsForm;
