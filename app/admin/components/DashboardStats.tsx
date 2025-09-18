interface DashboardStatsProps {
  eventCount: number;
  videoCount: number;
}

export default function DashboardStats({ eventCount, videoCount }: DashboardStatsProps) {
  const stats = [
    {
      label: 'Total Events',
      value: eventCount,
      icon: '📅',
      gradient: 'from-blue-500 to-blue-600',
      shadowColor: 'shadow-blue-500/25'
    },
    {
      label: 'Total Videos',
      value: videoCount,
      icon: '🎥',
      gradient: 'from-red-500 to-red-600',
      shadowColor: 'shadow-red-500/25'
    },
    {
      label: 'Active Sessions',
      value: 1,
      icon: '👥',
      gradient: 'from-green-500 to-green-600',
      shadowColor: 'shadow-green-500/25'
    },
    {
      label: 'System Status',
      value: 'Online',
      icon: '⚡',
      gradient: 'from-purple-500 to-purple-600',
      shadowColor: 'shadow-purple-500/25'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`bg-gradient-to-br ${stat.gradient} p-6 rounded-xl shadow-lg ${stat.shadowColor} hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white/90 text-sm font-medium mb-2">{stat.label}</h3>
              <p className="text-white text-3xl font-bold">
                {typeof stat.value === 'number' ? stat.value : stat.value}
              </p>
            </div>
            <div className="text-3xl opacity-80">{stat.icon}</div>
          </div>
          <div className="mt-4 flex items-center">
            <div className="w-full bg-white/20 rounded-full h-1">
              <div className="bg-white h-1 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}