import { useState, useEffect } from 'react';
import { Input, InputNumber, Button, Form, Radio, Space, message } from 'antd';
import styles from './styles.less';
// 表单布局z
const formItemLayout = {
  labelAlign: 'left',
  wrapperCol: { span: 14 },
};

const number_rules = [
  {
    pattern: /^\d+(\.\d{1,2})?$/,
    message: '只能是数字，且不可超过2位小数',
  },
  {
    validator: (rule, value) => {
      if (+value > 0) {
        return Promise.resolve();
      } else {
        return Promise.reject('内容必须大于0');
      }
    },
  },
];

const UpdateForm = ({ onSubmit, onClose, unitPrice, infoFeeUnitName, unitInfoFee, unitName }) => {
  const [form] = Form.useForm();
  const [newInfoFeeUnitName, setNewInfoFeeUnitName] = useState(infoFeeUnitName);

  useEffect(() => {
    form.setFieldsValue({
      unitPrice,
      infoFeeUnitName,
      unitInfoFee,
    });
  }, []);

  const handleSubmit = values => {
    if (unitName === '吨' && values.infoFeeUnitName === 1 && values.unitInfoFee * 2 > values.unitPrice * 1) {
      message.warn('信息费单价不可超过运费单价的50%，请重新输入');
      return;
    }
    onSubmit && onSubmit(values);
  };

  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  const handleInfoFeeUnitNameChange = e => {
    setNewInfoFeeUnitName(e.target.value);
  };

  return (
    <div className={styles.formSendInfoFeeData}>
      <Form {...formItemLayout} form={form} onFinish={handleSubmit} onFinishFailed={onFinishFailed} autoComplete="off">
        <Form.Item
          label="运输中、待结算的运单是否修改"
          name="status"
          rules={[{ required: true, message: '内容不能为空' }]}>
          <Radio.Group>
            <Radio value={true}>是</Radio>
            <Radio value={false} style={{ marginLeft: 16 }}>
              否
            </Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label={
            <div>
              <span className={styles.redStar}>*</span>运费单价
            </div>
          }>
          <Space>
            <Form.Item
              name="unitPrice"
              validateFirst={true}
              noStyle
              rules={[{ required: true, message: '内容不能为空' }, ...number_rules]}>
              <InputNumber placeholder="请输入运费单价" step={0.01} min={0} style={{ width: 88, lineHeight: '30px' }} />
            </Form.Item>
            <span>{`元/${unitName}`}</span>
          </Space>
        </Form.Item>

        <Form.Item
          label={
            <div>
              <span className={styles.noStar}>*</span>信息费收取方式
            </div>
          }
          name="infoFeeUnitName">
          <Radio.Group onChange={handleInfoFeeUnitNameChange}>
            <Radio value={0}>按车收</Radio>
            <Radio value={1} style={{ marginLeft: 16 }}>
              按吨收
            </Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label={
            <div>
              <span className={styles.noStar}>*</span>信息费单价
            </div>
          }>
          <Space>
            <Form.Item
              name="unitInfoFee"
              validateFirst={true}
              noStyle
              rules={[
                // {
                //   required: true,
                //   message: '内容不可为空',
                // },
                {
                  pattern: /^\d+(\.\d{1,2})?$/,
                  message: '只能是数字，且不可超过2位小数',
                },
              ]}>
              <InputNumber
                placeholder="请输入信息费单价"
                step={0.01}
                min={0}
                style={{ width: 88, lineHeight: '30px' }}
              />
            </Form.Item>
            <span>{`元/${newInfoFeeUnitName === 0 ? '车' : '吨'}`}</span>
          </Space>
        </Form.Item>

        <div style={{ textAlign: 'right' }}>
          <Button onClick={onClose}>取消</Button>
          <Button style={{ marginLeft: 8 }} htmlType="submit" type="primary">
            确定
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default UpdateForm;
