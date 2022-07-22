import styles from './styles.less';
import { Button, Row, Col } from 'antd';
import { LoadingBtn } from '@components';
import { useEffect, useState } from 'react';

const Search = props => {
  const { children, onSearch, onReset, color, simple, onExport, onExportTow } = props;

  const onPress = e => {
    if (e.which === 13) {
      onSearch && onSearch();
    }
  };
  let maxLength = 0;
  const [pdLeft, setPdLeft] = useState(0);
  useEffect(() => {
    if (children[0]) {
      if (children[0].props.label && children[0].props.label.length > maxLength) {
        maxLength = children[0].props.label.length;
      }
      if (maxLength == 6) {
        setPdLeft(18);
      } else if (maxLength == 5) {
        setPdLeft(4);
      }
    }
  }, []);
  return (
    <div
      className={styles.main}
      onKeyPress={onPress}
      type="flex"
      style={simple ? { background: color === '' ? '#fff' : color } : {}}>
      {children}
      <Search.Item label=" " visible={false} br>
        <div
          span={8}
          xl={6}
          lg={8}
          md={10}
          className={styles.item}
          style={{ flex: 1, padding: '0 0', paddingLeft: pdLeft }}>
          <Button type="primary" onClick={onSearch}>
            查询
          </Button>
          {onExport && (
            <LoadingBtn style={{ marginLeft: 8 }} onClick={onExport} loading={props.exportLoading}>
              导出
            </LoadingBtn>
          )}

          {onExportTow && (
            <div style={{ display: 'inline-block' }}>
              <LoadingBtn style={{ marginLeft: 8 }} onClick={props.onExportTowClick1} loading={props.exportLoading}>
                {onExportTow.name1}
              </LoadingBtn>
              <LoadingBtn style={{ marginLeft: 8 }} onClick={props.onExportTowClick2} loading={props.exportLoading2}>
                {onExportTow.name2}
              </LoadingBtn>
            </div>
          )}
          {onReset && (
            <Button onClick={onReset} style={{ padding: '4px 12px' }} type="link">
              重置筛选条件
            </Button>
          )}
        </div>
      </Search.Item>
    </div>
  );
};

Search.Item = ({ children, label, colSpan = 1, style, visible, br }) => {
  const nowrap = {
    span: 8,
    lg: 8,
    xl: 8,
    xxl: 6,
  };

  const wrap = {
    span: 24,
    lg: 24,
    xl: 24,
    xxl: 24,
  };

  const placeholder = {
    span: 8,
    lg: 8,
    xl: 8,
    xxl: 12,
  };

  const layout = br ? wrap : nowrap;
  return (
    <>
      <div
        style={{ ...style, display: br ? 'block' : 'inline-block' }}
        {...layout}
        className={`${styles.item} ${false ? styles.simple : ''}`}>
        {label && <div className={styles.label}>{`${label}${visible !== false ? '：' : ''}`}</div>}
        <div className={styles.input}>{children}</div>
      </div>
    </>
  );
};

export default Search;
