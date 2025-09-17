'use client';

import React, { useState } from 'react';
import { MobilePackagesList } from './MobilePackagesList';
import { MobilePackagesCreateForm } from './MobilePackagesCreateForm';

type PackageView = 'list' | 'create' | 'edit';

interface MobilePackagesManagerProps {
  initialView?: PackageView;
  onPackageSelected?: (packageId: string) => void;
  onEditPackage?: (packageId: string) => void;
  onViewPackage?: (packageId: string) => void;
  onBack?: () => void;
}

export function MobilePackagesManager({
  initialView = 'list',
  onPackageSelected,
  onEditPackage,
  onViewPackage,
  onBack
}: MobilePackagesManagerProps) {
  const [currentView, setCurrentView] = useState<PackageView>(initialView);

  const handleViewPackage = (packageId: string) => {
    if (onViewPackage) {
      onViewPackage(packageId);
    } else {
      console.log('View package:', packageId);
      // For now, could implement internal package detail view
    }
  };

  const handleEditPackage = (packageId: string) => {
    if (onEditPackage) {
      onEditPackage(packageId);
    } else {
      console.log('Edit package:', packageId);
      // For now, could implement internal edit view
    }
  };

  const handleCreatePackage = () => {
    setCurrentView('create');
  };

  const handleFormSuccess = () => {
    setCurrentView('list');
  };

  const handleFormCancel = () => {
    if (onBack) {
      onBack();
    } else {
      setCurrentView('list');
    }
  };

  // Render different views based on current state
  if (currentView === 'create') {
    return (
      <MobilePackagesCreateForm
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    );
  }

  // Default to list view
  return (
    <MobilePackagesList
      onViewPackage={handleViewPackage}
      onEditPackage={handleEditPackage}
      onCreatePackage={handleCreatePackage}
    />
  );
}
