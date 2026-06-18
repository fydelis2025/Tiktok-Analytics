export default function LoadingSpinner({ size = 'md', text = 'Carregando...' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className={`${sizes[size]} border-4 border-gray-200 border-t-[#FE2C55] rounded-full animate-spin`}></div>
      {text && <p className="text-sm text-gray-500">{text}</p>}
    </div>
  );
}