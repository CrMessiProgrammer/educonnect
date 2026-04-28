import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { FileText, Download, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface LinhaBoletim {
  disciplina: string;
  nota1B: number | null;
  nota2B: number | null;
  nota3B: number | null;
  nota4B: number | null;
  mediaFinal: number;
  totalFaltas: number;
  status: string;
}

interface BoletimData {
  alunoNome: string;
  turmaNome: string;
  frequenciaGeral: number;
  disciplinas: LinhaBoletim[];
}

export function BoletimAluno() {
  const { user } = useAuthStore();

  const { data: boletim, isLoading } = useQuery<BoletimData>({
    queryKey: ['boletim', user?.id],
    queryFn: async () => {
      const response = await api.get(`/api/Boletim/${user?.id}`);
      return response.data;
    },
    enabled: !!user?.id
  });

  const handleDownloadPdf = async () => {
    try {
      const response = await api.get(`/api/Boletim/${user?.id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Boletim_${user?.nome.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FileText className="text-indigo-500" /> Meu Boletim
          </h2>
          <p className="text-slate-500 mt-1">{boletim?.turmaNome}</p>
        </div>
        
        <Button onClick={handleDownloadPdf} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 py-2.5 shadow-sm transition-all cursor-pointer">
          <Download size={18} /> Baixar PDF Oficial
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 font-semibold border-b dark:border-slate-700">
              <tr>
                <th className="px-6 py-4">Disciplina</th>
                <th className="px-4 py-4 text-center">1ºB</th>
                <th className="px-4 py-4 text-center">2ºB</th>
                <th className="px-4 py-4 text-center">3ºB</th>
                <th className="px-4 py-4 text-center">4ºB</th>
                <th className="px-4 py-4 text-center text-indigo-600 dark:text-indigo-400">Média</th>
                <th className="px-4 py-4 text-center">Faltas</th>
                <th className="px-6 py-4 text-right">Situação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {boletim?.disciplinas.map((linha, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{linha.disciplina}</td>
                  <td className="px-4 py-4 text-center text-slate-600 dark:text-slate-400">{linha.nota1B?.toFixed(1) || '-'}</td>
                  <td className="px-4 py-4 text-center text-slate-600 dark:text-slate-400">{linha.nota2B?.toFixed(1) || '-'}</td>
                  <td className="px-4 py-4 text-center text-slate-600 dark:text-slate-400">{linha.nota3B?.toFixed(1) || '-'}</td>
                  <td className="px-4 py-4 text-center text-slate-600 dark:text-slate-400">{linha.nota4B?.toFixed(1) || '-'}</td>
                  <td className="px-4 py-4 text-center font-black text-indigo-600 dark:text-indigo-400">{linha.mediaFinal.toFixed(1)}</td>
                  <td className="px-4 py-4 text-center font-medium text-slate-500">{linha.totalFaltas}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      linha.status === 'Aprovado' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {linha.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-t border-slate-200 dark:border-slate-700 text-right">
           <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
             Frequência Global: <span className="text-indigo-600 dark:text-indigo-400 text-base ml-2">{boletim?.frequenciaGeral.toFixed(1)}%</span>
           </p>
        </div>
      </div>
    </div>
  );
}