import { useEffect, useState } from 'react';
import { Row, Col, Input, Button, message, Form } from 'antd';
import personalApi from '@api/personalCenter';
import styles from '../../pages/personal/styles.less';
import { User } from '@store';
const STRONG = {
  1: <div style={{ color: '#FF0000' }}>弱</div>,
  2: <div style={{ color: '#FF9900' }}>中</div>,
  3: <div style={{ color: '#33CC00' }}>强</div>,
};

const formItemLayout = {
  labelAlign: 'left',
  // labelCol: { span: 4 },
  // wrapperCol: {
  //   span: 20,
  // },
};

// 空值验证
const rules = [{ required: true, whitespace: true, message: '内容不可为空' }];

const PwdForm = ({ onSubmit, onClose }) => {
  const { userInfo } = User.useContainer();
  const [mobile, setMobile] = useState('');

  const [form] = Form.useForm();

  const handleSubmit = async values => {
    if (typeof onSubmit === 'function') {
      onSubmit({ ...values, mobile });
    }
  };

  // 初始化
  useEffect(() => {
    setMobile(userInfo.username);
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
    <Form
      form={form}
      hideRequiredMark
      {...formItemLayout}
      onFinish={handleSubmit}
      onFinishFailed={onFinishFailed}
      className={styles.pwdEditForm}>
      <Form.Item label="手机号">
        <div style={{ color: '#333333' }}>{mobile}</div>
      </Form.Item>
      <div style={{ display: 'flex' }}>
        <Form.Item label="验证码" name="sms" rules={[{ required: true, whitespace: true, message: '内容不可为空' }]}>
          <Input placeholder="请输验证码" maxLength={6} style={{ width: 200 }} />
        </Form.Item>

        <Button
          type="primary"
          ghost
          disabled={send}
          style={{ width: 88, marginLeft: 12, padding: '4px 8px' }}
          onClick={getCode}>
          {!send ? '获取验证码' : countDown > 0 ? `${countDown}s` : '重新发送'}
        </Button>
      </div>
      <div style={{ marginBottom: 24 }}>
        <Form.Item
          label="设置密码"
          name="password"
          rules={[{ required: true, whitespace: true, message: '内容不可为空' }]}>
          <Input.Password
            style={{ width: 300 }}
            onChange={e => {
              setStrong(getPassStrength(e.target.value));
            }}
            autoComplete="new-password"
            placeholder="请输入新密码"
          />
        </Form.Item>
        <Form.Item
          label="确认密码"
          name="confirmPassword"
          rules={[
            { required: true, whitespace: true, message: '内容不可为空' },
            {
              validator: (rule, value, callback) => {
                if (value && value !== form.getFieldsValue().password) {
                  callback('确认密码与设置密码不符，请重试');
                } else {
                  callback();
                }
              },
            },
          ]}>
          <Input.Password
            style={{ width: 300 }}
            onChange={e => {
              setStrong(getPassStrength(e.target.value));
            }}
            // autoComplete="new-password"
            placeholder="请确认密码"
          />
        </Form.Item>
      </div>

      <div className={styles['btn-bottom']} style={{ height: 32 }}>
        <Button type="primary" htmlType="submit">
          提交
        </Button>
      </div>
    </Form>
  );
};

export default PwdForm;
