import request from './request';

// 质检化验单列表
const getDataListByGoods = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/inventory/saasGetInspectionReport',
    params,
  });
};

// 获取话化验单
const getDataList = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/inventory/saasGetInspectionReport',
    params,
  });
};

// 质检详情
const getDetail = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/inventory/getInspectionReportDetail',
    params,
  });
};

export default {
  getDataListByGoods,
  getDataList,
  getDetail,
};
