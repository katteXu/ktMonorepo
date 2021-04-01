import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Button } from 'antd';
import { useState } from 'react';
// 表单布局
const formItemLayout = {
  labelAlign: 'left',
  labelCol: { span: 5 },
  wrapperCol: { span: 18 },
};

const CompanyForm = ({ form, formData, onSubmit, onClose }) => {
  const { getFieldDecorator } = form;

  const [loading, setLoading] = useState(false);
  // 提交数据
  const handleSubmit = e => {
    e.preventDefault();
    setLoading(true);
    form.validateFields((err, values) => {
      if (err) {
        console.log(err);
        setLoading(false);
        return false;
      }

      if (typeof onSubmit === 'function') {
        onSubmit(values);
      }

      setLoading(false);
    });
  };

  return (
    <Form {...formItemLayout} onSubmit={handleSubmit}>
      <Form.Item label="企业名称" required>
        {getFieldDecorator('companyName', {
          initialValue: formData.companyName,
          rules: [
            {
              required: true,
              message: '请输入企业名称',
            },
          ],
        })(<Input placeholder="请输入企业名称" />)}
      </Form.Item>

      <Form.Item label="企业简称" required>
        {getFieldDecorator('companySimpleName', {
          initialValue: formData.companySimpleName,
          rules: [
            {
              required: true,
              message: '请输入企业简称',
            },
          ],
        })(<Input placeholder="请输入企业简称" />)}
      </Form.Item>

      <Form.Item
        label={
          <div>
            <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>企业联系人
          </div>
        }
        // label="企业联系人"
      >
        {getFieldDecorator('companyContactName', {
          initialValue: formData.companyContactName,
          validateFirst: true,
          rules: [
            {
              min: 2,
              message: '内容长度不能少于2',
            },
            {
              pattern: /^(?:[\u4e00-\u9fa5·]{2,16})$/,
              message: '联系人只能是汉字',
            },
            {
              max: 10,
              message: '内容长度不能超过10',
            },
          ],
        })(<Input placeholder="请输入企业联系人" />)}
      </Form.Item>

      <Form.Item
        label={
          <div>
            <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>联系人电话
          </div>
        }
        // label="联系人电话"
      >
        {getFieldDecorator('companyContactMobile', {
          initialValue: formData.companyContactMobile,
          rules: [
            {
              pattern: /^(?:(?:\+|00)86)?1(?:(?:3[\d])|(?:4[5-7|9])|(?:5[0-3|5-9])|(?:6[5-7])|(?:7[0-8])|(?:8[\d])|(?:9[1|8|9]))\d{8}$/,
              message: '电话的格式不正确',
            },
          ],
        })(<Input placeholder="请输入联系人电话" />)}
      </Form.Item>

      <div style={{ textAlign: 'center', margin: '15px 0' }}>
        <Button size="default" onClick={() => onClose()}>
          取消
        </Button>
        <Button size="default" type="primary" style={{ marginLeft: 30 }} htmlType="submit" loading={loading}>
          提交
        </Button>
      </div>
    </Form>
  );
};

export default Form.create({ name: 'companyForm' })(CompanyForm);
