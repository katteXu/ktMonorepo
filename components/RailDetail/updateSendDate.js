import { useState } from 'react';
import { Input, Button, DatePicker, Row, Col, Form } from 'antd';
import moment from 'moment';
// 表单布局
const formItemLayout = {
  labelAlign: 'left',
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};

const UpdateForm = ({ onSubmit, onClose, startLoadTime, lastLoadTime, initValue }) => {
  const [form] = Form.useForm();
  const [begin, setBegin] = useState(() => {
    // return '2020-04-25 20:15:00';
    return startLoadTime;
  });

  const [end, setEnd] = useState(() => {
    return lastLoadTime;
  });

  const handleSubmit = values => {
    const params = {
      loadTime: [values.begin, values.end],
    };

    onSubmit && onSubmit(params);
  };

  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  return (
    <Form
      {...formItemLayout}
      onFinish={handleSubmit}
      onFinishFailed={onFinishFailed}
      initialValues={{
        begin: moment(begin),
      }}
      form={form}
      autoComplete="off">
      <Form.Item
        label={
          <div>
            <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>当前时间
          </div>
        }
        //  label="当前时间"
        style={{ marginBottom: -18 }}>
        <span>{initValue}</span>
      </Form.Item>
      <Row>
        <Col span={4} style={{ textAlign: 'right', lineHeight: '40px' }}>
          发货时间：
        </Col>
        <Col span={9}>
          <Form.Item
            name="begin"
            validateFirst={true}
            rules={[
              { required: true, message: '开始时间不可为空' },
              {
                validator: (rule, value, callback) => {
                  if (moment(begin) < moment()) return Promise.resolve();
                  if (value < moment()) return Promise.reject('不可小于当前时间');
                  return Promise.resolve();
                },
              },
            ]}>
            <DatePicker
              style={{ minWidth: 162 }}
              showToday={false}
              placeholder="开始时间"
              disabled={moment(begin) < moment()}
              showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
            />
          </Form.Item>
        </Col>
        <Col span={2} style={{ lineHeight: '39px', textAlign: 'center' }}>
          至
        </Col>
        <Col span={9}>
          <Form.Item
            wrapperCol={24}
            name="end"
            validateFirst={true}
            rules={[
              { required: true, message: '结束时间不可为空' },
              {
                validator: (rule, value) => {
                  if (value <= form.getFieldValue('begin')) return Promise.reject('结束时间不可小于开始时间');
                  return Promise.resolve();
                },
              },
            ]}>
            <DatePicker
              style={{ minWidth: 162 }}
              showToday={false}
              placeholder="结束时间"
              showTime={{ defaultValue: moment('23:59:59', 'HH:mm:ss') }}
            />
          </Form.Item>
        </Col>
      </Row>
      {/* </Form.Item> */}
      <div style={{ textAlign: 'right' }}>
        <Button onClick={onClose}>取消</Button>
        <Button style={{ marginLeft: 8 }} htmlType="submit" type="primary">
          确定
        </Button>
      </div>
    </Form>
  );
};

export default UpdateForm;
