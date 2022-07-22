import { useState } from 'react';
import { CheckCircleTwoTone, MinusCircleOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, Modal, Input, Row, Col } from 'antd';
import AreaPicker from '../AreaPicker';
import { getPlaceSearch } from '../Map';
import styles from './customer.less';
import { getAddressLabel, getAddressCode } from '@utils/common';
import { customer } from '../../api';
// 表单布局
const formItemLayout = {
  labelAlign: 'left',
  labelCol: { span: 5 },
  wrapperCol: { span: 18 },
};

// 输入验证
const input_rules = {
  rules: [{ required: true, whitespace: true, message: '内容不可为空' }],
};

// 下拉验证
const select_rules = {
  rules: [{ type: 'array', required: true, whitespace: true, message: '选项不可为空' }],
};

// 电话验证
const phone_rules = {
  rules: [
    {
      required: true,
      whitespace: true,
      message: '内容不可为空',
    },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入有效的联系电话',
    },
  ],
};

// 名称验证
const name_rules = {
  rules: [
    {
      required: true,
      whitespace: true,
      message: '内容不可为空',
    },
    {
      min: 2,
      message: '输入内容长度不能小于2',
    },
  ],
};

// 姓名验证
const userName_rules = {
  rules: [
    {
      required: true,
      whitespace: true,
      message: '内容不可为空',
    },
    {
      pattern: /^[\u4E00-\u9FA5\uf900-\ufa2d·s]{2,20}$/,
      message: '内容长度不能小于2个汉字',
    },
  ],
};

const CompanyForm = ({ form, onSubmit, onClose }) => {
  const { getFieldDecorator } = form;

  // 提交loading
  const [btnLoading, setBtnLoading] = useState(false);
  // 地址定位验证
  const [addressRules, setAddressRules] = useState({});
  // 收货人
  const [otherReceiver, setOther] = useState(false);
  // 重新加载父级列表
  const reload = () => {
    if (typeof onSubmit === 'function') {
      onSubmit();
    }
  };
  // 关闭当前弹窗
  const close = () => {
    if (typeof onClose === 'function') {
      onClose();
    }
  };
  // 提交表单
  const handleSubmit = e => {
    e.preventDefault();

    form.validateFields(async (err, values) => {
      if (err) {
        console.log(err);
        return;
      }

      const {
        companyName,
        companySimpleName,
        address,
        detailAddress,
        contactName,
        contactMobile,
        contact2Name,
        contact2Mobile,
      } = values;
      const keywords = getAddressLabel(address).join('') + detailAddress;
      // 获取定位坐标
      const points = await getPlaceSearch({ keywords });
      if (points.length === 0) {
        setAddressRules({
          help: '地址定位失败',
          status: 'error',
        });
        setBtnLoading(false);
        return;
      }
      const [province, city, district] = getAddressLabel(address);
      const [privinceCode, cityCode, countyCode] = getAddressCode(address);
      const [longitude, latitude] = points[0].location.split(',');
      const data = {
        companyName,
        companySimpleName,
        province,
        city,
        district,
        countyCode,
        detailAddress,
        contactName,
        contactMobile,
        contact2Name,
        contact2Mobile,
        longitude,
        latitude,
      };
      save(data);
    });
  };

  // 保存提交
  const save = async data => {
    setBtnLoading(true);

    const params = {
      class: 'TKAddress',
      data,
    };
    const res = await customer.addCustomer({ params });

    if (res.status === 0) {
      reload();
      Modal.confirm({
        icon: <CheckCircleTwoTone twoToneColor="#52c41a" />,
        title: '添加成功',
        content: '是否继续添加企业',
        okText: '继续',
        cancelText: '关闭',
        onOk: () => form.resetFields(),
        onCancel: () => close(),
      });
    } else {
      Modal.error({
        title: res.description,
        content: res.detail,
      });
    }

    setBtnLoading(false);
  };

  return (
    <Form {...formItemLayout} autoComplete="off">
      <Form.Item label="企业名称" required>
        {getFieldDecorator('companyName', name_rules)(<Input placeholder="请输入企业全称" />)}
      </Form.Item>
      <Form.Item label="企业简称" required>
        {getFieldDecorator('companySimpleName', input_rules)(<Input placeholder="请输入企业简称" />)}
      </Form.Item>
      <Form.Item label="企业地址" required>
        {getFieldDecorator(
          'address',
          select_rules
        )(<AreaPicker placeholder="请选择企业地址" useCode={true}></AreaPicker>)}
      </Form.Item>
      <Form.Item label="详细地址" required help={addressRules.help} validateStatus={addressRules.status}>
        {getFieldDecorator('detailAddress', {
          validateFirst: true,
          rules: [
            { required: true, whitespace: true, message: '内容不可为空' },
            { pattern: /^[ 0-9a-zA-Z\u4e00-\u9fa5 ]+$/, message: '内容只能是数字、字母或汉字' },
          ],
        })(<Input placeholder="请输入详细地址" onChange={() => setAddressRules({})} />)}
      </Form.Item>
      <Form.Item label="联系人" required>
        {getFieldDecorator('contactName', userName_rules)(<Input placeholder="请输入联系人姓名" />)}
      </Form.Item>
      <Form.Item label="联系人电话" required>
        {getFieldDecorator('contactMobile', phone_rules)(<Input maxLength={11} placeholder="请输入联系人电话" />)}
      </Form.Item>
      {otherReceiver ? (
        <>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>联系人1
              </div>
            }
            // label="联系人1"
          >
            {getFieldDecorator('contact2Name', userName_rules)(<Input placeholder="请输入联系人姓名" />)}
            <MinusCircleOutlined className={styles['remove-button']} onClick={() => setOther(false)} />
          </Form.Item>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>联系人电话1
              </div>
            }
            // label="联系人电话1"
          >
            {getFieldDecorator('contact2Mobile', phone_rules)(<Input maxLength={11} placeholder="请输入联系人电话" />)}
          </Form.Item>
        </>
      ) : (
        <Form.Item label=" " colon={false}>
          <Button type="link" style={{ padding: 0 }} onClick={() => setOther(true)}>
            新增联系人
          </Button>
        </Form.Item>
      )}
      <Row style={{ marginTop: 20 }}>
        <Col span={22} offset={1}>
          <Button onClick={handleSubmit} loading={btnLoading} block size="large" type="primary">
            提交
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default Form.create({ name: 'companyForm' })(CompanyForm);
