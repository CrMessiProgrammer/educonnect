import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useFilhoStore } from '../../store/useFilhoStore';
import { FileText, Download, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function BoletimResponsavel() {
  const { filhoId, filhoNome } = useFilhoStore();

  const { data: boletim, isLoading } = useQuery({
    queryKey: ['boletim-filho', filhoId],
    queryFn: async () => (await api.get(`/api/Boletim/${filhoId}`)).data,
    enabled: !!filhoId,
  });

  const handleDownloadPdf = async () => {
    try {
      const response = await api.get(`/api/Boletim/${filhoId}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Boletim_${filhoNome?.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (error) { console.error(error); }
  };

  if (!filhoId) return (
    <div className="p-10 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 text-center animate-in fade-in">
        <FileText size={48} className="mx-auto mb-4 opacity-20" />
        <p>Selecione um filho na aba anterior para visualizar o boletim.</p>
    </div>
  );

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FileText className="text-indigo-500" /> Boletim Escolar
          </h2>
          <p className="text-slate-500 mt-1">Estudante: <b>{filhoNome}</b></p>
        </div>
        <Button onClick={handleDownloadPdf} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 py-2.5 shadow-sm cursor-pointer">
          <Download size={18} /> Baixar PDF Oficial
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 font-semibold border-b dark:border-slate-700 uppercase tracking-tighter">
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
              {boletim?.disciplinas.map((linha: any, idx: number) => (
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