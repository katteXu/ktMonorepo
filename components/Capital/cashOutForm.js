import { useState, useEffect } from 'react';
import { InfoCircleFilled } from '@ant-design/icons';
import { Input, Button, Select, Modal, message, Form, Tooltip } from 'antd';
import styles from './styles.less';
import PayPasswordInput from '@components/common/PayPasswordInput';
import { capital } from '@api';
import router from 'next/router';
import { getUserInfo } from '@api';
const formItemLayout = {
  labelAlign: 'left',
};

const tailFormItemLayout = {};
// 提现表单
const CashOutForm = ({ onSubmit, amount }) => {
  const [form] = Form.useForm();
  const [showPass, setShowPass] = useState(false);
  const [password, setPassWord] = useState();
  // 提交loading
  const [loading, setLoading] = useState(false);

  // 显示提现金额
  const [money, setMoney] = useState(0);

  // 提现表单数据
  const [formData, setFormData] = useState({});

  const [errorTxt, setErrorTxt] = useState();

  useEffect(() => {
    cashOutInfo();
    getUser();
  }, []);

  const getUser = async () => {
    const { userId } = localStorage;
    const res = await getUserInfo({ userId });
    if (res.status === 0) {
      const hasPayPass = res.result.hasPayPass;
      return hasPayPass;
    }
  };

  // 提交数据
  const onFinish = async values => {
    const hasPayPass = await getUser();
    console.log(hasPayPass);
    // 未设置支付密码 提示去设置
    if (!hasPayPass) {
      Modal.warn({
        title: '未设置支付密码',
        content:
          '尚未设置支付密码, 请前往方向物流app设置，进入方向物流app -> 登录账号 -> 点击”我的”-> 点击”设置” -> 点击”密码管理” ->点击”修改支付密码” -> 设置密码 ->，设置完成后重新点击”线上支付”',
      });
      return;
    }
    const data = {};
    setMoney(values.amount);
    setFormData(values);
    // 弹出输入密码
    setShowPass(true);
  };

  // 全部提现
  const cashOutAll = () => {
    form.setFieldsValue({ amount: amount });
    console.log(amount);
  };

  const cashOutInfo = async () => {
    const res = await capital.get_history_withdraw_info({});
    if (res.status === 0) {
      const info = res.result;
      form.setFieldsValue({
        companyName: info.company_name,
        bankCard: info.bankCard,
        bank: info.bank,
      });
    } else {
      message.error(res.detail || res.description);
    }
  };

  // 输入密码点击完成
  const crashOut = async () => {
    if (!password) {
      message.error('请输入完整密码');
      return;
    }
    setLoading(true);
    const params = {
      ...formData,
      amount: formData.amount * 100,
      payPass: {
        passOne: password[0].value,
        passTwo: password[1].value,
        passThree: password[2].value,
        passFour: password[3].value,
        passFive: password[4].value,
        passSix: password[5].value,
      },
    };

    const res = await capital.crashOutMoney({ params });

    if (res.status === 0) {
      message.success('提现成功');
      setShowPass(false);
      router.back();
    } else {
      setErrorTxt(res.detail ? res.detail : res.description);
    }

    setLoading(false);
  };
  // 帮助文案
  const Help = () => {
    return <div style={{ fontSize: 12, lineHeight: '12px', marginTop: 3, color: '#333333' }}>可提现余额{amount}元</div>;
  };

  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  return (
    <div className={styles.root}>
      <Form {...formItemLayout} form={form} onFinish={onFinish} onFinishFailed={onFinishFailed}>
        <Form.Item
          label={
            <div>
              <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>提现金额
            </div>
          }>
          <Form.Item
            name="amount"
            noStyle
            validateFirst={true}
            rules={[
              {
                required: true,
                message: '提现金额不可为空',
              },
              { type: 'number', message: '请输入有效的数字', transform: value => Number(value) },
              {
                validator: (rule, value) => {
                  console.log(typeof value);
                  console.log(typeof amount);
                  if (value * 1 > amount * 1) {
                    form.setFieldsValue({ amount });
                  } else {
                    return Promise.resolve();
                  }
                },
              },
              {
                pattern: /^\d+(\.?\d{1,2})?$/,
                message: '提现金额只能是数字，最多!',
              },
            ]}>
            <Input placeholder="请输入提现金额" style={{ width: 264 }} addonAfter={<span>元</span>} />
          </Form.Item>
          <a
            style={{ marginLeft: 12, fontSize: 14, color: '#477AEF', position: 'relative', lineHeight: '32px' }}
            onClick={cashOutAll}>
            全部提现
          </a>
          <Help />
        </Form.Item>
        <Form.Item
          label="企业名称"
          name="companyName"
          rules={[
            {
              required: true,
              message: '企业名称不可为空',
            },
          ]}>
          <Input placeholder="请输入企业名称" style={{ width: 264 }} />
        </Form.Item>

        <Form.Item
          label="对公账户"
          name="bankCard"
          rules={[
            {
              required: true,
              message: '企业对公账号不可为空',
            },
            { type: 'number', message: '请输入有效的数字', transform: value => Number(value) },
          ]}
          validateFirst={true}>
          <Input placeholder="请输入账户号码" maxLength={30} style={{ width: 264 }} />
        </Form.Item>
        <Form.Item
          label="开户行"
          name="bank"
          rules={[
            {
              required: true,
              message: '开户行不可为空',
            },
          ]}>
          <Input placeholder="请输入开户行" maxLength={20} style={{ width: 264 }} />
        </Form.Item>

        <Form.Item
          label="提现原因"
          name="reason"
          rules={[
            {
              required: true,
              message: '提现原因不可为空',
            },
          ]}>
          <Select placeholder="请选择提现原因" style={{ width: 264 }}>
            <Select.Option key={1} value={'运费结余'}>
              运费结余
            </Select.Option>
            <Select.Option key={3} value={'其他'}>
              其他
            </Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label={
            <div>
              <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>详细说明
            </div>
          }
          name="detail"
          rules={[
            {
              min: 4,
              message: '不可少于4个字符',
            },
            {
              max: 100,
              message: '最多填写100个字符',
            },
          ]}>
          <Input.TextArea
            placeholder="请输入4-100个字符的详细说明"
            autosize={{ minRows: 5 }}
            maxLength={100}
            style={{ width: 480 }}
          />
        </Form.Item>
        <Form.Item {...tailFormItemLayout} style={{ marginLeft: 87 }}>
          <Button htmlType="submit" type="primary" loading={loading}>
            发起提现
          </Button>
        </Form.Item>
      </Form>
      <Modal
        width={400}
        destroyOnClose
        maskClosable={false}
        visible={showPass}
        footer={null}
        onCancel={() => {
          setShowPass(false), setErrorTxt('');
        }}
        title="请输入支付密码">
        <div className={styles['password-block']}>
          <div className={styles['confirm-msg']}>
            <InfoCircleFilled style={{ fontSize: 18, verticalAlign: 'sub', marginRight: 6, color: '#faad14' }} />
            您的提现总额为<span className={styles.number}>{money}</span>元
          </div>
          <div
            className={styles['pass-ipt']}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>支付密码:</span>
            <PayPasswordInput
              onChange={value => {
                setPassWord(value);
              }}
            />
            <Tooltip
              placement="topRight"
              title={
                '进入方向物流app -> 登录账号 -> 点击”我的”-> 点击”设置” -> 点击”密码管理” ->点击”修改支付密码” -> 设置密码'
              }>
              <span style={{ color: '#477AEF' }}>忘记密码？</span>
            </Tooltip>
          </div>
          <div className={styles['error-msg']}>{errorTxt}</div>
          <div className={styles.btn}>
            <Button type="primary" onClick={crashOut}>
              完成
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CashOutForm;
