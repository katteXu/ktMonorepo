import { useState } from 'react';
import { Input, Button, DatePicker, Row, Col, Form } from 'antd';
import moment from 'moment';
import styles from './styles.less';
// 表单布局
const formItemLayout = {
  labelAlign: 'left',

  wrapperCol: { span: 19 },
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
    <div className={styles.formSendData}>
      <Form
        className="small"
        {...formItemLayout}
        onFinish={handleSubmit}
        onFinishFailed={onFinishFailed}
        initialValues={{
          begin: moment(begin),
        }}
        form={form}
        autoComplete="off">
        <Form.Item label="当前时间">
          <span style={{ color: '#333333' }}>{initValue}</span>
        </Form.Item>
        <Row>
          <Col style={{ lineHeight: '32px', marginRight: 19, width: 70, color: '#333333' }}>发货时间:</Col>
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
                style={{ width: 200 }}
                showToday={false}
                placeholder="开始时间"
                disabled={moment(begin) < moment()}
                showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
              />
            </Form.Item>
          </Col>
          <div style={{ lineHeight: '33px', textAlign: 'center', display: 'inline-block', margin: '0 8px' }}>至</div>
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
                style={{ width: 200 }}
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
    </div>
  );
};

export default UpdateForm;
