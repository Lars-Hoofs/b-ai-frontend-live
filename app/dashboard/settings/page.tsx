'use client';

import { useRouter } from 'next/navigation';
import { 
  RiUserLine, 
  RiArrowRightSLine
} from '@remixicon/react';

const settingsCategories = [
  {
    name: 'Profile',
    description: 'Beheer de instellingen van uw persoonlijke account, zoals naam, e-mail en wachtwoord.',
    icon: RiUserLine,
    href: '/dashboard/settings/profile',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
  },
];

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Beheer uw accountinstellingen en persoonlijke voorkeuren.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {settingsCategories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.name}
              onClick={() => router.push(category.href)}
              className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all text-left group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`${category.bgColor} p-3 rounded-lg`}>
                  <Icon size={24} className={category.color} />
                </div>
                <RiArrowRightSLine 
                  size={20} 
                  className="text-muted-foreground group-hover:translate-x-1 transition-transform" 
                />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {category.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {category.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
