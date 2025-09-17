'use client';

import React, { useState } from 'react';
import { MobileUsersList } from './MobileUsersList';
import { MobileUsersCreateForm } from './MobileUsersCreateForm';

type UserView = 'list' | 'create' | 'edit' | 'view';

interface MobileUsersManagerProps {
  initialView?: UserView;
  onUserSelected?: (userId: string) => void;
  onEditUser?: (userId: string) => void;
  onViewUser?: (userId: string) => void;
  onBack?: () => void;
}

export function MobileUsersManager({
  initialView = 'list',
  onUserSelected,
  onEditUser,
  onViewUser,
  onBack
}: MobileUsersManagerProps) {
  const [currentView, setCurrentView] = useState<UserView>(initialView);

  const handleViewUser = (userId: string) => {
    if (onViewUser) {
      onViewUser(userId);
    } else {
      console.log('View user:', userId);
      // For now, could implement internal user detail view
    }
  };

  const handleEditUser = (userId: string) => {
    if (onEditUser) {
      onEditUser(userId);
    } else {
      console.log('Edit user:', userId);
      // For now, could implement internal edit view
    }
  };

  const handleCreateUser = () => {
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
      <MobileUsersCreateForm
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    );
  }

  // Default to list view
  return (
    <MobileUsersList
      onViewUser={handleViewUser}
      onEditUser={handleEditUser}
      onCreateUser={handleCreateUser}
    />
  );
}
