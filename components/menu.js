// components/Menu.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import Draggable from 'react-draggable';
import styles from './menu.module.css'; // Import your CSS module here

const Menu = () => {
  const [dropdown, setDropdown] = useState(null);
  const router = useRouter();

  const toggleDropdown = (name) => {
    setDropdown(dropdown === name ? null : name);
  };

  const navigateTo = (path) => {
    router.push(path);
    setDropdown(null); // Close dropdown after navigation
  };

  const handleStop = (e, data) => {
    console.log('Draggable onStop event:', data);
  };

  // Set initial position
  const defaultPosition = {x: 280, y: 5}; // Replace with your desired coordinates

  return (
    <Draggable defaultPosition={defaultPosition} onStop={handleStop}>
      <nav className={styles.menuBar}>
        <ul className={styles.menuList}>
          <li className={styles.menuItem} onClick={() => toggleDropdown('file')}>
            File
            {dropdown === 'file' && (
              <ul className={styles.dropdown}>
                <li onClick={() => navigateTo('/new')}>New</li>
                <li onClick={() => navigateTo('/load')}>Load</li>
                <li onClick={() => navigateTo('/save')}>Save</li>
              </ul>
            )}
          </li>
          <li className={styles.menuItem} onClick={() => toggleDropdown('edit')}>
            Edit
            {dropdown === 'edit' && (
              <ul className={styles.dropdown}>
                <li onClick={() => console.log('Undo clicked')}>Undo</li>
                <li onClick={() => console.log('Redo clicked')}>Redo</li>
                <li onClick={() => console.log('Options clicked')}>Options</li>
              </ul>
            )}
          </li>
          <li className={styles.menuItem} onClick={() => toggleDropdown('mode')}>
            Mode
            {dropdown === 'mode' && (
              <ul className={styles.dropdown}>
                <li onClick={() => navigateTo('/picture')}>Still Picture</li>
                <li onClick={() => navigateTo('/video')}>Video</li>
                <li onClick={() => navigateTo('/storyboard')}>Storyboard</li>
                <li onClick={() => navigateTo('/sound')}>Sound</li>
                <li onClick={() => navigateTo('/media-viewer')}>Media Viewer</li>
              </ul>
            )}
          </li>
          <li className={styles.menuItem} onClick={() => toggleDropdown('account')}>
            Account
            {dropdown === 'account' && (
              <ul className={styles.dropdown}>
                <li onClick={() => console.log('Profile clicked')}>Profile</li>
                <li onClick={() => console.log('Logout clicked')}>Logout</li>
              </ul>
            )}
          </li>
          <li className={`${styles.menuItem} ${styles.aboutItem}`} onClick={() => navigateTo('/about')}>
            About
          </li>
        </ul>
      </nav>
    </Draggable>
  );
};

export default Menu;
