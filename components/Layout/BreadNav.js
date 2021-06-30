import { Breadcrumb, Button } from 'antd';
import router from 'next/router';
import { useEffect } from 'react';
import { User } from '@store';
const style = {
  position: 'absolute',
  top: 9,
  right: 16,
};

const mainStyle = {
  position: 'relative',
  background: '#fff',
  padding: 13,
  marginTop: 2,
};
const titleStyle = {
  fontSize: 20,
  fontWeight: 600,
  color: '#333333',
  padding: '6px 0 16px',
};

const Index = ({ breadNav, useBack, backUrl, rightArea }) => {
  const { userInfo, loading } = User.useContainer();
  useEffect(() => {
    const { id, companyName } = userInfo;
    if (TypeOf(breadNav, 'String')) {
      _czc.push(['_trackEvent', `${breadNav}`, `${companyName}${id}`, `${router.router.pathname}`]);
    } else if (TypeOf(breadNav, 'Array')) {
      let info = [];
      breadNav.map((item, index) => {
        if (TypeOf(item, 'Object')) {
          const val = item.props.children.props.children;
          info.push(val);
        } else {
          info.push(item);
        }
      });
      _czc.push(['_trackEvent', `${info}`, `${companyName}${id}`, `${router.router.pathname}`]);
    }
  }, []);
  const back = url => {
    if (url) {
      router.replace(url);
    } else {
      router.back();
    }
  };

  // 判断类型 兼容旧版字符串传递
  const TypeOf = (params, type) => {
    return Object.prototype.toString.call(params).indexOf(type) > 0;
  };

  return (
    <div style={mainStyle}>
      <Breadcrumb style={{ fontSize: 16 }} separator=">">
        {TypeOf(breadNav, 'String') &&
          breadNav.split('.').map((item, index) => <Breadcrumb.Item key={index}>{item}</Breadcrumb.Item>)}
        {TypeOf(breadNav, 'Array') &&
          breadNav.map((item, index) => <Breadcrumb.Item key={index}>{item}</Breadcrumb.Item>)}
      </Breadcrumb>
      {useBack && (
        <Button style={style} onClick={() => back(backUrl)}>
          返回
        </Button>
      )}
      {<div style={style}>{rightArea}</div>}
    </div>
  );
};

export default Index;
