import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input } from 'antd';

const CreateTruck = ({ form: { getFieldDecorator }, fleetName }) => (
  <Form layout="horizontal" labelAlign="right" labelCol={{ span: 5 }} wrapperCol={{ span: 10 }}>
    <Form.Item
      label={
        <div>
          <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>货品编码
        </div>
      }
      // label="所属车队"
    >
      <span>{fleetName}</span>
    </Form.Item>
    <Form.Item label="车牌号：">
      {getFieldDecorator('trailerPlateNumber', {
        validateFirst: true,
        rules: [
          {
            required: true,
            message: '请输入车牌号!',
          },
          {
            pattern: /^(?:[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领 A-Z]{1}[A-HJ-NP-Z]{1}(?:(?:[0-9]{5}[DF])|(?:[DF](?:[A-HJ-NP-Z0-9])[0-9]{4})))|(?:[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领 A-Z]{1}[A-Z]{1}[A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9 挂学警港澳]{1})$/i,
            message: '车牌号格式不正确!',
          },
        ],
      })(<Input placeholder="请输入车牌号" />)}
    </Form.Item>
    <Form.Item label="司机姓名：">
      {getFieldDecorator('driverName', {
        validateFirst: true,
        rules: [
          {
            required: true,
            message: '请输入司机姓名!',
          },
          {
            pattern: /^[\u4e00-\u9fa5]+$/,
            message: '姓名只能是汉字!',
          },
          {
            min: 2,
            message: '姓名长度最少 2 个汉字',
          },
        ],
      })(<Input placeholder="请输入司机姓名" />)}
    </Form.Item>
    <Form.Item label="驾驶证：">
      {getFieldDecorator('driverLicenseNumber', {
        validateFirst: true,
        rules: [
          {
            required: true,
            message: '请输入驾驶证!',
          },
        ],
      })(<Input placeholder="请输入驾驶证" />)}
    </Form.Item>
    <Form.Item label="行驶证：">
      {getFieldDecorator('truckLicenseNumber', {
        validateFirst: true,
        rules: [
          {
            required: true,
            message: '请输入行驶证!',
          },
        ],
      })(<Input placeholder="请输入行驶证" />)}
    </Form.Item>
    <Form.Item label="从业资格证：">
      {getFieldDecorator('qualificationNumber', {
        validateFirst: true,
        rules: [
          {
            required: true,
            message: '请输入从业资格证!',
          },
        ],
      })(<Input placeholder="请输入从业资格证" />)}
    </Form.Item>
    <Form.Item label="道路运输证：">
      {getFieldDecorator('roadNumber', {
        validateFirst: true,
        rules: [
          {
            required: true,
            message: '请输入道路运输证!',
          },
        ],
      })(<Input placeholder="请输入道路运输证" />)}
    </Form.Item>
    <Form.Item label="核定载重：">
      {getFieldDecorator('truckLoad', {
        validateFirst: true,
        rules: [
          {
            required: true,
            message: '请输入核定载重!',
          },
          {
            pattern: /^\d+(\.?\d{1,2})?$/,
            message: '只能是数字，最多两位小数!',
          },
          {
            validator: (rule, value, cb) => {
              if (+value > 100) {
                cb('最大不能超过 100 吨');
              }

              if (+value < 1) {
                cb('最大不能小于 1 吨');
              }

              cb();
            },
          },
        ],
      })(<Input placeholder="请输入核定载重" />)}
    </Form.Item>
  </Form>
);

export default Form.create()(CreateTruck);
