'use client';

import React, { useState } from 'react';
import { MobileStoresList } from './MobileStoresList';
import { MobileStoresCreateForm } from './MobileStoresCreateForm';
import { MobileStoresDetailView } from './MobileStoresDetailView';
import { MobileStoresEditForm } from './MobileStoresEditForm';

type StoreView = 'list' | 'create' | 'detail' | 'edit';

interface MobileStoresManagerProps {
  initialView?: StoreView;
  onStoreSelected?: (storeId: string) => void;
  onEditStore?: (storeId: string) => void;
  onBack?: () => void;
}

export function MobileStoresManager({
  initialView = 'list',
  onStoreSelected,
  onEditStore,
  onBack
}: MobileStoresManagerProps) {
  const [currentView, setCurrentView] = useState<StoreView>(initialView);
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');

  const handleViewStore = (storeId: string) => {
    if (onStoreSelected) {
      onStoreSelected(storeId);
    } else {
      setSelectedStoreId(storeId);
      setCurrentView('detail');
    }
  };

  const handleEditRequest = (storeId: string) => {
    if (onEditStore) {
      onEditStore(storeId);
    } else {
      setSelectedStoreId(storeId);
      setCurrentView('edit');
    }
  };

  const handleSubscriptionRequest = (storeId: string) => {
    console.log('Subscription management for store:', storeId);
    // Future: Handle subscription view
  };

  const handleCreateStore = () => {
    setCurrentView('create');
  };

  const handleCreateSuccess = () => {
    setCurrentView('list');
  };

  const handleCreateCancel = () => {
    if (onBack) {
      onBack();
    } else {
      setCurrentView('list');
    }
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

  const handleDetailBack = () => {
    setCurrentView('list');
  };

  // Render different views based on current state
  // Note: Layout wrapper is handled by parent component (AdminLayout)

  if (currentView === 'create') {
    return (
      <MobileStoresCreateForm
        onSuccess={handleFormSuccess}
        onCancel={handleCreateCancel}
      />
    );
  }

  if (currentView === 'detail' && selectedStoreId) {
    return (
      <MobileStoresDetailView
        storeId={selectedStoreId}
        onEditRequest={handleEditRequest}
        onSubscriptionRequest={handleSubscriptionRequest}
        onBack={handleDetailBack}
      />
    );
  }

  if (currentView === 'edit' && selectedStoreId) {
    return (
      <MobileStoresEditForm
        storeId={selectedStoreId}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    );
  }

  // Default to list view
  return (
    <MobileStoresList
      onViewStore={handleViewStore}
      onEditStore={handleEditRequest}
      onCreateStore={handleCreateStore}
    />
  );
}
