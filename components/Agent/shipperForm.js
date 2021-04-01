import { useState, useEffect } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, Modal, Input, Row, Col, message } from 'antd';
import agent from '@api/agent';
// 表单布局
const formItemLayout = {
  labelAlign: 'left',
  labelCol: { span: 5 },
  wrapperCol: { span: 10 },
};

const ShipperForm = ({ form, onSubmit, onClose }) => {
  const { getFieldDecorator } = form;
  const [time, setTime] = useState();
  // 货主名称
  const [userName, setUserName] = useState();
  // 计时器对象
  const [timeoutState, setTimeoutState] = useState();
  // 提交loading
  const [loading, setLoading] = useState(false);

  // 提交表单
  const submit = e => {
    e.preventDefault();

    form.validateFields(async (err, values) => {
      if (err) {
        console.log(err);
        return;
      }

      onSubmit && onSubmit(values);
    });
  };

  // 监听关闭
  const handleClose = () => {
    onClose && onClose();
  };

  // 倒计时
  useEffect(() => {
    if (time > 0) {
      const _timeout = setTimeout(() => {
        setTime(time - 1);
      }, 1000);
      setTimeoutState(_timeout);
    }
  }, [time]);

  // 获取短信验证码
  const getSms = () => {
    form.validateFields(['username'], async (error, values) => {
      if (error) {
        console.log(error);
        return false;
      }
      const params = {
        username: values.username,
      };
      const res = await agent.sendSms({ params });
      if (res.status === 0) {
        message.success('验证码发送成功，请留意手机短信');
        setTime(30);
      } else {
        message.error(res.detail ? res.detail : res.description);
      }
    });
  };

  useEffect(() => {
    if (/^1[3456789]\d{9}$/.test(userName)) {
      setUserNameByMobile();
    } else {
      form.setFieldsValue({ name: '' });
    }
  }, [userName]);

  const setUserNameByMobile = async () => {
    const params = {
      mobile: userName,
    };
    const res = await agent.getNameByMobile({ params });
    if (res.status === 0) {
      form.setFieldsValue({ name: res.result.name });
    } else {
      message.warn(res.detail ? res.detail : res.description);
    }
  };
  return (
    <Form {...formItemLayout} autoComplete="off" onSubmit={submit}>
      <Form.Item label="货主账号">
        {getFieldDecorator('username', {
          vaildateFirst: true,
          rules: [
            { required: true, message: '货主账号不可为空' },
            { pattern: /^1[3456789]\d{9}$/, message: '货主账号必须是有效的手机号' },
          ],
        })(
          <Input
            maxLength={11}
            onChange={e => {
              setTime(undefined);
              setUserName(e.target.value);
              clearTimeout(timeoutState);
            }}
            placeholder="请输入货主账号"
          />
        )}
      </Form.Item>
      <Form.Item
        label={
          <div>
            <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>货主名称
          </div>
        }
        //  label="货主名称"
      >
        {getFieldDecorator('name', {})(<Input disabled placeholder="货主名称" />)}
      </Form.Item>
      <Form.Item label="货主验证码">
        {getFieldDecorator('sms', {
          rules: [{ required: true, message: '验证码不可为空' }],
        })(<Input placeholder="请输入货主验证码" />)}
        <Button
          type="primary"
          disabled={time > 0}
          style={{ position: 'absolute', top: -6, right: -115, minWidth: 100 }}
          onClick={() => getSms()}>
          {time === undefined ? '获取验证码' : time > 0 ? `${time}s` : '重新发送'}
        </Button>
      </Form.Item>
      <div style={{ textAlign: 'center' }}>
        <Button onClick={handleClose}>取消</Button>
        <Button type="primary" style={{ marginLeft: 50 }} htmlType="submit">
          提交
        </Button>
      </div>
    </Form>
  );
};

export default Form.create({ name: 'shipperForm' })(ShipperForm);
