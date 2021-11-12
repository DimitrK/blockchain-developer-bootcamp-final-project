import React, {useCallback} from 'react';
import './styles.scss';

const noop = _ => _;

const Button = ({as: Kind = 'button', type='button', loading, flavor, children, ...props}) => {
  const handleClick = useCallback((e) => {
    if (props.disabled) {
      e.preventDefault();
      return;
    }
    props.onClick(e);
  }, [props.disabled, props.onClick]);

  return <Kind {...props} onClick={handleClick} role="button" tabIndex="0" type={type}>{children}</Kind>;
};


export default Button;
