import { MapContainer, TileLayer } from "react-leaflet";

export default function Mapa() {

    const position: [number, number] = [-23.55052, -46.633308];

    return (

        <MapContainer
            center={position}
            zoom={13}
            style={{
                height: "500px",
                width: "100%"
            }}
        >

            <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

        </MapContainer>

    );
}