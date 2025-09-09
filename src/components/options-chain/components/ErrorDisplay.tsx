'use client';

interface ErrorDisplayProps {
  error: string;
}

export default function ErrorDisplay({ error }: ErrorDisplayProps) {
  return (
    <div className="mx-8 mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
      <p className="text-red-400">{error}</p>
    </div>
  );
}
