import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'America/Sao_Paulo'
  });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo'
  });
}

export function getBrasiliaTime(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
}

export function isCandle1mOpening(): boolean {
  const now = new Date();
  const brasiliaSeconds = parseInt(
    now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo', second: '2-digit' })
  );
  return brasiliaSeconds >= 0 && brasiliaSeconds <= 3;
}

export function getSecondsUntilNextCandle(): number {
  const now = new Date();
  const brasiliaSeconds = parseInt(
    now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo', second: '2-digit' })
  );
  return brasiliaSeconds === 0 ? 0 : 60 - brasiliaSeconds;
}
