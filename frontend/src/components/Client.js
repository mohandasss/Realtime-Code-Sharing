import React from 'react';
import Avatar from 'react-avatar';

function Client({ username }) {
  return (
    <div className="d-flex align-items-center mb-3">
      <Avatar style={{fontFamily:"urbanist"}}  name={username.toString()} size={50} round="50%" className="mr-3" />
      <span style={{fontFamily:"urbanist"}} className='mx-2'>{username.toString()}</span>
    </div>
  );
}

export default Client;
