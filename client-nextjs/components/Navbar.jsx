'use client'


import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useSocket } from '../contexts/SocketContext';
import {
  HomeIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  CreditCardIcon,
  WrenchScrewdriverIcon,
  UserIcon,
  Cog6ToothIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';

const Navbar = () => {
  const { user, logout, isTenant, isAgent, isAdmin, isSuperAdmin, hasSubscription, canListProperties } = useAuth();
  const { unreadCount } = useNotifications();
  const { isConnected } = useSocket();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const tenantNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Properties', href: '/properties', icon: BuildingOfficeIcon },
    { name: 'Applications', href: '/applications', icon: DocumentTextIcon },
    { name: 'Messages', href: '/messages', icon: ChatBubbleLeftRightIcon, badge: unreadCount },
    { name: 'Payments', href: '/payments', icon: CreditCardIcon },
    { name: 'Maintenance', href: '/maintenance', icon: WrenchScrewdriverIcon },
    { name: 'Subscription', href: '/subscription', icon: CreditCardIcon, badge: hasSubscription ? 'Active' : null },
  ];

  const agentNavItems = [
    { name: 'Dashboard', href: '/agent/dashboard', icon: HomeIcon },
    { name: 'My Properties', href: '/agent/properties', icon: BuildingOfficeIcon },
    { name: 'Applications', href: '/agent/applications', icon: DocumentTextIcon },
    { name: 'Messages', href: '/messages', icon: ChatBubbleLeftRightIcon, badge: unreadCount },
    { name: 'Leases', href: '/leases', icon: CreditCardIcon },
    { name: 'Analytics', href: '/agent/analytics', icon: DocumentTextIcon },
    { name: 'Schedule Viewings', href: '/agent/schedule', icon: DocumentTextIcon },
    { name: 'Subscription', href: '/subscription', icon: CreditCardIcon, badge: hasSubscription ? 'Active' : null },
  ];

  const adminNavItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
    { name: 'User Management', href: '/admin/users', icon: UserIcon },
    { name: 'Space Approval', href: '/admin/spaces', icon: BuildingOfficeIcon },
    { name: 'Content Moderation', href: '/admin/moderation', icon: DocumentTextIcon },
    { name: 'Revenue', href: '/admin/revenue', icon: CreditCardIcon },
    { name: 'Reports', href: '/admin/reports', icon: DocumentTextIcon },
    { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
  ];

  const superAdminNavItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
    { name: 'User Management', href: '/admin/users', icon: UserIcon },
    { name: 'Admin Management', href: '/admin/admins', icon: UserIcon },
    { name: 'Space Approval', href: '/admin/spaces', icon: BuildingOfficeIcon },
    { name: 'Content Moderation', href: '/admin/moderation', icon: DocumentTextIcon },
    { name: 'Revenue', href: '/admin/revenue', icon: CreditCardIcon },
    { name: 'Reports', href: '/admin/reports', icon: DocumentTextIcon },
    { name: 'Platform Settings', href: '/admin/platform', icon: Cog6ToothIcon },
    { name: 'Plans & Pricing', href: '/admin/plans', icon: CreditCardIcon },
    { name: 'Email Templates', href: '/admin/emails', icon: DocumentTextIcon },
    { name: 'Backups & API', href: '/admin/system', icon: DocumentTextIcon },
    { name: 'Audit Log', href: '/admin/audit', icon: DocumentTextIcon },
  ];

  const publicNavItems = [
    { name: 'Properties', href: '/properties', icon: BuildingOfficeIcon },
    { name: 'Agents', href: '/agents', icon: UserIcon },
    { name: 'List Property', href: '/list-property', icon: DocumentTextIcon },
  ];

  const getNavItems = () => {
    if (!user) return publicNavItems;
    if (user?.role === 'super_admin') return superAdminNavItems;
    if (user?.role === 'admin') return adminNavItems;
    if (user?.role === 'agent') return agentNavItems;
    return tenantNavItems;
  };

  const isActive = (href) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <nav style={{ backgroundColor: 'white', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
          {/* Logo and main nav */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <div style={{ height: '32px', width: '32px', backgroundColor: '#3b82f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>PR</span>
              </div>
              <span style={{ marginLeft: '8px', fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>PropRent</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: '24px', gap: '32px' }}>
            {getNavItems().map((item) => (
              <Link
                key={item.name}
                href={item.href}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '4px 4px 4px 4px',
                  borderBottom: `2px solid ${isActive(item.href) ? '#3b82f6' : 'transparent'}`,
                  fontSize: '14px',
                  fontWeight: '500',
                  color: isActive(item.href) ? '#111827' : '#6b7280',
                  textDecoration: 'none'
                }}
              >
                <item.icon style={{ height: '16px', width: '16px', marginRight: '8px' }} />
                {item.name}
                {item.badge > 0 && (
                  <span style={{
                    marginLeft: '8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: '#ef4444',
                    color: 'white'
                  }}>
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Right side items */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {user ? (
              <>
                {/* Connection status */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    height: '8px',
                    width: '8px',
                    borderRadius: '50%',
                    marginRight: '8px',
                    backgroundColor: isConnected ? '#10b981' : '#9ca3af'
                  }}></div>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>
                    {isConnected ? 'Connected' : 'Offline'}
                  </span>
                </div>

                {/* Profile dropdown */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '14px',
                      borderRadius: '9999px',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <img
                      style={{ height: '32px', width: '32px', borderRadius: '50%' }}
                      src={user.profile?.avatar || `https://ui-avatars.com/api/?name=${user.name.first}+${user.name.last}&background=random`}
                      alt={user.name.first}
                    />
                  </button>
                </div>
              </>
            ) : (
              /* Auth buttons */
              <>
                <Link
                  href="/login"
                  style={{
                    color: '#6b7280',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    textDecoration: 'none'
                  }}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    textDecoration: 'none'
                  }}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
