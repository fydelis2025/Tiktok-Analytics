import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function BestTimesChart({ data }) {
  if (!data?.best_hours) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Melhores Horários para Postar</h3>
        <p className="text-gray-500">Publique mais vídeos para gerar dados suficientes.</p>
      </div>
    );
  }

  const hours = Object.keys(data.best_hours);
  const values = Object.values(data.best_hours);

  const chartData = {
    labels: hours.map(h => `${h}:00`),
    datasets: [
      {
        label: 'Engajamento Médio',
        data: values,
        backgroundColor: hours.map((_, i) => 
          i === 0 ? '#FE2C55' : '#FF8FA3'
        ),
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#010101',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#f0f0f0' },
        ticks: { color: '#8A8B91' },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#8A8B91' },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Melhores Horários para Postar</h3>
      <div className="h-64">
        <Bar data={chartData} options={options} />
      </div>
      <p className="text-sm text-gray-500 mt-4">
        Baseado no engajamento dos seus últimos vídeos
      </p>
    </div>
  );
}