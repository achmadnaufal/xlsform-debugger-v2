// No-op shim for leaflet.gridlayer.googlemutant (avoids Google Maps API key requirement)
import L from "leaflet";

const GoogleMutant = L.GridLayer.extend({
  onAdd() {
    return this;
  },
  onRemove() {
    return this;
  },
  setOpacity() {
    return this;
  },
  setElementSize() {
    return this;
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(L.GridLayer as any).GoogleMutant = GoogleMutant;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(L.gridLayer as any).googleMutant = function () {
  return new GoogleMutant();
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default (L.gridLayer as any).googleMutant;
