import { Input, Button, Form } from 'antd';
import { useState, useEffect } from 'react';
import styles from './styles.less';
import { ChildTitle } from '@components';
// 表单布局
const formItemLayout = {
  labelAlign: 'left',
};

const GoodsForm = ({ formData = {}, onSubmit, onClose }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  // 提交数据
  const handleSubmit = async values => {
    setLoading(true);
    onSubmit &&
      onSubmit({
        ...values,
        id: formData.id,
        goodsName: formData.goodsName,
        inventoryId: formData.inventoryId,
        companyName: formData.companyName,
      });
    setLoading(false);
  };

  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };
  useEffect(() => {
    form.setFieldsValue(formData);
  }, [formData]);
  return (
    <Form
      className={styles['goods-form']}
      {...formItemLayout}
      autoComplete="off"
      layout="inline"
      form={form}
      onFinish={handleSubmit}
      onFinishFailed={onFinishFailed}>
      <div className={styles.title}>
        <ChildTitle>基础设置</ChildTitle>
      </div>
      <div className={styles.row} style={{ marginTop: 24 }}>
        <div className={styles.col} style={{ flex: 1 }}>
          <span className={styles.label}>货物类型：</span>
          <span>{formData.goodsType}</span>
        </div>
        <div className={styles.col} style={{ flex: 1 }}>
          <span className={styles.label}>货品名称：</span>
          <span>{formData.goodsName}</span>
        </div>
        <div className={styles.col} style={{ flex: 1 }}>
          <span className={styles.label}>合作方：</span>
          <span>{formData.companyName || '-'}</span>
        </div>
      </div>

      <div className={styles.row} style={{ marginTop: 24 }}>
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
            <Input placeholder="请输入成本单价" addonAfter="(元/吨)" style={{ width: 264 }} />
          </Form.Item>
        </div>
      </div>

      <div className={styles.title}>
        <ChildTitle>指标标准</ChildTitle>
      </div>
      <div className={styles.row} style={{ marginTop: 24 }}>
        <div className={styles.col}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>水分(% Mad)
              </div>
            }
            name="standard_mad"
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
            <Input placeholder="请输入" style={{ width: 200 }} />
          </Form.Item>
        </div>
        {/* 灰分 */}
        <div className={styles.col}>
          <Form.Item
            label="灰分(% Ad)"
            name="standard_ad"
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
            ]}>
            <Input placeholder="请输入" style={{ width: 200 }} />
          </Form.Item>
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.col}>
          <Form.Item
            label="挥发(% Vdaf)"
            name="standard_vdaf"
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
            ]}>
            <Input placeholder="请输入" style={{ width: 200 }} />
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
            <Input placeholder="请输入" style={{ width: 200 }} />
          </Form.Item>
        </div>
      </div>
      <div className={styles.row}>
        {/* 全硫 */}
        <div className={styles.col}>
          <Form.Item
            label="全硫(% Std)"
            name="standard_std"
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
            ]}>
            <Input placeholder="请输入" style={{ width: 200 }} />
          </Form.Item>
        </div>
        <div className={styles.col}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>固定碳(% Fcd)
              </div>
            }
            name="standard_fcd"
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
            <Input placeholder="请输入" style={{ width: 200 }} />
          </Form.Item>
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.col}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>回收(% r)
              </div>
            }
            name="standard_r"
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
            <Input placeholder="请输入" style={{ width: 200 }} />
          </Form.Item>
        </div>
        <div className={styles.col}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>全水分(% Mt)
              </div>
            }
            name="standard_mt"
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
            <Input placeholder="请输入" style={{ width: 200 }} />
          </Form.Item>
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.col}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>粘结指数(GRI)
              </div>
            }
            name="standard_gri"
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
            <Input placeholder="请输入" style={{ width: 200 }} />
          </Form.Item>
        </div>
        <div className={styles.col}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>胶质层(Y)
              </div>
            }
            name="standard_y"
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
            <Input placeholder="请输入" style={{ width: 200 }} />
          </Form.Item>
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.col}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>发热量(cal)
              </div>
            }
            name="standard_heat"
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
            ]}>
            <Input placeholder="请输入" style={{ width: 200 }} />
          </Form.Item>
        </div>
        <div className={styles.col}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>含矸石(%)
              </div>
            }
            name="standard_gangue"
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
            <Input placeholder="请输入" style={{ width: 200 }} />
          </Form.Item>
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.col}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>含中煤(%)
              </div>
            }
            name="standard_middle"
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
            <Input placeholder="请输入" style={{ width: 200 }} />
          </Form.Item>
        </div>
        <div className={styles.col}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>含精煤(%)
              </div>
            }
            name="standard_coal"
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
            <Input placeholder="请输入" style={{ width: 200 }} />
          </Form.Item>
        </div>
        <div className={styles.col}></div>
      </div>
      <div className={styles.bottom}>
        <Button size="default" type="primary" style={{ marginLeft: 183 }} htmlType="submit" loading={loading}>
          提交
        </Button>
      </div>
    </Form>
  );
};

export default GoodsForm;
