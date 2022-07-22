import { useState, useEffect } from 'react';
import { MinusCircleOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Button } from 'antd';
import AreaPicker from '../AreaPicker';
import { getPlaceSearch } from '../Map';
import styles from './customer.less';
import { getAddressLabel, getAddressCode } from '@utils/common';
import router from 'next/router';
// 表单布局
const formItemLayout = {
  labelAlign: 'left',
  labelCol: { span: 3 },
  wrapperCol: { span: 6 },
};

const input_rules = {
  rules: [{ required: true, whitespace: true, message: '内容不可为空' }],
};

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

const CustomerForm = ({ form, formData, onSubmit, loadData }) => {
  const { getFieldDecorator } = form;

  // 提交loading
  const [loading, setLoading] = useState(false);
  // 地址定位验证
  const [addressRules, setAddressRules] = useState({});
  // 收货人
  const [otherReceiver, setOther] = useState(false);

  // setOther(true);
  useEffect(() => {
    if (formData.contact2Name) {
      setOther(true);
    }
  }, [formData]);
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
        companyContactMobile,
        companyContactName,
        companyName,
        companySimpleName,
        loadContactMobile,
        loadContactName,
        loadContact2Name,
        loadContact2Mobile,
        loadDetailAddress,
        upAndDownPos,
        loadAddressName,
      } = values;

      const keywords = getAddressLabel(upAndDownPos).join('') + loadDetailAddress;
      // 获取定位坐标
      const points = await getPlaceSearch({ keywords });
      if (points.length === 0) {
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
        companyContactMobile,
        companyContactName,
        companyName,
        companySimpleName,
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
      // 数据提交
      onSubmit(data);
      setLoading(false);
    });
  };

  return (
    <Form {...formItemLayout} onSubmit={handleSubmit}>
      <Form.Item label="企业名称" required>
        {getFieldDecorator('companyName', {
          validateFirst: true,
          rules: [
            {
              required: true,
              message: '请输入企业名称',
            },
            {
              pattern: /^[\u4e00-\u9fa5（）\(\)]+$/,
              message: '企业名称只能是汉字、()',
            },
            {
              max: 30,
              message: '企业名称长度不能超过30',
            },
          ],
        })(<Input placeholder="请输入企业名称" />)}
      </Form.Item>

      <Form.Item label="企业简称" required>
        {getFieldDecorator('companySimpleName', {
          validateFirst: true,
          rules: [
            {
              required: true,
              message: '请输入企业简称',
            },
            {
              pattern: /^[\u4e00-\u9fa5（）\(\)]+$/,
              message: '企业简称只能是汉字、()',
            },
            {
              max: 30,
              message: '企业简称长度不能超过30',
            },
          ],
        })(<Input placeholder="请输入企业简称" />)}
      </Form.Item>

      <Form.Item
        label={
          <div>
            <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>企业联系人
          </div>
        }
        // label="企业联系人"
      >
        {getFieldDecorator('companyContactName', {
          validateFirst: true,
          rules: [
            {
              min: 2,
              message: '联系人姓名的长度不能少于2',
            },
            {
              max: 10,
              message: '联系人姓名的长度不能超过10',
            },
            {
              pattern: /^[\u4e00-\u9fa5（）\(\)]+$/,
              message: '企业联系人只能是汉字',
            },
          ],
        })(<Input placeholder="请输入企业联系人" />)}
      </Form.Item>

      <Form.Item
        label={
          <div>
            <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>联系人电话
          </div>
        }
        // label="联系人电话"
      >
        {getFieldDecorator('companyContactMobile', {
          rules: [
            {
              pattern: /^(?:(?:\+|00)86)?1\d{10}$/,
              message: '电话的格式不正确',
            },
          ],
        })(<Input maxLength={11} placeholder="请输入联系人电话" />)}
      </Form.Item>

      <Form.Item label="地址名称">
        {getFieldDecorator('loadAddressName', {
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

      <Form.Item label="装卸位置" require>
        {getFieldDecorator('upAndDownPos', {
          rules: [
            {
              required: true,
              message: '请输入装卸位置',
            },
          ],
        })(<AreaPicker placeholder="请选择装卸位置" useCode={true}></AreaPicker>)}
      </Form.Item>

      <Form.Item label="详细地址" required help={addressRules.help} validateStatus={addressRules.status}>
        {getFieldDecorator('loadDetailAddress', {
          rules: [
            {
              required: true,
              message: '请输入详细地址',
            },
          ],
        })(<Input placeholder="请输入详细地址" onChange={() => setAddressRules({})} />)}
      </Form.Item>

      <Form.Item label="联系人" required>
        {getFieldDecorator('loadContactName', {
          validateFirst: true,
          rules: [
            {
              required: true,
              message: '请输入联系人',
            },
            {
              pattern: /^(?:[\u4e00-\u9fa5·]{2,16})$/,
              message: '联系人只能是汉字',
            },
          ],
        })(<Input placeholder="请输入联系人" />)}
      </Form.Item>

      <Form.Item label="联系人电话" required>
        {getFieldDecorator('loadContactMobile', {
          validateFirst: true,
          rules: [
            {
              required: true,
              message: '请输入联系人电话',
            },
            {
              pattern: /^(?:(?:\+|00)86)?1\d{10}$/,
              message: '电话的格式不正确',
            },
          ],
        })(<Input placeholder="请输入联系人电话" />)}
      </Form.Item>

      {otherReceiver ? (
        <>
          <Form.Item label="其他联系人">
            {getFieldDecorator('loadContact2Name', {
              validateFirst: true,
              rules: [
                {
                  required: true,
                  message: '请输入其他联系人的姓名',
                },
                {
                  pattern: /^(?:[\u4e00-\u9fa5·]{2,16})$/,
                  message: '姓名只能是汉字',
                },
              ],
            })(<Input placeholder="请输入联系人姓名" />)}
            <MinusCircleOutlined className={styles['remove-button']} onClick={() => setOther(false)} />
          </Form.Item>

          <Form.Item label="其他联系人电话">
            {getFieldDecorator('loadContact2Mobile', {
              validateFirst: true,
              rules: [
                {
                  required: true,
                  message: '请输入其他联系人电话',
                },
                {
                  pattern: /^(?:(?:\+|00)86)?1\d{10}$/,
                  message: '电话的格式不正确',
                },
              ],
            })(<Input maxLength={11} placeholder="请输入联系人电话" />)}
          </Form.Item>
        </>
      ) : (
        <Form.Item label=" " colon={false}>
          <Button type="link" style={{ padding: 0 }} onClick={() => setOther(true)}>
            新增联系人
          </Button>
        </Form.Item>
      )}
      <Form.Item label=" " colon={false}>
        <Button htmlType="submit" type="primary" loading={loading}>
          提交
        </Button>
        <Button style={{ marginLeft: 20 }} onClick={() => router.back()}>
          取消
        </Button>
      </Form.Item>
    </Form>
  );
};

export default Form.create({ name: 'custormer' })(CustomerForm);
