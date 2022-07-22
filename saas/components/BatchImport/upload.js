import personalApi from '../../api/personalCenter';
import OSS from 'ali-oss';
import Base64 from 'Base64';

const aliyunOSS = {
  bucket: 'kcsj',
  region: 'oss-cn-beijing',
  endpoint: 'oss-cn-beijing.aliyuncs.com',
  osspath: 'http://kcsj.oss-cn-beijing.aliyuncs.com/',
};

const uploadToCDN = async (file, userId, { onProgress }) => {
  const response = await personalApi.get_token({});
  if (response.status == 0) {
    const result = response.result;
    let client = new OSS({
      accessKeyId: result.AccessKeyId,
      accessKeySecret: result.AccessKeySecret,
      stsToken: result.SecurityToken,
      bucket: aliyunOSS.bucket,
      region: aliyunOSS.region,
      endpoint: aliyunOSS.endpoint,
    });
    const timestamp = new Date().getTime();
    const path = Base64.btoa(userId) + '/' + timestamp;
    const res = await client.multipartUpload(path, file, { progress: onProgress });
    var filePath = aliyunOSS.osspath + res.name;
    return filePath;
  }
};

export { uploadToCDN };
