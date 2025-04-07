
import { ReactNode } from 'react';
import clsx from 'clsx';

type CardContentProps = {
    children: ReactNode;
    className?: string;
};

export function CardContent({ children, className }: CardContentProps) {
    return (
        <div className={clsx('p-4', className)}>
            {children}
        </div>
    );
}
