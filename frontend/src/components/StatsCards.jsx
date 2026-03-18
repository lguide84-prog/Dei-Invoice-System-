import React from 'react';

export default function StatsCards({ clients }) {
  const stats = React.useMemo(() => {
    const totalClients = clients.length;
    const totalDue = clients.reduce((sum, client) => sum + (client.totalDue || 0), 0);
    const overdueClients = clients.filter(c => c.paymentStatus === 'Overdue').length;
    const paidClients = clients.filter(c => c.paymentStatus === 'Paid').length;

    return {
      totalClients,
      totalDue,
      overdueClients,
      paidClients
    };
  }, [clients]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const cards = [
    {
      title: 'Total Clients',
      value: stats.totalClients,
      bg: 'bg-blue-500',
      icon: '👥'
    },
    {
      title: 'Total Due',
      value: formatCurrency(stats.totalDue),
      bg: 'bg-red-500',
      icon: '💰'
    },
    {
      title: 'Overdue',
      value: stats.overdueClients,
      bg: 'bg-yellow-500',
      icon: '⚠️'
    },
    {
      title: 'Paid',
      value: stats.paidClients,
      bg: 'bg-green-500',
      icon: '✅'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">{card.title}</p>
              <p className="text-2xl font-bold mt-1">{card.value}</p>
            </div>
            <div className={`${card.bg} w-12 h-12 rounded-full flex items-center justify-center text-white text-xl`}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}