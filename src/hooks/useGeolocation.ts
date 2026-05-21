import { useEffect, useState } from 'react';

export type GeoStatus = 'idle' | 'loading' | 'success' | 'error' | 'unsupported' | 'denied';

interface GeoState {
  status: GeoStatus;
  coords?: { lat: number; lon: number };
  error?: string;
}

/**
 * Wraps navigator.geolocation. Call request() to actively ask for permission;
 * we don't fire on mount because that would prompt before the user is ready.
 */
export function useGeolocation() {
  const [state, setState] = useState<GeoState>({ status: 'idle' });

  useEffect(() => {
    if (!('geolocation' in navigator)) setState({ status: 'unsupported' });
  }, []);

  function request() {
    if (!('geolocation' in navigator)) {
      setState({ status: 'unsupported' });
      return;
    }
    setState({ status: 'loading' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          status: 'success',
          coords: { lat: pos.coords.latitude, lon: pos.coords.longitude },
        });
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setState({ status: 'denied', error: '定位被拒绝' });
        } else {
          setState({ status: 'error', error: err.message });
        }
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 },
    );
  }

  return { ...state, request };
}
