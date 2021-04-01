import request from './request';

const get_token = ({ params } = {}) => {
  params = {
    ...params,
  };

  return request({
    method: 'get',
    url: 'api/v1/get_upload_file_token',
    params,
  });
};

const uploadInfo = ({ params, userId } = {}) => {
  return request({
    method: 'post',
    url: `api/v1/user/${userId}`,
    data: params,
  });
};

const getSms = ({ phone } = {}) => {
  return request({
    method: 'get',
    url: `api/v1/sms/send_verify_sms?mobile=${phone}`,
  });
};

const resetPasswordBySms = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/user/reset_password_by_sms',
    data: params,
  });
};

const getInvoiceInfo = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/invoice/getInvoiceInfo',
    params,
  });
};

const addInvoiceInfo = ({ params } = {}) => {
  params = {
    ...params,
  };

  return request({
    method: 'get',
    url: 'api/v1/invoice/addInvoiceInfo',
    params,
  });
};

const updateInvoiceInfo = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/invoice/updateInvoiceInfo',
    data: { data: params },
  });
};

const uploadUserHeadIcon = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/user/updateHeadIcon',
    data: params,
  });
};

export default {
  get_token,
  uploadInfo,
  getSms,
  resetPasswordBySms,
  getInvoiceInfo,
  addInvoiceInfo,
  updateInvoiceInfo,
  uploadUserHeadIcon,
};
