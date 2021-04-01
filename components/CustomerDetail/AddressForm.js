import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Button } from 'antd';
import { useState, useEffect } from 'react';
import AreaPicker from '@components/AreaPicker';
import { getPlaceSearch } from '@components/Map';
import { getAddressLabel, getAddressCode } from '@utils/common';
// 表单布局
const formItemLayout = {
  labelAlign: 'left',
  labelCol: { span: 5 },
  wrapperCol: { span: 18 },
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

const AddressForm = ({ form, formData = {}, onSubmit, onClose }) => {
  const { getFieldDecorator } = form;
  const { province, city, district } = formData;
  const [loading, setLoading] = useState(false);

  // 地址定位验证
  const [addressRules, setAddressRules] = useState({});
  // 提交数据
  const handleSubmit = e => {
    e.preventDefault();
    setLoading(true);
    form.validateFields(async (err, values) => {
      if (err) {
        console.log(err);
        setLoading(false);
        return false;
      }

      const {
        loadContactMobile,
        loadContactName,
        loadContact2Name,
        loadContact2Mobile,
        loadDetailAddress,
        upAndDownPos,
        loadAddressName,
      } = values;

      const keywords = getAddressLabel(upAndDownPos).join() + loadDetailAddress;
      // 获取定位坐标
      const points = await getPlaceSearch({ keywords });
      if (points && points.length === 0) {
        setAddressRules({
          help: '地址定位失败',
          status: 'error',
        });
        setLoading(false);
        return false;
      }

      const [loadProvince, loadCity, loadDistrict] = getAddressLabel(upAndDownPos);
      const [privinceCode, cityCode, countyCode] = getAddressCode(upAndDownPos);

      const [loadLongitude, loadLatitude] = points[0].location.split(',');
      const data = {
        loadContactMobile,
        loadContactName,
        loadContact2Name,
        loadContact2Mobile,
        loadDetailAddress,
        loadProvince,
        loadCity,
        loadDistrict,
        loadLongitude,
        loadLatitude,
        loadAddressName,
        countyCode,
      };
      if (typeof onSubmit === 'function') {
        onSubmit(data);
      }

      setLoading(false);
    });
  };

  return (
    <Form {...formItemLayout} onSubmit={handleSubmit}>
      <Form.Item label="地址名称">
        {getFieldDecorator('loadAddressName', {
          initialValue: formData.loadAddressName || '',
          validateFirst: true,
          rules: [
            {
              required: true,
              message: '请输入地址名称',
            },

            {
              pattern: /^[\u4e00-\u9fa5（）]+$/,
              message: '只能是汉字或（）',
            },
            {
              max: 15,
              message: '最多15个字符',
            },
          ],
        })(<Input placeholder="请输入地址名称" />)}
      </Form.Item>

      <Form.Item label="装卸位置" required>
        {getFieldDecorator('upAndDownPos', {
          initialValue: province && city && district ? [province, city, district] : [],
          rules: [
            {
              required: true,
              message: '请输入装卸位置',
            },
          ],
        })(<AreaPicker useCode={true} />)}
      </Form.Item>

      <Form.Item label="详细地址" required help={addressRules.help} validateStatus={addressRules.status}>
        {getFieldDecorator('loadDetailAddress', {
          initialValue: formData.detailAddress,
          rules: [
            {
              required: true,
              message: '请输入详细地址',
            },
          ],
        })(<Input placeholder="请输入详细地址" onChange={() => setAddressRules({})} />)}
      </Form.Item>

      <Form.Item label="联系人1">
        {getFieldDecorator('loadContactName', {
          initialValue: formData.contactName,
          validateFirst: true,
          rules: [
            {
              required: true,
              message: '请输入联系人1的姓名',
            },
            {
              pattern: /^(?:[\u4e00-\u9fa5·]{2,16})$/,
              message: '姓名只能是汉字',
            },
            {
              max: 10,
              message: '联系人姓名的长度不能超过10',
            },
          ],
        })(<Input placeholder="请输入企业联系人" />)}
      </Form.Item>

      <Form.Item label="联系人1电话">
        {getFieldDecorator('loadContactMobile', {
          initialValue: formData.contactMobile,
          validateFirst: true,
          rules: [
            {
              required: true,
              message: '请输入联系人1的电话',
            },
            {
              pattern: /^(?:(?:\+|00)86)?1\d{10}$/,
              message: '电话的格式不正确',
            },
          ],
        })(<Input placeholder="请输入联系人电话" />)}
      </Form.Item>

      <Form.Item
        label={
          <div>
            <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>联系人2
          </div>
        }
        // label="联系人2"
      >
        {getFieldDecorator('loadContact2Name', {
          initialValue: formData.contact2Name,
          validateFirst: true,
          rules: [
            {
              pattern: /^(?:[\u4e00-\u9fa5·]{2,16})$/,
              message: '姓名只能是汉字',
            },
            {
              max: 10,
              message: '联系人姓名的长度不能超过10',
            },
          ],
        })(<Input placeholder="请输入企业联系人" />)}
      </Form.Item>

      <Form.Item
        label={
          <div>
            <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>联系人2电话
          </div>
        }
        // label="联系人2电话"
      >
        {getFieldDecorator('loadContact2Mobile', {
          initialValue: formData.contact2Mobile,
          rules: [
            {
              pattern: /^(?:(?:\+|00)86)?1\d{10}$/,
              message: '电话的格式不正确',
            },
          ],
        })(<Input placeholder="请输入联系人电话" />)}
      </Form.Item>

      <div style={{ textAlign: 'center', margin: '15px 0' }}>
        <Button size="default" onClick={() => onClose()}>
          取消
        </Button>
        <Button size="default" type="primary" style={{ marginLeft: 30 }} htmlType="submit" loading={loading}>
          提交
        </Button>
      </div>
    </Form>
  );
};

export default Form.create({ name: 'addressForm' })(AddressForm);
