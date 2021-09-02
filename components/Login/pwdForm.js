import { useState } from 'react';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Input, Row, Col, message, Form } from 'antd';
import styles from './styles.less';
import { login } from '@api';
import { User } from '@store';
import router from 'next/router';
import Store from './store';
import { Permission, WhiteList } from '@store';
const PwdForm = () => {
  const { reload, generateIndex } = User.useContainer();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { account, changeMode } = Store.useContainer();
  const { reloadPermissions } = Permission.useContainer();
  const { reloadWhiteList } = WhiteList.useContainer();
  const handleSubmit = async values => {
    setLoading(true);
    // 登录接口
    const res = await login({ params: values });
    if (res.status === 0) {
      const id = res.result.id || res.result.bossId;
      window.localStorage.setItem('userId', id);
      const url = generateIndex(res.result);

      router.push(url).then(() => {
        setLoading(false);
        // 设置用户信息
        reload(id);
        reloadPermissions();
        reloadWhiteList();
      });
    } else {
      message.error(res.detail || res.description);
      setLoading(false);
    }
  };

  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  const handleModeChange = () => {
    const username = form.getFieldValue('username') || account;
    changeMode(username);
  };
  return (
    <div className={styles.root}>
      <Form onFinish={handleSubmit} onFinishFailed={onFinishFailed} className={styles['login-form']} form={form}>
        <Form.Item
          name="username"
          rules={[
            {
              required: true,
              whitespace: true,
              message: '请输入手机号码',
            },
            {
              pattern: /^[1][3,4,5,6,7,8,9][0-9]{9}$/,
              message: '手机号格式不正确',
            },
          ]}
          initialValue={account}>
          <Input size="large" prefix={<UserOutlined />} placeholder="请输入用户名" />
        </Form.Item>
        <Form.Item name="password" rules={[{ required: true, whitespace: true, message: '请输入您的密码!' }]}>
          <Input size="large" prefix={<LockOutlined />} type="password" placeholder="请输入密码" />
        </Form.Item>
        <Row>
          <Col>
            <Button size="small" type="link" onClick={handleModeChange}>
              验证码登录
            </Button>
          </Col>
        </Row>
        <Form.Item>
          <Button
            loading={loading}
            type="primary"
            htmlType="submit"
            size="large"
            block
            className={styles['login-form-button']}>
            登录
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default PwdForm;
