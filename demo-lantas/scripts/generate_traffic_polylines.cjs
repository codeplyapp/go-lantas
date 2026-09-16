const https = require('https');
const fs = require('fs');
const path = require('path');

function fetchRoute(lng1, lat1, lng2, lat2) {
  return new Promise((resolve, reject) => {
    const url = `https://router.project-osrm.org/route/v1/driving/${lng1},${lat1};${lng2},${lat2}?overview=full&geometries=geojson`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.routes && json.routes.length > 0) {
            // Convert [lng, lat] to [lat, lng] for Leaflet
            const coords = json.routes[0].geometry.coordinates.map(([lng, lat]) => [
              Number(lat.toFixed(6)),
              Number(lng.toFixed(6))
            ]);
            resolve({
              coords,
              distance: (json.routes[0].distance / 1000).toFixed(1),
              duration: Math.round(json.routes[0].duration / 60)
            });
          } else {
            reject(new Error('No route found'));
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('Fetching exact street polylines from OSRM...');

  // 1. Safe School Navigation Route (Taman Blambangan -> SMAN 1 Giri)
  const navRoute = await fetchRoute(114.3670, -8.2195, 114.3625, -8.2085);
  console.log(`Navigation route: ${navRoute.coords.length} points, ${navRoute.distance} km, ${navRoute.duration} min`);

  // 2. Jl. Ahmad Yani (Taman Blambangan ke Simpang Lima)
  const segAhmadYani = await fetchRoute(114.3645, -8.2250, 114.3692, -8.2192);

  // 3. Jl. dr. Soetomo (Simpang Lima ke Pasar Banyuwangi)
  const segDrSoetomo = await fetchRoute(114.3692, -8.2192, 114.3680, -8.2120);

  // 4. Jl. Jaksa Agung Suprapto (Simpang Lima ke Kantor Bupati / Barat)
  const segJaksaAgung = await fetchRoute(114.3692, -8.2192, 114.3580, -8.2205);

  // 5. Jl. PB Sudirman (Simpang Lima ke Pasar / Pertokoan Timur)
  const segPbSudirman = await fetchRoute(114.3692, -8.2192, 114.3760, -8.2120);

  // 6. Jl. Gajah Mada (Mojopanggung ke Penataban)
  const segGajahMada = await fetchRoute(114.3540, -8.2300, 114.3590, -8.2180);

  // 7. Jl. Brawijaya (Terminal Brawijaya / Ring Road Barat)
  const segBrawijaya = await fetchRoute(114.3570, -8.2360, 114.3475, -8.2160);

  // 8. Jl. HOS Cokroaminoto & Wijaya Kusuma (Rute Akses SMAN 1 Giri)
  const segCokroaminoto = await fetchRoute(114.3680, -8.2165, 114.3615, -8.2085);

  // 9. Jl. Kepiting / Kolonel Sugiono (Ring Road Timur)
  const segKepiting = await fetchRoute(114.3692, -8.2192, 114.3745, -8.2340);

  console.log('All road segments successfully fetched with high precision!');

  const output = {
    navRoute: navRoute.coords,
    segAhmadYani: segAhmadYani.coords,
    segDrSoetomo: segDrSoetomo.coords,
    segJaksaAgung: segJaksaAgung.coords,
    segPbSudirman: segPbSudirman.coords,
    segGajahMada: segGajahMada.coords,
    segBrawijaya: segBrawijaya.coords,
    segCokroaminoto: segCokroaminoto.coords,
    segKepiting: segKepiting.coords,
  };

  fs.writeFileSync(path.join(__dirname, 'osrm_data.json'), JSON.stringify(output, null, 2));
  console.log('Saved to osrm_data.json');
}

main().catch(err => console.error(err));
