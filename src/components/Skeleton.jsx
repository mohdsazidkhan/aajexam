import React from 'react';

const Skeleton = ({ className, width, height, borderRadius }) => {
    return (
        <div
            className={`animate-pulse bg-background-surface-secondary border border-border-primary/50 ${className}`}
            style={{
                width,
                height,
                borderRadius: borderRadius || '0.5rem',
            }}
        />
    );
};

export default Skeleton;

