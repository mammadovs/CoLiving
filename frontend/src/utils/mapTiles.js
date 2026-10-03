/**
 * Shared map-tile configuration.
 *
 * Uses Mapbox Streets when VITE_MAPBOX_TOKEN is defined,
 * falls back to the free OpenStreetMap tile layer otherwise.
 */

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

export const TILE_LAYER = MAPBOX_TOKEN
    ? {
          url: `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`,
          attribution: '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          tileSize: 512,
          zoomOffset: -1,
      }
    : {
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }
