import request from './request';

const getTableData = ({ params } = {}) => {
  params = {
    limit: 10,
    page: 1,
    ...params,
  };
  return request({
    method: 'get',
    url: 'api/v1/weChatInfo/bindOpenIdList',
    params,
  });
};

const deleteWx = ({ params } = {}) => {
  params = {
    ...params,
  };
  return request({
    method: 'get',
    url: 'api/v1/weChatInfo/deleteBindOpenId',
    params,
  });
};
export default {
  getTableData,
  deleteWx,
};
