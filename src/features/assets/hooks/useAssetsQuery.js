import { useQuery } from '@tanstack/react-query';
import { assetsApi } from '../api/assets.api';
import { assetsKeys } from '../api/assets.api';

export function useAssetsQuery(params = {}, options = {}) {
  return useQuery({
    queryKey: assetsKeys.list(params),
    queryFn: () => assetsApi.getAll(params),
    ...options,
  });
}

export function useAssetQuery(id) {
  return useQuery({
    queryKey: assetsKeys.detail(id),
    queryFn: () => assetsApi.getAsset(id),
    enabled: !!id,
  });
}
