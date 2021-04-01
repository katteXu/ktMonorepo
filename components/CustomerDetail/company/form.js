import { Input, Button, Form } from 'antd';
import { useState, useEffect } from 'react';
import styles from './styles.less';
// 表单布局
const formItemLayout = {
  labelAlign: 'left',
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};

const styleBottom = {
  height: 50,
  padding: '0 22px',
  borderTop: '1px solid #f0f0f0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
};

const CompanyForm = ({ formData, onSubmit, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  // 提交数据
  const onFinish = values => {
    console.log('success' + values);
    setLoading(true);
    if (typeof onSubmit === 'function') {
      onSubmit(values);
    }
    setLoading(false);
  };

  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  // 帮助文案
  const Help = () => {
    return (
      <div
        style={{
          fontSize: 12,
          lineHeight: '12px',
          marginTop: 3,
          color: '#a3a3a3',
        }}>
        <span>企业名称将用于发票等场景，请确保其正确</span>
      </div>
    );
  };

  useEffect(() => {
    form.setFieldsValue({
      companyName: '',
      companySimpleName: '',
      companyContactName: '',
      companyContactMobile: '',
    });
  }, [formData]);

  return (
    <div className={styles.companyForm}>
      <Form
        {...formItemLayout}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        hideRequiredMark={true}
        form={form}
        initialValues={
          {
            // companyName: formData && formData.companyName,
            // companySimpleName: formData && formData.companySimpleName,
            // companyContactName: formData && formData.companyContactName,
            // companyContactMobile: formData && formData.companyContactMobile,
          }
        }>
        <Form.Item label="企业名称">
          <Form.Item
            name="companyName"
            validateFirst={true}
            noStyle
            rules={[
              {
                required: true,
                message: '请输入企业名称',
              },
              {
                max: 25,
                message: '企业名称最多不超过25个字符',
              },
            ]}>
            <Input placeholder="请输入企业名称" />
          </Form.Item>
          <Help />
        </Form.Item>
        <Form.Item
          label="企业联系人"
          name="companyContactName"
          // validateFirst={true}
          rules={
            [
              // {
              //   required: true,
              //   message: '请输入企业联系人',
              // },
              // {
              //   min: 2,
              //   message: '内容长度不能少于2',
              // },
              // {
              //   pattern: /^(?:[\u4e00-\u9fa5·]{2,16})$/,
              //   message: '联系人只能是汉字',
              // },
              // {
              //   max: 10,
              //   message: '内容长度不能超过10',
              // },
            ]
          }>
          <Input placeholder="请输入企业联系人" />
        </Form.Item>
        <Form.Item
          label="联系人电话"
          name="companyContactMobile"
          rules={
            [
              // {
              //   required: true,
              //   message: '请输入联系人电话',
              // },
              // {
              //   pattern: /^\d+$|^\d+[.]?\d+$/,
              //   message: '电话只能输入数字',
              // },
            ]
          }>
          <Input placeholder="请输入联系人电话" />
        </Form.Item>

        <div style={{ textAlign: 'right', ...styleBottom }}>
          <Button size="default" onClick={() => onClose()}>
            取消
          </Button>
          <Button size="default" type="primary" htmlType="submit" style={{ marginLeft: 8 }} loading={loading}>
            提交
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default CompanyForm;
