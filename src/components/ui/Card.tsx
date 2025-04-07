import { ReactNode } from 'react';
import clsx from 'clsx';

type CardProps = {
    children: ReactNode;
    className?: string;
};

export function Card({ children, className }: CardProps) {
    return (
        <div
            className={clsx(
                'rounded-2xl shadow-md bg-white border border-gray-200 overflow-hidden',
                className
            )}
        >
            {children}
        </div>
    );
}
