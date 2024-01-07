import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import styles from './PlaceholderTool.module.css';

const PlaceholderTool = () => {
  return (
    <div className={styles.toolIcon}>
      <FontAwesomeIcon icon={faMagnifyingGlass} />
    </div>
  );
};
export default PlaceholderTool;
