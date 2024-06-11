import React from 'react';

const NotificationCounter = ({ count }) => {
    return (
        <>
            {count > 0 && <span>{count}</span>}
        </>
    );
};

export default NotificationCounter;
