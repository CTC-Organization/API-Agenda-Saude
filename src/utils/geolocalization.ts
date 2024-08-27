export function findClosestUsf(usfs: any[], latitude: string, longitude: number): any {
    let closestUsf = null;
    let minDistance = Infinity;

    usfs.forEach((usf) => {
        const distance = calculateDistance(
            parseFloat(latitude),
            longitude,
            parseFloat(usf.latitude),
            parseFloat(usf.longitude),
        );

        if (distance < minDistance) {
            minDistance = distance;
            closestUsf = usf;
        }
    });

    return closestUsf;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRadians = (degrees: number) => degrees * (Math.PI / 180);

    const R = 6371; // Raio da Terra em KM
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
            Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distancia em km

    return distance;
}
