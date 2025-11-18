import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: number | string;
    type: "increase" | "decrease";
  };
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, change }) => {
  const formatChangeValue = (value: number | string) => {
    const numValue = Number(value);
    return isNaN(numValue) ? "0.00" : numValue.toFixed(2);
  };

  return (
    <div className="relative p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 mb-3">{value}</h3>

          {change && (
            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                change.type === "increase" 
                  ? "bg-green-100 text-green-700" 
                  : "bg-red-100 text-red-700"
              }`}>
                {change.type === "increase" ? (
                  <ArrowUp className="w-3 h-3" />
                ) : (
                  <ArrowDown className="w-3 h-3" />
                )}
                <span>{formatChangeValue(change.value)}%</span>
              </div>
              <span className="text-xs text-gray-500">vs último período</span>
            </div>
          )}
        </div>

        <div className={`p-3 rounded-xl transition-all duration-200 ${
          change?.type === "increase" 
            ? "bg-green-50 text-green-600 group-hover:bg-green-100" 
            : change?.type === "decrease"
            ? "bg-red-50 text-red-600 group-hover:bg-red-100"
            : "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
        }`}>
          {icon}
        </div>
      </div>
      
      {/* Accent line */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-xl transition-all duration-200 ${
        change?.type === "increase" 
          ? "bg-gradient-to-r from-green-400 to-green-500" 
          : change?.type === "decrease"
          ? "bg-gradient-to-r from-red-400 to-red-500"
          : "bg-gradient-to-r from-blue-400 to-blue-500"
      }`} />
    </div>
  );
};

export default StatsCard;
