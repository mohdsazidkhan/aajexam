import React from 'react';

const Skeleton = ({ className, width, height, borderRadius }) => {
    return (
        <div
            className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${className}`}
            style={{
                width,
                height,
                borderRadius: borderRadius || '0.5rem',
            }}
        />
    );
};

export default Skeleton;
