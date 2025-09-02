// components/admin/shared/StatCard.js
const StatCard = ({ title, value, icon, trend, color }) => (
  <div className={`bg-white rounded-lg shadow p-6 ${color}`}>
    <div className="flex items-center">
      <div className="flex-shrink-0">{icon}</div>
      <div className="ml-5">
        <dt className="text-sm font-medium text-gray-500">{title}</dt>
        <dd className="text-lg font-medium text-gray-900">{value}</dd>
        {trend && <dd className="text-sm text-green-600">{trend}</dd>}
      </div>
    </div>
  </div>
);
