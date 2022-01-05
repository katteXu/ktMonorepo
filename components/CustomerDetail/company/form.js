import { Input, Button, Form } from 'antd';
import { useState, useEffect } from 'react';
import { customer } from '@api';
import CompanySearcher from './CompanySearcher';
import styles from './styles.less';
// 表单布局
const formItemLayout = {
  labelAlign: 'left',
  wrapperCol: { span: 19 },
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
      <div style={{ fontSize: 12, lineHeight: '12px', marginTop: 8, color: '#a3a3a3' }}>
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
    <div className={styles.form}>
      <Form
        className="small"
        {...formItemLayout}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        hideRequiredMark={true}
        form={form}>
        <div className={styles.companyForm}>
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
              ]}>
              <CompanySearcher
                placeholder="请输入企业名称"
                style={{ width: 200 }}
                keyWord="kw"
                getRemoteData={customer.getCompanyByName}
              />
            </Form.Item>
            <Help />
          </Form.Item>
        </div>

        <Form.Item label="企业联系人" name="companyContactName">
          <Input placeholder="请输入企业联系人" style={{ width: 200 }} />
        </Form.Item>
        <Form.Item label="联系人电话" name="companyContactMobile">
          <Input placeholder="请输入联系人电话" style={{ width: 200 }} />
        </Form.Item>

        <div style={{ textAlign: 'right' }}>
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
