import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Content, Layout, Status, ChildTitle } from '@components';
import { Input, Button, Form, Select, message } from 'antd';
import styles from './customerDetail.less';
import { customer } from '@api';
import { getQuery } from '@utils/common';

const { Option } = Select;
// 表单布局
const formItemLayout = {
  labelAlign: 'left',
  labelCol: { span: 5 },
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

const CustomerDetail = props => {
  const [form] = Form.useForm();
  const routeView = {
    title: '我的客户',
    pageKey: 'company',
    longKey: 'customerManagement.company',
    breadNav: [
      '我的客户',
      <Link href="/customerManagement/company">
        <a>客户管理</a>
      </Link>,
      '客户详情',
    ],
    pageTitle: '客户详情',
    useBack: true,
  };
  const [edit, setedit] = useState(false);
  const [dataInfo, setDataInfo] = useState([]);

  // 提交数据
  const onFinish = async values => {
    const { id } = getQuery();
    const params = {
      ...values,
      id,
    };
    const res = await customer.modify_customer({ params });
    if (res.status === 0) {
      message.success('客户修改成功');
      getDetail();
      setedit(false);
    } else {
      message.error(`${res.detail || res.description}`);
    }
  };

  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  useEffect(() => {
    getDetail();
  }, []);

  useEffect(() => {
    form.setFieldsValue({
      companyContactName: dataInfo.companyContactName,
      customerType: dataInfo.customerType,
      attribute: dataInfo.attribute,
      tag: dataInfo.tag,
      position: dataInfo.position,
      detailAddress: dataInfo.detailAddress,
      companyContactMobile: dataInfo.companyContactMobile,
      creditCode: dataInfo.creditCode,
      accountBank: dataInfo.accountBank,
      invoiceAddress: dataInfo.invoiceAddress,
      publicAccount: dataInfo.publicAccount,
      corporateName: dataInfo.corporateName,
      postalCode: dataInfo.postalCode,
      corporateIdCard: dataInfo.corporateIdCard,
    });
  }, [dataInfo]);

  const getDetail = async () => {
    const { id } = getQuery();
    const params = {
      id,
    };

    const res = await customer.get_customer_detail({ params });

    if (res.status === 0) {
      setDataInfo(res.result);
    } else {
      message.error(`${res.detail || res.description}`);
    }
  };

  return (
    <Layout {...routeView}>
      <Content>
        <section>
          <ChildTitle style={{ margin: '8px 0 16px' }}>
            <div
              style={{
                fontSize: 16,
                color: '#333333',
                fontWeight: 700,
                position: 'relative',
                top: 1,
              }}>
              基本信息
            </div>
          </ChildTitle>
          <div className={styles.root} style={{ marginLeft: !edit ? 0 : 32 }}>
            <Form
              {...formItemLayout}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              form={form}
              initialValues={{}}>
              {!edit ? (
                <div className={styles.box}>
                  <label className={styles.boxLabel}>客户名称：</label>
                  <span className={styles.boxText}>{dataInfo.companyName || '-'}</span>
                </div>
              ) : (
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
                      客户名称
                    </div>
                  }>
                  <span>{dataInfo.companyName}</span>
                </Form.Item>
              )}

              {!edit ? (
                <div className={styles.box}>
                  <label className={styles.boxLabel}>客户姓名：</label>
                  <span className={styles.boxText}>{dataInfo.companyContactName || '-'}</span>
                </div>
              ) : (
                <Form.Item label="客户姓名" name="companyContactName" rules={name_rules} validateFirst={true}>
                  <Input placeholder="请输入客户姓名" style={{ width: 200 }} />
                </Form.Item>
              )}

              {!edit ? (
                <div className={styles.box}>
                  <label className={styles.boxLabel}>合同类型：</label>
                  <span className={styles.boxText}>{Status.customerTypeText[dataInfo.customerType] || '-'}</span>
                </div>
              ) : (
                <Form.Item
                  label="合同类型"
                  name="customerType"
                  rules={[
                    {
                      required: true,
                      message: '内容不可为空',
                    },
                  ]}>
                  <Select placeholder="请选择合同类型" style={{ width: 264 }}>
                    {Status.customerType.map((item, key) => {
                      return <Option value={item.value}>{item.name}</Option>;
                    })}
                  </Select>
                </Form.Item>
              )}

              {!edit ? (
                <div className={styles.box}>
                  <label className={styles.boxLabel}>所属职务：</label>
                  <span className={styles.boxText}>{dataInfo.position || '-'}</span>
                </div>
              ) : (
                <Form.Item label="所属职务" name="position" rules={name_rules} validateFirst={true}>
                  <Input placeholder="请输入所属职务" style={{ width: 200 }} />
                </Form.Item>
              )}

              {!edit ? (
                <div className={styles.box}>
                  <label className={styles.boxLabel}>客户属性：</label>
                  <span className={styles.boxText}>{Status.customerAttributeText[dataInfo.attribute] || '-'}</span>
                </div>
              ) : (
                <Form.Item
                  label="客户属性"
                  name="attribute"
                  rules={[
                    {
                      required: true,
                      message: '内容不可为空',
                    },
                  ]}>
                  <Select placeholder="请选择客户属性" style={{ width: 264 }}>
                    {Status.customerAttribute.map((item, key) => {
                      return <Option value={item.value}>{item.name}</Option>;
                    })}
                  </Select>
                </Form.Item>
              )}

              {!edit ? (
                <div className={styles.box}>
                  <label className={styles.boxLabel}>联系电话：</label>
                  <span className={styles.boxText}>{dataInfo.companyContactMobile || '-'}</span>
                </div>
              ) : (
                <Form.Item
                  label="联系电话"
                  name="companyContactMobile"
                  rules={[
                    {
                      required: true,
                      message: '内容不可为空',
                    },
                    {
                      pattern: /^(((\d{3,4}-)?[0-9]{7,8})|(1(3|4|5|6|7|8|9)\d{9}))$/,
                      message: '不符合座机号和手机号标准',
                    },
                  ]}>
                  <Input placeholder="请输入联系电话" style={{ width: 200 }} />
                </Form.Item>
              )}

              {!edit ? (
                <div className={styles.box}>
                  <label className={styles.boxLabel}>客户地址：</label>
                  <span className={styles.boxText}>{dataInfo.detailAddress || '-'}</span>
                </div>
              ) : (
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
              )}

              {!edit ? (
                <div className={styles.box}>
                  <label className={styles.boxLabel}>标签：</label>
                  <span className={styles.boxText}>{dataInfo.tag || '-'}</span>
                </div>
              ) : (
                <Form.Item
                  label="标签"
                  name="tag"
                  rules={[
                    {
                      required: true,
                      message: '内容不可为空',
                    },
                  ]}>
                  <Input placeholder="请输入标签" maxLength={30} />
                </Form.Item>
              )}
              <ChildTitle style={{ margin: '0 0 29px', marginLeft: !edit ? 0 : -32 }}>
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

              {!edit ? (
                <div className={styles.box}>
                  <label className={styles.boxLabel1}>社会信用代码：</label>
                  <span className={styles.boxText}>{dataInfo.creditCode || '-'}</span>
                </div>
              ) : (
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
                  // label="社会信用代码"
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
              )}

              {!edit ? (
                <div className={styles.box}>
                  <label className={styles.boxLabel1}>开户行：</label>
                  <span className={styles.boxText}>{dataInfo.accountBank || '-'}</span>
                </div>
              ) : (
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
                  // label="开户行"
                  name="accountBank"
                  rules={[
                    {
                      pattern: /^[\u2E80-\u9FFF]+$/,
                      message: '开户行只能输入汉字',
                    },
                  ]}>
                  <Input placeholder="请输入开户行" style={{ width: 264 }} />
                </Form.Item>
              )}

              {!edit ? (
                <div className={styles.box}>
                  <label className={styles.boxLabel1}>单位地址：</label>
                  <span className={styles.boxText}>{dataInfo.invoiceAddress || '-'}</span>
                </div>
              ) : (
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
                  // label="单位地址"
                  name="invoiceAddress"
                  rules={[]}>
                  <Input placeholder="请输入单位地址" />
                </Form.Item>
              )}

              {!edit ? (
                <div className={styles.box}>
                  <label className={styles.boxLabel1}>对公账号：</label>
                  <span className={styles.boxText}>{dataInfo.publicAccount || '-'}</span>
                </div>
              ) : (
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
                  // label="对公账号"
                  name="publicAccount"
                  rules={[
                    {
                      pattern: /^[0-9]{9,24}$/,
                      message: '对公账号只能输入9-24位数字',
                    },
                  ]}>
                  <Input placeholder="请输入对公账号" minLength={24} style={{ width: 264 }} />
                </Form.Item>
              )}

              {!edit ? (
                <div className={styles.box}>
                  <label className={styles.boxLabel1}>法人姓名：</label>
                  <span className={styles.boxText}>{dataInfo.corporateName || '-'}</span>
                </div>
              ) : (
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
                  // label="法人姓名"
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
              )}

              {!edit ? (
                <div className={styles.box}>
                  <label className={styles.boxLabel1}>邮政编码：</label>
                  <span className={styles.boxText}>{dataInfo.postalCode || '-'}</span>
                </div>
              ) : (
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
                  // label="邮政编码"
                  name="postalCode"
                  rules={[
                    {
                      pattern: /^[0-9]{6}$/,
                      message: '邮政编码只能输入6位数字',
                    },
                  ]}
                  validateFirst={true}>
                  <Input placeholder="请输入邮政编码" style={{ width: 200 }} />
                </Form.Item>
              )}

              {!edit ? (
                <div className={styles.box}>
                  <label className={styles.boxLabel1}>法人身份证：</label>
                  <span className={styles.boxText}>{dataInfo.corporateIdCard || '-'}</span>
                </div>
              ) : (
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
              )}

              <Form.Item {...tailFormItemLayout}>
                {!edit ? (
                  <Button type="primary" onClick={() => setedit(true)}>
                    编辑
                  </Button>
                ) : (
                  <div>
                    <Button type="primary" htmlType="submit">
                      保存
                    </Button>
                    <Button onClick={() => setedit(false)} style={{ marginLeft: 8 }}>
                      取消
                    </Button>
                  </div>
                )}
              </Form.Item>
            </Form>
          </div>
        </section>
      </Content>
    </Layout>
  );
};

export default CustomerDetail;
