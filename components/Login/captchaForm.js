import { useState, useEffect } from 'react';
import { MailOutlined, MobileOutlined } from '@ant-design/icons';
import { Button, Input, Row, Col, message, Form } from 'antd';
import styles from './styles.less';
import { loginByCaptcha, personalCenter } from '@api';
import { User } from '@store';
import router from 'next/router';
import Store from './store';
import { Permission } from '@store';
// 电话验证
const phone_rules = [
  {
    required: true,
    whitespace: true,
    message: '请输入手机号码',
  },
  {
    pattern: /^[1][3,4,5,6,7,8,9][0-9]{9}$/,
    message: '手机号格式不正确',
  },
];

const CaptchaForm = () => {
  const { reload, generateIndex } = User.useContainer();
  const [form] = Form.useForm();
  const { account, changeMode } = Store.useContainer();
  const [loading, setLoading] = useState(false);

  // 倒计时
  const [countDown, setCountDown] = useState(60);
  // 发送
  const [send, setSend] = useState(false);
  const { reloadPermissions } = Permission.useContainer();

  const handleSubmit = async values => {
    setLoading(true);
    // 登录接口
    const res = await loginByCaptcha({ params: values });
    if (res.status === 0) {
      const id = res.result.id || res.result.bossId;
      window.localStorage.setItem('userId', id);
      const url = generateIndex(res.result);
      router.push(url).then(() => {
        setLoading(false);
        // 设置用户信息
        reload(id);
        reloadPermissions();
      });
    } else {
      message.error(res.detail || res.description);
      setLoading(false);
    }
  };

  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  // 获取验证码
  const getCode = () => {
    form.validateFields(['mobile']).then(async values => {
      const params = {
        phone: values.mobile,
      };
      const res = await personalCenter.getSms(params);
      if (res.status === 0) {
        message.success('验证码发送成功，请留意手机短信');
        setSend(true);
      } else {
        message.error(res.detail);
        setSend(false);
        setCountDown(60);
      }
    });
  };

  // 监听倒计时
  useEffect(() => {
    if (countDown > 0 && send) {
      setTimeout(() => {
        setCountDown(countDown - 1);
      }, 1000);
    } else {
      setSend(false);
      setCountDown(60);
    }
  }, [countDown, send]);

  const handleModeChange = () => {
    const username = form.getFieldValue('mobile') || account;
    changeMode(username);
  };

  return (
    <div className={styles.root}>
      <Form onFinish={handleSubmit} onFinishFailed={onFinishFailed} className={styles['login-form']} form={form}>
        <Form.Item name="mobile" rules={phone_rules} initialValue={account}>
          <Input maxLength={11} size="large" prefix={<MobileOutlined />} placeholder="请输入手机号码" />
        </Form.Item>
        <Form.Item
          name="sms"
          rules={[
            {
              required: true,
              whitespace: true,
              message: '请输入验证码!',
            },
          ]}>
          <Row gutter={8}>
            <Col span={13}>
              <Input size="large" prefix={<MailOutlined />} placeholder="请输入验证码" />
            </Col>
            <Col span={11}>
              <Button size="" type="primary" onClick={getCode} loading={send} style={{ width: '100%', height: 39 }}>
                {send ? `${countDown}s` : '获取验证码'}
              </Button>
            </Col>
          </Row>
        </Form.Item>
        <Row>
          <Col>
            <Button size="small" type="link" onClick={handleModeChange}>
              密码登录
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

export default CaptchaForm;
