import { Input, Button, Form, Radio, Select } from 'antd';
import { useState, useEffect, useCallback } from 'react';
import styles from './goodsForm.less';
import { getGoodsType } from '@api';
import { ChildTitle } from '@components';
// 表单布局
const formItemLayout = {
  labelAlign: 'left',
};

const GoodsForm = ({ formData = {}, onSubmit, onClose }) => {
  const [form] = Form.useForm();
  const [GoodsType, setGoodsType] = useState([]);
  useEffect(() => {
    initGoodsType();
  }, []);

  const [loading, setLoading] = useState(false);
  // 提交数据
  const handleSubmit = async values => {
    setLoading(true);
    onSubmit && onSubmit({ ...values, id: formData.id });
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

  return (
    <Form
      className={styles.main}
      {...formItemLayout}
      initialValues={formData}
      autoComplete="off"
      layout="inline"
      form={form}
      onFinish={handleSubmit}
      onFinishFailed={onFinishFailed}>
      <ChildTitle>
        <div className={styles.title}>基础信息</div>
      </ChildTitle>
      <div className={styles.row}>
        <div className={styles.col}>
          <Form.Item label="货物类型" name="goodsType" rules={[{ required: true, message: '请选择货物类型' }]}>
            <Select placeholder="请选择货物类型" style={{ marginLeft: 8, width: 200 }}>
              {GoodsType.map(({ name, key }) => (
                <Select.Option value={key} key={key}>
                  {name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </div>
        <div className={styles.col}>
          <Form.Item label="货品名称" name="goodsName" rules={[{ required: true, message: '请选择货品名称' }]}>
            <Input style={{ marginLeft: 8, width: 200 }} disabled={formData.id} placeholder="请输入货品名称" />
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
            <Input style={{ marginLeft: 8, width: 200 }} placeholder="请输入成本单价" addonAfter="元/吨" />
            {/* <span className={styles.unitName}>元/吨</span> */}
          </Form.Item>
        </div>
        <div className={styles.col}>
          <Form.Item label="配煤原料" name="materials" rules={[{ required: true, message: '请选择配煤原料' }]}>
            <Radio.Group style={{ marginLeft: 8, width: 200 }}>
              <Radio value={1}>是</Radio>
              <Radio value={0}>否</Radio>
            </Radio.Group>
          </Form.Item>
        </div>
      </div>

      <ChildTitle style={{ marginTop: 24 }}>
        <div className={styles.title}>指标标准</div>
      </ChildTitle>
      <div className={styles.row}>
        {/* 水分 */}
        <div className={`${styles.col} ${styles['db-input']}`}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>水分(% Mad)
              </div>
            }
            // label="水分(% Mad)"
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
            <Input style={{ marginLeft: 8 }} placeholder="请输入" />
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
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>灰分(% Ad)
              </div>
            }
            // label="灰分(% Ad)"
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
            <Input style={{ marginLeft: 8 }} placeholder="请输入" />
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
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>挥发(% Vdaf)
              </div>
            }
            // label="挥发(% Vdaf)"
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
            <Input style={{ marginLeft: 8 }} placeholder="请输入" />
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
            <Input style={{ marginLeft: 8, width: 96 }} placeholder="请输入" />
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
            // label="全硫(% Std)"
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
            <Input style={{ marginLeft: 8 }} placeholder="请输入" />
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
            // label="固定碳(% Fcd)"
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
            <Input style={{ marginLeft: 8 }} placeholder="请输入" />
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
              {
                validator: () => validateMax('fcd'),
              },
            ]}>
            <Input placeholder="请输入" />
          </Form.Item>
        </div>
      </div>
      {/* 回收 */}
      <div className={styles.row}>
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
            <Input style={{ marginLeft: 8 }} placeholder="请输入" />
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
            <Input style={{ marginLeft: 8 }} placeholder="请输入" />
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
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>粘结指数(GRI)
              </div>
            }
            // label="粘结指数(GRI)"
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
            <Input style={{ marginLeft: 8 }} placeholder="请输入" />
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
            <Input style={{ marginLeft: 8 }} placeholder="请输入" />
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
            <Input style={{ marginLeft: 8 }} placeholder="请输入" />
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
            <Input style={{ marginLeft: 8 }} placeholder="请输入" />
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
            <Input style={{ marginLeft: 8 }} placeholder="请输入" />
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
      <div className={styles.bottom}>
        <Button size="default" onClick={() => onClose && onClose()}>
          取消
        </Button>
        <Button size="default" type="primary" style={{ marginLeft: 8 }} htmlType="submit" loading={loading}>
          提交
        </Button>
      </div>
    </Form>
  );
};

export default GoodsForm;
