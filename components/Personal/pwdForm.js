import { useEffect, useState } from 'react';
import { Row, Col, Input, Button, message, Form } from 'antd';
import personalApi from '@api/personalCenter';
import styles from './styles.less';
const STRONG = {
  1: <div style={{ color: '#FF0000' }}>弱</div>,
  2: <div style={{ color: '#FF9900' }}>中</div>,
  3: <div style={{ color: '#33CC00' }}>强</div>,
};

const formItemLayout = {
  labelAlign: 'left',
  labelCol: { span: 4 },
  wrapperCol: {
    span: 20,
  },
};

// 空值验证
const rules = [{ required: true, whitespace: true, message: '内容不可为空' }];

const PwdForm = ({ onSubmit, onClose }) => {
  const [mobile, setMobile] = useState('');

  const handleSubmit = async values => {
    if (typeof onSubmit === 'function') {
      onSubmit({ ...values, mobile });
    }
  };

  // 初始化
  useEffect(() => {
    const { username } = localStorage;
    setMobile(username);
  }, []);
  // 密码强度
  const [strong, setStrong] = useState();
  // 倒计时
  const [countDown, setCountDown] = useState(60);
  // 发送
  const [send, setSend] = useState(false);
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
  // 获取验证码
  const getCode = async () => {
    const params = {
      phone: mobile,
    };
    const res = await personalApi.getSms(params);
    if (res.status === 0) {
      message.success('验证码发送成功，请留意手机短信');
      setSend(true);
    } else {
      message.error(res.detail);
      setSend(false);
      setCountDown(60);
    }
  };
  // 验证密码强度
  const getPassStrength = (sValue = '') => {
    let modes = 0;
    //正则表达式验证符合要求的
    if (sValue.length < 1) {
      return 0;
    }
    if (/\d/.test(sValue)) modes++; //数字
    if (/[a-z]/.test(sValue)) modes++; //小写
    if (/[A-Z]/.test(sValue)) modes++; //大写
    if (/\W/.test(sValue)) modes++; //特殊字符
    return modes;
  };

  // 返回密码强度
  const showStrong = strong => {
    if (strong < 3) {
      return STRONG[strong];
    } else {
      return STRONG[3];
    }
  };

  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  return (
    <Form {...formItemLayout} onFinish={handleSubmit} onFinishFailed={onFinishFailed}>
      <Form.Item
        label={
          <div>
            <span
              style={{
                display: 'inline-block',
                marginRight: 4,
                visibility: 'hidden',
              }}>
              *
            </span>
            手机号
          </div>
        }
        // label="手机号"
      >
        <div>{mobile}</div>
      </Form.Item>
      <Form.Item label="验证码" name="sms" rules={rules}>
        <Row gutter={8}>
          <Col span={17}>
            <Input placeholder="请输验证码" maxLength={6} />
          </Col>
          <Col span={7}>
            <Button type="primary" ghost onClick={getCode} loading={send} style={{ width: '100%' }}>
              {send ? `${countDown}s` : '获取验证码'}
            </Button>
          </Col>
        </Row>
      </Form.Item>
      <div style={{ marginBottom: 24 }}>
        <Form.Item
          label="新密码"
          name="password"
          rules={[
            { required: true, whitespace: true, message: '内容不可为空' },
            // {
            //   validator: (rule, value, callback) => {
            //     const strong = getPassStrength(value);
            //     if (value && strong < 2) {
            //       callback('密码强度不够');
            //     } else {
            //       callback();
            //     }
            //   },
            // },
          ]}>
          <Row gutter={8}>
            <Col span={24}>
              <Input.Password
                onChange={e => {
                  setStrong(getPassStrength(e.target.value));
                }}
                autoComplete="new-password"
                placeholder="请输入新密码"
              />
            </Col>
            {/* <Col span={7} style={{ lineHeight: '32px', height: '32px' }}>
              {strong > 0 && showStrong(strong)}
            </Col> */}
          </Row>
        </Form.Item>
      </div>

      <div style={{ textAlign: 'right' }} className={styles['btn-bottom']}>
        <Button onClick={onClose}>取消</Button>
        <Button type="primary" htmlType="submit" style={{ marginLeft: 8 }}>
          提交
        </Button>
      </div>
    </Form>
  );
};

export default PwdForm;
