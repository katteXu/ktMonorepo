import { Input, Button, Form, Select, message } from 'antd';
import { useState } from 'react';
import { Status, ChildTitle } from '@components';
import CompanySearcher from './CompanySearcher';
import { customer } from '@api';
import router from 'next/router';
import styles from './styles.less';
const { Option } = Select;
// 表单布局
const formItemLayout = {
  labelAlign: 'left',
  // labelCol: { span: 5 },
  wrapperCol: { span: 19 },
};
const tailFormItemLayout = {
  wrapperCol: { offset: 5 },
};

// 名称验证
const name_rules = [
  {
    required: true,
    whitespace: true,
    message: '内容不可为空',
  },
  {
    pattern: /^[\u4E00-\u9FA5\uf900-\ufa2d·s]{2,10}$/,
    message: '内容长度为2-10个汉字',
  },
];

// 身份证验证
const idcard_rules = [
  {
    pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
    message: '请输入有效的身份证号',
  },
];

const addCustomerForm = () => {
  const [loading, setLoading] = useState(false);

  // 提交数据
  const onFinish = async values => {
    setLoading(true);

    const params = {
      ...values,
    };

    const res = await customer.create_customer({ params });
    if (res.status === 0) {
      message.success('客户创建成功');
      router.push('/customerManagement/company');
    } else {
      message.error(`${res.detail || res.description}`);
    }

    setLoading(false);
  };

  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  return (
    <div style={{ marginLeft: 32 }} className={styles.addCustomer}>
      <Form {...formItemLayout} onFinish={onFinish} onFinishFailed={onFinishFailed} initialValues={{}}>
        <Form.Item
          label="客户名称"
          name="companyName"
          validateFirst={true}
          rules={[
            {
              required: true,
              message: '请输入客户名称',
            },
            // {
            //   pattern: /^[\u4e00-\u9fa5（）\(\)]+$/,
            //   message: '客户名称只能是汉字、()',
            // },
            // {
            //   max: 30,
            //   message: '客户名称长度不能超过30',
            // },
          ]}>
          <CompanySearcher placeholder="请输入客户名称" keyWord="kw" getRemoteData={customer.getCompanyByName} />
        </Form.Item>

        <Form.Item label="客户姓名" name="companyContactName" rules={name_rules} validateFirst={true}>
          <Input placeholder="请输入客户姓名" style={{ width: 200 }} />
        </Form.Item>

        <Form.Item
          label="合同类型"
          name="customerType"
          rules={[
            {
              required: true,
              message: '合同类型不可为空',
            },
          ]}>
          <Select placeholder="请选择合同类型" style={{ width: 264 }}>
            {Status.customerType.map((item, key) => {
              return <Option value={item.value}>{item.name}</Option>;
            })}
          </Select>
        </Form.Item>

        <Form.Item label="所属职务" name="position" rules={name_rules} validateFirst={true}>
          <Input placeholder="请输入所属职务" style={{ width: 200 }} />
        </Form.Item>

        <Form.Item
          label="客户属性"
          name="attribute"
          rules={[
            {
              required: true,
              message: '客户属性不可为空',
            },
          ]}>
          <Select placeholder="请选择客户属性" style={{ width: 264 }}>
            {Status.customerAttribute.map((item, key) => {
              return <Option value={item.value}>{item.name}</Option>;
            })}
          </Select>
        </Form.Item>

        <Form.Item
          label="联系电话"
          name="companyContactMobile"
          rules={[
            {
              required: true,
              message: '请输入联系电话',
            },
            {
              pattern: /^(((\d{3,4}-)?[0-9]{7,8})|(1(3|4|5|6|7|8|9)\d{9}))$/,
              message: '不符合座机号和手机号标准',
            },
          ]}>
          <Input placeholder="请输入联系电话" style={{ width: 200 }} />
        </Form.Item>

        <Form.Item
          label="客户地址"
          name="detailAddress"
          rules={[
            {
              required: true,
              whitespace: true,
              message: '内容不可为空',
            },
          ]}
          validateFirst={true}>
          <Input placeholder="请输入客户地址" />
        </Form.Item>

        <Form.Item
          label="标签"
          name="tag"
          rules={[
            {
              required: true,
              message: '标签不可为空',
            },
          ]}>
          <Input placeholder="请输入标签" maxLength={30} />
        </Form.Item>

        <ChildTitle style={{ margin: '0 0 29px -32px' }}>
          <div
            style={{
              fontSize: 16,
              color: '#333333',
              fontWeight: 600,
              position: 'relative',
              top: 1,
            }}>
            开票信息
          </div>
        </ChildTitle>

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
              社会信用代码
            </div>
          }
          name="creditCode"
          validateFirst={true}
          rules={[
            {
              pattern: /^[A-Z0-9]{18}$/,
              message: '社会信用代码只能输入数字和大写字母',
            },
          ]}>
          <Input maxLength={18} placeholder="请输入社会信用代码" style={{ width: 264 }} />
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
              开户行
            </div>
          }
          name="accountBank"
          rules={[{ pattern: /^[\u2E80-\u9FFF]+$/, message: '开户行只能输入汉字' }]}>
          <Input placeholder="请输入开户行" style={{ width: 264 }} />
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
              单位地址
            </div>
          }
          name="invoiceAddress"
          rules={[]}>
          <Input placeholder="请输入单位地址" />
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
              对公账号
            </div>
          }
          name="publicAccount"
          rules={[{ pattern: /^[0-9]{9,24}$/, message: '对公账号只能输入9-24位数字' }]}>
          <Input placeholder="请输入对公账号" style={{ width: 264 }} />
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
              法人姓名
            </div>
          }
          name="corporateName"
          rules={[
            {
              pattern: /^[\u4E00-\u9FA5\uf900-\ufa2d·s]{2,10}$/,
              message: '内容长度为2-10个汉字',
            },
          ]}
          validateFirst={true}>
          <Input placeholder="请输入法人姓名" style={{ width: 200 }} />
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
              邮政编码
            </div>
          }
          name="postalCode"
          rules={[{ pattern: /^[0-9]{6}$/, message: '邮政编码只能输入6位数字' }]}
          validateFirst={true}>
          <Input placeholder="请输入邮政编码" style={{ width: 200 }} />
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
              法人身份证
            </div>
          }
          name="corporateIdCard"
          rules={idcard_rules}>
          <Input placeholder="请输入法人身份证" style={{ width: 264 }} />
        </Form.Item>

        <Form.Item {...tailFormItemLayout}>
          <Button type="primary" htmlType="submit" loading={loading}>
            创建
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default addCustomerForm;
