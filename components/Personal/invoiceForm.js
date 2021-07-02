import { useEffect } from 'react';
import { Row, Col, Input, Button, Form } from 'antd';
import AreaPicker from '../AreaPicker';
import styles from './personal.less';
// 表单布局
const formItemLayout = {
  labelAlign: 'left',
  // labelCol: { span: 3 },
  wrapperCol: { span: 8 },
};

// 空值验证
const rules = [{ required: true, whitespace: true, message: '内容不可为空' }];

// 姓名验证
const name_rules = [
  {
    required: true,
    whitespace: true,
    message: '内容不可为空',
  },
  {
    pattern: /^[\u4E00-\u9FA5\uf900-\ufa2d·s]{2,20}$/,
    message: '内容长度不能小于2个汉字',
  },
];

// 区域验证
const select_rules = [{ type: 'array', required: true, whitespace: true, message: '选项不可为空' }];

// 电话验证
const phone_rules = [
  {
    required: true,
    whitespace: true,
    message: '内容不可为空',
  },
  {
    pattern: /^[1][3,4,5,6,7,8,9][0-9]{9}$/,
    message: '请输入有效的移动电话',
  },
];

// 固定电话校验
const telePhone_rules = [
  {
    required: true,
    whitespace: true,
    message: '内容不可为空',
  },
  {
    pattern: /^[0-9]{0,11}$/,
    message: '请输入有效的联系电话',
  },
];

const EditForm = ({ data, onSubmit }) => {
  const [form] = Form.useForm();
  // 提交表单
  const handleSubmit = values => {
    if (typeof onSubmit === 'function') {
      onSubmit(values);
    }
  };

  //  初始化数据
  useEffect(() => {
    if (data) {
      const {
        taxpayerNumber,
        bankName,
        cardNumber,
        companyAddress,
        invoicePhone,
        receiveName,
        receivePhone,
        receiveProvince,
        receiveCity,
        receiveDistrict,
        receiveAddress,
      } = data;
      form.setFieldsValue({
        taxpayerNumber,
        bankName,
        cardNumber,
        companyAddress,
        invoicePhone,
        receiveName,
        receivePhone,
        areaPicker: [receiveProvince, receiveCity, receiveDistrict],
        receiveAddress,
      });
    }
  }, [data]);

  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  return (
    <div className={styles.invoiceFrom}>
      <Form {...formItemLayout} onFinish={handleSubmit} onFinishFailed={onFinishFailed} form={form} autoComplete="off">
        <Form.Item
          label="纳税人识别号"
          name="taxpayerNumber"
          validateFirst={true}
          rules={[
            { required: true, whitespace: true, message: '识别号不可为空' },
            {
              pattern: /^[A-Z0-9]{0,20}$/,
              message: '识别号只能输入数字和大写字母',
            },
            { min: 15, message: '识别号输入有误，不可少于15位' },
            { max: 20, message: '识别号输入有误，不可超过20位' },
          ]}>
          <Input maxLength={20} placeholder="请输入纳税人税号" />
        </Form.Item>
        <Form.Item
          label="账号"
          name="cardNumber"
          validateFirst={true}
          rules={[
            { required: true, whitespace: true, message: '账号不可为空' },
            { pattern: /^[0-9]{0,30}$/, message: '账号只能是数字' },
            { min: 9, message: '账号输入有误，不可少于9位' },
            { max: 30, message: '账号输入有误，不可超过30位' },
          ]}>
          <Input maxLength={30} placeholder="请输入开户账号" />
        </Form.Item>
        <Form.Item label="开户行" name="bankName" rules={rules}>
          <Input placeholder="请输入开户行" />
        </Form.Item>
        <Form.Item label="企业地址" name="companyAddress" rules={rules}>
          <Input placeholder="请输入企业地址" />
        </Form.Item>
        <Form.Item
          label="企业联系电话"
          name="invoicePhone"
          validateFirst={true}
          rules={[
            {
              required: true,
              whitespace: true,
              message: '内容不可为空',
            },
            {
              validator: (rule, value) => {
                const mobile = /^1[3|4|5|7|8][0-9]{9}$/;
                const telephone = /^(\d{3,4}-)\d{7,8}$/;
                if (mobile.test(value) || telephone.test(value)) {
                  return Promise.resolve();
                } else {
                  return Promise.reject('请输入有效的联系电话');
                }
              },
            },
          ]}>
          <Input maxLength={13} placeholder="请输入企业联系电话" />
        </Form.Item>

        <div className={styles.textInfo}> 联系地址：此地址是我们为您邮寄发票的地址</div>

        <Form.Item label="收票人" name="receiveName" rules={name_rules} validateFirst={true}>
          <Input placeholder="请输入收票人姓名" />
        </Form.Item>
        <Form.Item
          label="收票电话"
          name="receivePhone"
          validateFirst={true}
          rules={[
            {
              required: true,
              whitespace: true,
              message: '内容不可为空',
            },
            {
              validator: (rule, value) => {
                const mobile = /^1[3|4|5|7|8][0-9]{9}$/;
                const telephone = /^(\d{3,4}-)\d{7,8}$/;
                if (mobile.test(value) || telephone.test(value)) {
                  return Promise.resolve();
                } else {
                  return Promise.reject('请输入有效的联系电话');
                }
              },
            },
          ]}>
          <Input maxLength={13} placeholder="请输入收票人电话" />
        </Form.Item>
        <Form.Item label="地区信息" name="areaPicker" rules={select_rules}>
          <AreaPicker placeholder="请选择地区信息"></AreaPicker>
        </Form.Item>
        <Form.Item label="收票人地址" name="receiveAddress" rules={rules}>
          <Input placeholder="请输入收票人地址" />
        </Form.Item>
        <Form.Item label=" " colon={false}>
          <Button type="primary" htmlType="submit">
            提交
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default EditForm;
