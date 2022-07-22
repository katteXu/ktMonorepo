import { Component, useEffect, useState } from 'react';
import { Select, Input, Button, message, Modal, Form } from 'antd';
import { station } from '../../api';

const { Option } = Select;
// 表单布局
const formItemLayout = {
  labelAlign: 'left',
  labelCol: { span: 5 },
  wrapperCol: { span: 19 },
};

const Index = ({ close, onManualInfo }) => {
  const [form] = Form.useForm();

  const handleSubmit = async values => {
    const params = {
      ...values,
    };

    const res = await station.queryUserInfo({ params });

    if (res.status === 0) {
      onManualInfo(res.result);
    } else {
      onManualInfo({
        mobile: values.mobile,
      });
      // message.error(res.detail || res.description);
    }
  };

  return (
    <div>
      <Form {...formItemLayout} onFinish={handleSubmit} autoComplete="off" form={form}>
        <Form.Item
          label="手机号"
          name="mobile"
          validateFirst={true}
          rules={[
            { required: true, whitespace: true, message: '内容不可为空' },
            {
              pattern: /^[1][3,4,5,6,7,8,9][0-9]{9}$/,
              message: '请输入有效的联系电话',
            },
          ]}>
          <Input placeholder="请输入手机号" maxLength={11} style={{ width: 264 }} />
        </Form.Item>

        <div style={{ textAlign: 'right' }}>
          <Button size="default" onClick={close}>
            取消
          </Button>
          <Button style={{ marginLeft: 8 }} htmlType="submit" type="primary">
            提交
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default Index;
