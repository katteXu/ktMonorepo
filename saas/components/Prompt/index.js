import { ExclamationCircleFilled } from '@ant-design/icons';
import styles from './styles.less';

const Prompt = ({ value, type }) => {
  return (
    <div className={`${styles[type]} ${styles.defaultStyle}`}>
      {type === 'error' && (
        <ExclamationCircleFilled
          color="#E44040"
          style={{
            marginRight: 2,
            fontSize: 16,
          }}
        />
      )}
      {type === 'info' && (
        <ExclamationCircleFilled
          color="#477AEF"
          style={{
            marginRight: 2,
            fontSize: 16,
          }}
        />
      )}
      {value}
    </div>
  );
};

export default Prompt;
