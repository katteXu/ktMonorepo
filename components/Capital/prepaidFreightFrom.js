import { useState, useEffect } from 'react';
import { InfoCircleTwoTone } from '@ant-design/icons';
import { Input, Button, Select, Modal, message, Form } from 'antd';
import styles from './styles.less';
import PayPasswordInput from '@components/common/PayPasswordInput';
import { capital, getUserInfo } from '@api';
const formItemLayout = {
  labelAlign: 'left',
  labelCol: { span: 5 },
  wrapperCol: { span: 19 },
};
const { Option } = Select;

// 提现表单
const CashOutForm = ({ onCancel, amount, refresh }) => {
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
  const [captainList, setCaptainList] = useState([]);
  useEffect(() => {
    getUser();
    goPrePayFcList();
  }, []);

  const getUser = async () => {
    const { userId } = localStorage;
    const res = await getUserInfo({ userId });
    if (res.status === 0) {
      const hasPayPass = res.result.hasPayPass;
      return hasPayPass;
    }
  };

  const goPrePayFcList = async () => {
    const params = {
      page: 1,
      limit: 100,
    };
    const { status, result, detail, description } = await capital.goPrePayFcList({ params });
    if (!status) {
      setCaptainList(result.data);
    } else {
      message.error(detail || description);
      setLoading(false);
    }
  };

  // 提交数据
  const onFinish = async values => {
    const hasPayPass = await getUser();
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
    onCancel();
    setShowPass(true);
    form.resetFields();
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

    const res = await capital.goPrePayTransport({ params });

    if (res.status === 0) {
      message.success('预付运费成功');
      setShowPass(false);
      refresh();
    } else {
      setErrorTxt(res.detail ? res.detail : res.description);
    }

    setLoading(false);
  };

  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  return (
    <div>
      <Form {...formItemLayout} form={form} onFinish={onFinish} onFinishFailed={onFinishFailed}>
        <Form.Item
          label="车队长"
          name="userId"
          rules={[
            {
              required: true,
              message: '车队长不可为空',
            },
          ]}>
          <Select placeholder="请选择车队长" allowClear>
            {captainList.map(item => (
              <Option key={item.id} value={item.id}>
                {item.name}
                <span style={{ marginLeft: 8 }}>{item.username}</span>
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="amount"
          validateFirst={true}
          label="预付金额"
          rules={[
            {
              required: true,
              message: '预付金额不可为空',
            },
            {
              type: 'number',
              message: '请输入有效的数字',
              transform: value => Number(value),
            },
            {
              validator: (rule, value) => {
                if (value > +amount) {
                  form.setFieldsValue({
                    amount: +(amount.split('.')[0] + '.' + amount.split('.')[1].slice(0, 2)),
                  });
                } else if (!/^\d+(\.?\d{1,2})?$/.test(value)) {
                  return Promise.reject('预付金额只能是数字，最多两位小数!');
                } else {
                  return Promise.resolve();
                }
              },
            },
          ]}>
          <Input placeholder="请输入预付金额" />
        </Form.Item>

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
              钱包余额
            </div>
          }
          // label="钱包余额"
        >
          <div>{amount}</div>
        </Form.Item>

        <div style={{ textAlign: 'right' }}>
          <Button
            size="default"
            onClick={() => {
              form.resetFields(), onCancel();
            }}>
            取消
          </Button>
          <Button size="default" type="primary" style={{ marginLeft: 8 }} htmlType="submit" loading={loading}>
            预付
          </Button>
        </div>
      </Form>
      <Modal
        width={400}
        destroyOnClose
        maskClosable={false}
        visible={showPass}
        footer={null}
        onCancel={() => {
          setShowPass(false);
          form.resetFields();
          setErrorTxt('');
          setPassWord();
        }}
        title="请输入支付密码">
        <div className={styles['password-block']}>
          <div className={styles['confirm-msg']}>
            <InfoCircleTwoTone style={{ fontSize: 18, verticalAlign: 'sub', marginRight: 6 }} twoToneColor="#faad14" />
            您的预付金额为<span className={styles.number}>{money}</span>元
          </div>
          <div className={styles['pass-ipt']}>
            <PayPasswordInput
              onChange={value => {
                setPassWord(value);
              }}
            />
          </div>
          <div className={styles['error-msg']}>{errorTxt}</div>
          <div className={styles.btn}>
            <Button type="primary" onClick={crashOut}>
              预付
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CashOutForm;
