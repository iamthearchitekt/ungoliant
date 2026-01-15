import type { ReactNode } from 'react';
import './Card.css';

export function Card({ children, className = '', style, onClick }: { children: ReactNode, className?: string, style?: React.CSSProperties, onClick?: React.MouseEventHandler }) {
    return <div className={`card ${className}`} style={style} onClick={onClick}>{children}</div>;
}

export function CardHeader({ title, action }: { title: string, action?: ReactNode }) {
    return (
        <div className="card-header">
            <h3>{title}</h3>
            {action && <div className="card-action">{action}</div>}
        </div>
    )
}
