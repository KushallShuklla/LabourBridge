import { RefreshControl } from 'react-native';
import { useState } from 'react';

export const usePullToRefresh = (onRefresh: () => Promise<void>) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={handleRefresh}
      colors={['#057642']}
      tintColor="#057642"
    />
  );

  return { refreshing, refreshControl };
};
