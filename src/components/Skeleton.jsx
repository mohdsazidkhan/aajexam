import React from 'react';

const Skeleton = ({ className, width, height, borderRadius }) => {
    return (
        <div
            className={`container mx-auto animate-pulse bg-primary-500/15 dark:bg-primary-500/20 border border-primary-500/20 ${className}`}
            style={{
                width,
                height,
                borderRadius: borderRadius || '0.5rem',
            }}
        />
    );
};

export default Skeleton;

