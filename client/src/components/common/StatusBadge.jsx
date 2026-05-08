import React from 'react';
import { CheckCircleIcon, XCircleIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const StatusBadge = ({ status, size = 'medium' }) => {
  const getStatusConfig = (status) => {
    switch (status.toLowerCase()) {
      case 'available':
        return {
          color: 'green',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          icon: CheckCircleIcon,
          label: 'Available',
        };
      case 'rented':
        return {
          color: 'red',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          icon: XCircleIcon,
          label: 'Rented',
        };
      case 'pending':
        return {
          color: 'yellow',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          icon: ClockIcon,
          label: 'Pending',
        };
      case 'under_review':
        return {
          color: 'blue',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          icon: ClockIcon,
          label: 'Under Review',
        };
      case 'approved':
        return {
          color: 'green',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          icon: CheckCircleIcon,
          label: 'Approved',
        };
      case 'rejected':
        return {
          color: 'red',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          icon: XCircleIcon,
          label: 'Rejected',
        };
      case 'cancelled':
        return {
          color: 'gray',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          icon: XCircleIcon,
          label: 'Cancelled',
        };
      case 'active':
        return {
          color: 'green',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          icon: CheckCircleIcon,
          label: 'Active',
        };
      case 'inactive':
        return {
          color: 'gray',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          icon: XCircleIcon,
          label: 'Inactive',
        };
      case 'urgent':
        return {
          color: 'red',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          icon: ExclamationTriangleIcon,
          label: 'Urgent',
        };
      case 'low':
        return {
          color: 'blue',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          icon: CheckCircleIcon,
          label: 'Low',
        };
      case 'medium':
        return {
          color: 'yellow',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          icon: ClockIcon,
          label: 'Medium',
        };
      case 'high':
        return {
          color: 'orange',
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-800',
          icon: ExclamationTriangleIcon,
          label: 'High',
        };
      default:
        return {
          color: 'gray',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          icon: ClockIcon,
          label: status,
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    medium: 'px-3 py-1.5 text-sm',
    large: 'px-4 py-2 text-base',
  };

  const iconSizeClasses = {
    small: 'h-3 w-3',
    medium: 'h-4 w-4',
    large: 'h-5 w-5',
  };

  return (
    <span
      className={`inline-flex items-center ${config.bgColor} ${config.textColor} ${sizeClasses[size]} rounded-full font-medium`}
    >
      <Icon className={`${iconSizeClasses[size]} mr-1`} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
