import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input } from 'antd';

const CreateFleet = ({ form: { getFieldDecorator } }) => {
  return (
    <>
      <Form layout="horizontal" labelAlign="left" labelCol={{ span: 5 }} wrapperCol={{ span: 10 }}>
        <Form.Item label="车队名：">
          {getFieldDecorator('name', {
            rules: [
              {
                required: true,
                message: '请输入车队名!',
              },
              {
                pattern: /^[\u4e00-\u9fa5]+$/,
                message: '车队名只能是汉字',
              },
            ],
          })(<Input placeholder="请输入车队名" />)}
        </Form.Item>
        <Form.Item label="车队长姓名：">
          {getFieldDecorator('leaderName', {
            rules: [
              {
                required: true,
                message: '请输入车队长姓名!',
              },
              {
                pattern: /^[\u4e00-\u9fa5]+$/,
                message: '车队长姓名只能是汉字',
              },
              {
                min: 2,
                message: '姓名的长度至少 2 个字符',
              },
            ],
          })(<Input placeholder="请输入车队长姓名" />)}
        </Form.Item>
        <Form.Item label="车队长手机：">
          {getFieldDecorator('mobilePhoneNumber', {
            rules: [
              {
                required: true,
                message: '请输入车队长手机!',
              },
              {
                pattern: /^(?:(?:\+|00)86)?1[3-9]\d{9}$/,
                message: '手机号格式不正确!',
              },
            ],
          })(<Input placeholder="请输入车队长手机" />)}
        </Form.Item>
      </Form>
    </>
  );
};

export default Form.create()(CreateFleet);
