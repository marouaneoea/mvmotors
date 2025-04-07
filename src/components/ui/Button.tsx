import * as React from "react";

export function Button({ children }: { children: React.ReactNode }) {
    return (
        <button className="bg-brand-yellow text-brand-black px-4 py-2 rounded-md">
            {children}
        </button>
    );
}
