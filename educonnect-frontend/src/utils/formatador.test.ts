import { describe, it, expect } from 'vitest';

function somarReceita(a: number, b: number) {
  return a + b;
}

describe('Testes Financeiros Básicos', () => {
  it('deve somar dois valores corretamente', () => {
    const resultado = somarReceita(1500, 500);
    expect(resultado).toBe(2000);
  });
});