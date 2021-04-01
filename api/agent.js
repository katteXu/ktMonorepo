import request from './request';
// 添加货主
const addGoodsOwner = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v_admin/agent/agentAddGoodsOwner',
    data: params,
  });
};

// 代理商用户
const getGoodsOwnerList = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v_admin/agent/agentUserCompanyListSimple',
    params,
  });
};
// 代理商用户详细列表
const getGoodsOwnerInfoList = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v_admin/agent/agentUserListDetailTwo',
    params,
  });
};

// 短信发送
const sendSms = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v_admin/agent/agentSendSms',
    data: params,
  });
};

// 货主解绑
const removeGoodsOwner = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v_admin/agent/agentDeleteGoodsOwner',
    data: params,
  });
};

// 结算汇总
const getUserListTwo = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v_admin/agent/agentUserListTwo',
    params,
  });
};

// 企业详情
const getUserListTwoDetail = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v_admin/agent/agentUserListTwoDetail',
    params,
  });
};

// 企业详情
const getUserListTwoDetailTwo = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v_admin/agent/agentUserListTwoDetailTwo',
    params,
  });
};

// 运单明显
const getTransportList = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v_admin/agent/agentUserTransportList',
    params,
  });
};
// 获取默认表头
const getTitleList = () => {
  return request({
    method: 'get',
    url: 'api/v_admin/agent/agentGetTitleList',
  });
};

// 获取自定义表头
const getOwnerTitleList = () => {
  return request({
    method: 'get',
    url: 'api/v_admin/agent/getAgentTitle',
  });
};

// 提交表头
const saveOwnerTitle = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v_admin/agent/bindAgentTransportTitle',
    data: params,
  });
};

// 获取货主姓名
const getNameByMobile = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/user/user_info_by_mobile',
    params,
  });
};
export default {
  addGoodsOwner,
  getGoodsOwnerList,
  getGoodsOwnerInfoList,
  sendSms,
  removeGoodsOwner,
  getUserListTwo,
  getUserListTwoDetail,
  getUserListTwoDetailTwo,
  getTransportList,
  getTitleList,
  getOwnerTitleList,
  saveOwnerTitle,
  getNameByMobile,
};
