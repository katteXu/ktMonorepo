import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, DatePicker, message } from 'antd';
import moment from 'moment';
import { Component } from 'react';

class SetLoadTimeForm extends Component {
  state = {};

  handleSubmit = e => {
    e.preventDefault();
    const {
      form: { validateFields },
      submit,
      start,
    } = this.props;
    validateFields((err, { loadStartTime, loadEndTime }) => {
      if (loadStartTime) {
        if (loadStartTime.valueOf() <= moment(start).valueOf()) {
          message.error('开始时间要大于当前时间');
          return;
        }

        if (loadStartTime.valueOf() >= loadEndTime.valueOf()) {
          message.error('开始时间要小于结束时间');
          return;
        }
      } else {
        if (loadEndTime.valueOf() <= moment().valueOf()) {
          message.error('结束时间要大于当前时间');
          return;
        }
      }

      if (!err) {
        submit(
          loadStartTime ? loadStartTime.format('YYYY-MM-DD HH:mm:ss') : start,
          loadEndTime.format('YYYY-MM-DD HH:mm:ss')
        );
      }
    });
  };

  render() {
    const {
      form: { getFieldDecorator },
      start,
      end,
      loading,
      cancel,
    } = this.props;

    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };

    // 专线已经开始，则不能修改专线开始时间
    const hasStarted = moment().valueOf() > moment(start).valueOf();

    return (
      <Form {...formItemLayout} onSubmit={this.handleSubmit}>
        {start && (
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>当前时间
              </div>
            }
            // label="当前时间"
          >
            <span>
              {start} ~ {end}
            </span>
          </Form.Item>
        )}

        {!hasStarted && (
          <Form.Item label="修改开始时间">
            {getFieldDecorator('loadStartTime', {
              rules: [
                {
                  required: true,
                  message: '请输入专线开始时间',
                },
              ],
            })(<DatePicker style={{ width: '90%' }} showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }} />)}
          </Form.Item>
        )}

        <Form.Item label="修改结束时间">
          {getFieldDecorator('loadEndTime', {
            rules: [
              {
                required: true,
                message: '请输入专线结束时间',
              },
            ],
          })(<DatePicker style={{ width: '90%' }} showTime={{ defaultValue: moment('23:59:59', 'HH:mm:ss') }} />)}
        </Form.Item>

        <Form.Item wrapperCol={{ span: 24 }} style={{ textAlign: 'center' }}>
          <Button onClick={cancel}>取消</Button>
          <Button loading={loading} type="primary" htmlType="submit" style={{ marginLeft: 40 }}>
            确认修改
          </Button>
        </Form.Item>
      </Form>
    );
  }
}

export default Form.create()(SetLoadTimeForm);
