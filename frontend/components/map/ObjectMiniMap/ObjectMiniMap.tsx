'use client';

import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { Box } from '@mui/material';
import { InfrastructureType } from '@/types';
import { createCustomMarkerIcon } from '@/lib/utils/map.utils';

interface ObjectMiniMapProps {
  position: { lat: number; lng: number };
  title: string;
  infrastructureType: InfrastructureType;
}

const mapContainerStyle = {
  width: '100%',
  height: '300px',
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  scrollwheel: false,
  draggable: true,
};

export default function ObjectMiniMap({ position, title, infrastructureType }: ObjectMiniMapProps) {
  return (
    <Box sx={{ width: '100%', height: 300, borderRadius: 1, overflow: 'hidden' }}>
      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ''}
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={position}
          zoom={15}
          options={mapOptions}
        >
          <Marker
            position={position}
            title={title}
            icon={{
              url: createCustomMarkerIcon(infrastructureType),
              scaledSize: new google.maps.Size(40, 48),
              anchor: new google.maps.Point(20, 48),
            }}
          />
        </GoogleMap>
      </LoadScript>
    </Box>
  );
}
