/**
 * Created by qiaoyuning on 2019/9/9
 */
import request from './request';

const getTableData = ({ params } = {}) => {
  params = {
    limit: 10,
    page: 1,
    ...params,
  };
  return request({
    method: 'get',
    url: 'api/v1/user/get_poundbill',
    params,
  });
};

const deleteReport = ({ params } = {}) => {
  params = {
    ...params,
  };

  return request({
    method: 'get',
    url: 'api/v1/user/delete_poundbill',
    params,
  });
};

const get_poundbill_month_report = ({ params } = {}) => {
  params = {
    ...params,
  };

  return request({
    method: 'get',
    url: 'api/v1/user/get_poundbill_month_report',
    params,
  });
};

const new_get_poundbill_month_report = ({ params } = {}) => {
  params = {
    ...params,
  };

  return request({
    method: 'get',
    url: 'api/v1/user/new_get_pound_bill_month_report',
    params,
  });
};

// normal 恢复删除榜单
const getBackDeletePoundBill = ({ params } = {}) =>
  request({
    method: 'get',
    url: 'api/v1/pound/getBackDeletePoundBill',
    params,
  });

export default {
  getTableData,
  deleteReport,
  get_poundbill_month_report,
  getBackDeletePoundBill,
  new_get_poundbill_month_report,
};
