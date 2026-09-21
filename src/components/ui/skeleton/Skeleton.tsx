import React from "react";

/**
 * Base shimmer block used to compose every screen skeleton.
 * Keeps the app's rounded / gray language so skeletons match the real UI.
 */
export const Skeleton: React.FC<{
    className?: string;
    rounded?: string;
}> = ({ className = "", rounded = "rounded-md" }) => (
    <div
        aria-hidden="true"
        className={`animate-pulse bg-gray-200/80 ${rounded} ${className}`}
    />
);

/** A stack of text lines — the last line is shorter to feel like real copy. */
export const SkeletonText: React.FC<{
    lines?: number;
    className?: string;
    lineClassName?: string;
}> = ({ lines = 2, className = "", lineClassName = "h-3.5" }) => (
    <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
                key={i}
                rounded="rounded-full"
                className={`${lineClassName} ${
                    i === lines - 1 ? "w-2/3" : "w-full"
                }`}
            />
        ))}
    </div>
);

/** Circular placeholder — avatars, icons, play buttons. */
export const SkeletonCircle: React.FC<{ className?: string }> = ({
    className = "h-10 w-10",
}) => <Skeleton rounded="rounded-full" className={`shrink-0 ${className}`} />;

/** Empty white card shell — the same chrome the real cards use. */
export const SkeletonCard: React.FC<{
    className?: string;
    children?: React.ReactNode;
}> = ({ className = "", children }) => (
    <div
        className={`rounded-2xl border border-gray-100 bg-white p-5 shadow-sm ${className}`}
    >
        {children}
    </div>
);
