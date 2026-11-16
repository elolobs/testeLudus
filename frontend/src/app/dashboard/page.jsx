"use client";

import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch("http://localhost:8080", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Erro do backend:", response.status, errorData);
          throw new Error(`Erro ${response.status}: Falha ao carregar os dados.`);
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-lg text-gray-600">A carregar dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Painel do Administrador</h1>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Utilizadores Registados</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {data?.metricas?.totalUsuarios || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Eventos Ativos</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {data?.metricas?.eventosPublicados || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Receita Total</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              R$ {Number(data?.metricas?.receitaTotal || 0).toFixed(2).replace('.', ',')}
            </p>
          </div>
        </div>

        {/* Tabela de Eventos Recentes */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Últimos Eventos Criados</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
                  <th className="px-6 py-3 border-b border-gray-200">Título</th>
                  <th className="px-6 py-3 border-b border-gray-200">Organizador</th>
                  <th className="px-6 py-3 border-b border-gray-200">Data de Criação</th>
                  <th className="px-6 py-3 border-b border-gray-200">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
                {data?.eventosRecentes?.map((evento, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{evento.titulo}</td>
                    <td className="px-6 py-4">{evento.organizador}</td>
                    <td className="px-6 py-4">
                      {new Date(evento.criado_em).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold
                        ${evento.status === 'PUBLICADO' ? 'bg-green-100 text-green-800' : ''}
                        ${evento.status === 'RASCUNHO' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${evento.status === 'CANCELADO' ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {evento.status}
                      </span>
                    </td>
                  </tr>
                ))}
                
                {(!data?.eventosRecentes || data.eventosRecentes.length === 0) && (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                      Nenhum evento encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}