// Importa o ButtonHTMLAttributes do React
import { ButtonHTMLAttributes, ReactNode } from 'react';

// Informa que o botão aceita tudo de um botão normal + um isLoading
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  isLoading?: boolean;
}

export function Button({ children, isLoading, ...props }: ButtonProps) {
  return (
    <button
      disabled={isLoading}
      className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center shadow-sm"
      {...props}
    >
      {isLoading ? "Aguarde..." : children}
    </button>
  );
}