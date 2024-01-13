// components/menubar/MenuBar.js
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { setOption } from '../../redux/slices/optionSlice'; // Adjust the path as necessary
import Button from '@mui/material/Button';
import styles from './Menubar.module.css'; // Import your CSS module here, adjust the path as necessary

const MenuBar = () => {
  const [dropdown, setDropdown] = useState(null);
  const router = useRouter();
  const dispatch = useDispatch();
  const currentOption = useSelector((state) => state.option.currentOption);

  const toggleDropdown = (name) => {
    setDropdown(dropdown === name ? null : name);
  };

  const handleOptionClick = (optionName) => {
    dispatch(setOption(optionName));
    setDropdown(null); // Close the dropdown
  };

  const navigateTo = (path) => {
    router.push(path);
    setDropdown(null); // Close dropdown after navigation
  };

  // Define your horizontal toolbar options here
  const menuOptions = {
    file: [
      { name: 'New', path: '/new' },
      { name: 'Load', path: '/load' },
      { name: 'Save', path: '/save' },
      // ... other file options
    ],
    edit: [
      // ... edit options
    ],
    mode: [
      // ... mode options
    ],
    account: [
      // ... account options
    ],
    // ... other menu categories
  };

  return (
    <nav className={styles.menuBar}>
      {Object.entries(menuOptions).map(([category, options]) => (
        <div key={category} className={styles.menuItem}>
          <Button variant="contained" onClick={() => toggleDropdown(category)}>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Button>
          {dropdown === category && (
            <ul className={styles.dropdown}>
              {options.map((option) => (
                <li key={option.name} onClick={() => navigateTo(option.path)}>
                  {option.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
      {/* About option */}
      <div className={styles.menuItem}>
        <Button variant="contained" onClick={() => navigateTo('/about')}>
          About
        </Button>
      </div>
    </nav>
  );
};

export default MenuBar;
