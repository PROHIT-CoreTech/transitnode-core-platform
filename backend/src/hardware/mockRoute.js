const waypoints = [
  [73.8567, 18.5204], // Pune Center
  [73.7626, 18.5994], // Wakad
  [73.6933, 18.7066], // Somatane
  [73.5469, 18.7583], // Kamshet
  [73.4061, 18.7557], // Lonavala
  [73.3736, 18.7610], // Khandala
  [73.3444, 18.7884], // Khopoli
  [73.2847, 18.8242], // Khalapur Toll
  [73.2081, 18.8778], // Madap
  [73.1175, 18.9894], // Panvel
  [72.9986, 19.0771], // Vashi
  [72.9060, 19.0532], // Chembur
  [72.8436, 19.0178]  // Mumbai
];

function interpolate(p1, p2, steps) {
  const points = [];
  for (let i = 0; i < steps; i++) {
    const lng = p1[0] + (p2[0] - p1[0]) * (i / steps);
    const lat = p1[1] + (p2[1] - p1[1]) * (i / steps);
    points.push([parseFloat(lng.toFixed(5)), parseFloat(lat.toFixed(5))]);
  }
  return points;
}

let fullRoute = [];
for (let i = 0; i < waypoints.length - 1; i++) {
  // 15 steps between each major waypoint for smooth animation
  fullRoute = fullRoute.concat(interpolate(waypoints[i], waypoints[i+1], 15));
}
// Add the final point
fullRoute.push([
  parseFloat(waypoints[waypoints.length - 1][0].toFixed(5)),
  parseFloat(waypoints[waypoints.length - 1][1].toFixed(5))
]);

module.exports = fullRoute;
