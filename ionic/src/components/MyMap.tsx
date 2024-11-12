import { GoogleMap } from '@capacitor/google-maps';
import { useEffect, useRef, useState } from 'react';
import { fsegaCoordinates, mapsApiKey } from '../utils/mapsApiKey';
import { map } from 'ionicons/icons';
import React from 'react';

interface MyMapProps {
    lat?: number;
    lng?: number;
    onMapClick?: (e: any) => void,
    onMarkerClick?: (e: any) => void,
}

const MyMap: React.FC<MyMapProps> = React.memo(({ lat = fsegaCoordinates.lat, lng = fsegaCoordinates.lng, onMapClick, onMarkerClick }) => {
    const mapRef = useRef<HTMLElement>(null);
    const listenerSet = useRef(false);
    const mapInstance = useRef<GoogleMap>();
    const markerIdRef = useRef<string>();

    useEffect(() => {
        let canceled = false;

        async function createMap() {
            if (!mapRef.current || mapInstance.current || !mapsApiKey) {
                return;
            }

            try {
                const googleMap = await GoogleMap.create({
                    id: 'my-cool-map',
                    element: mapRef.current,
                    apiKey: mapsApiKey,
                    config: {
                        center: { lat, lng },
                        zoom: 8
                    }
                });
                mapInstance.current = googleMap;
                console.log('gm created');
            } catch (error) {
                console.error('Error creating GoogleMap:', error);
                return;
            }

            // // Add a marker at the initial coordinates
            // try {
            //     markerIdRef.current = await mapInstance.current.addMarker({
            //         coordinate: { lat, lng },
            //         title: 'initial marker'
            //     });
            //     console.log('Initial marker added with id', markerIdRef.current);
            // } catch (error) {
            //     console.error('Error adding initial marker:', error);
            // }

            if (onMapClick && !listenerSet.current) {
                listenerSet.current = true;
                await mapInstance.current.setOnMapClickListener(async ({ latitude, longitude }) => {
                    // // console.log('Attempting to remove marker with id:', markerId);

                    // // Ensure markerId is valid before removing
                    // if (markerIdRef.current) {
                    //     try {
                    //         console.log('Removing marker with id', markerIdRef.current);
                    //         await mapInstance.current?.removeMarker(markerIdRef.current);  // Remove previous marker

                    //         markerIdRef.current = undefined;
                    //         console.log('Marker removed');
                    //     } catch (error) {
                    //         console.error('Error removing marker:', error);
                    //     }
                    // }

                    // try {
                    //     // Add a new marker and assign the new markerId
                    //     console.log('Adding new marker');

                    //     const id = await mapInstance.current?.addMarker({
                    //         coordinate: { lat: latitude, lng: longitude },
                    //         title: 'New marker'
                    //     });

                    //     markerIdRef.current = id;
                    //     console.log('New marker added with id', id);
                    // } catch (error) {
                    //     console.error('Error adding new marker:', error);
                    // }

                    // Call the onMapClick callback with the new coordinates
                    const latLng = new google.maps.LatLng(latitude, longitude);
                    console.log('onMapClick called with:', latitude, longitude, latLng);
                    onMapClick({ latLng });
                });
            }
            if (onMarkerClick) {
                await mapInstance.current.setOnMarkerClickListener(({ markerId, latitude, longitude }) => {
                    onMarkerClick({ markerId, latitude, longitude });
                });
            }
        }

        createMap();
        return () => {
            canceled = true;
            if (mapInstance.current) {
                mapInstance.current.removeAllMapListeners();
                mapInstance.current.destroy();
                mapInstance.current = undefined;
                markerIdRef.current = undefined;
                listenerSet.current = false;
                console.log('gm removed');
            }
        }
    }, [])

    useEffect(() => {
        const updateMarker = async () => {
            if (!mapInstance.current) return;

            try {
                if (markerIdRef.current) {
                    await mapInstance.current.removeMarker(markerIdRef.current);
                }
                markerIdRef.current = await mapInstance.current.addMarker({
                    coordinate: { lat, lng },
                    title: 'Updated marker'
                });
                await mapInstance.current.setCamera({
                    coordinate: { lat, lng }
                });
            } catch (error) {
                console.error('Error updating marker position:', error);
            }
        };

        updateMarker();
    }, [lat, lng]);

    return (
        <div className="component-wrapper">
            <capacitor-google-map ref={mapRef} style={{
                display: 'block',
                width: 300,
                height: 400
            }}></capacitor-google-map>
        </div>
    );
});

export default MyMap;
