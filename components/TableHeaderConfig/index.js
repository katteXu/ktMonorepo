import { useState, useEffect } from 'react';
import { Tooltip, Button, Menu, Dropdown, Checkbox, message } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import styles from './styles.less';

const { Item } = Menu;

// 忽略的列key
const Ignore = ['ctrl', 'index'];
/**
 * 表头设置
 * 应用组件中需要如下配置
 * 1. 默认表头：当用户选择为空或为选择是展示的表头
 * 2. 选中表头：当用户选择时候的展示表头
 * 3. 全部表头：用户可筛选的表头
 * 4. 选中表头ref：用于导出时传参
 * 5. 监听选中表头：更新表头ref
 * 6. 修改Table组件 columns属性过滤算法
 * 参见：pages/pound/detail.js
 */
const HeaderConfig = ({ onChange, columns = [], showColumns, onRestore, type }) => {
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [show, setShow] = useState();
  // 所有列
  const [filterCol, setFilterCol] = useState(() => {
    return columns.map(col => col.dataIndex);
  });
  useEffect(() => {
    // 过滤掉忽略的列
    setSelectedColumns(showColumns.filter(col => !Ignore.includes(col)));
  }, [showColumns]);

  // 选中项
  const handleSelectColumn = ({ key }) => {
    setSelectedColumns(() => {
      const index = selectedColumns.indexOf(key);
      if (index !== -1) {
        if (selectedColumns.length === 1) {
          message.warn('请至少设置一列数据');
          return selectedColumns;
        }
        selectedColumns.splice(index, 1);
      } else {
        selectedColumns.push(key);
      }

      // 变更的列必须包含在所有列中
      // 否则存入数据库 会产生bug
      onChange(selectedColumns.filter(col => filterCol.includes(col)));
      return [...selectedColumns];
    });
  };

  // 菜单
  const menu = (
    <div className={styles['restoreRoot']}>
      {type === 'transport' && (
        <div className={styles['restore']} onClick={onRestore}>
          恢复默认设置
        </div>
      )}

      <Menu className={styles['header-menu']} onClick={handleSelectColumn}>
        {columns
          .filter(col => !Ignore.includes(col.key))
          .map(col => {
            return (
              <Item className={styles['col-item']} key={col.key}>
                <Checkbox defaultChecked={true} checked={selectedColumns.includes(col.key)} />
                <span className={styles['col-name']}>{col.title}</span>
              </Item>
            );
          })}
      </Menu>
    </div>
  );

  return (
    <Dropdown overlay={menu} trigger={['click']} visible={show} onVisibleChange={setShow}>
      <Button
        type="text"
        icon={
          <SettingOutlined
            style={{
              color: '#3d86ef',
              fontSize: 16,
              position: 'relative',
              top: 1,
            }}
          />
        }
        type="link"
        style={{ alignItems: 'center', position: 'relative' }}>
        自定义列表
      </Button>
    </Dropdown>
  );
};

export default HeaderConfig;
