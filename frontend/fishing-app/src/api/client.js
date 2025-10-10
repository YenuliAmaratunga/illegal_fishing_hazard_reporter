import { GPS_BASE, POLICE_BASE } from "./config";

const json = { "Content-Type": "application/json" };

// --------------------
// Generic Requests
// --------------------
export const gpsGet = (path) =>
  fetch(`${GPS_BASE}${path}`).then((r) => r.json());

export const gpsPost = (path, body) =>
  fetch(`${GPS_BASE}${path}`, {
    method: "POST",
    headers: json,
    body: JSON.stringify(body),
  }).then((r) => r.json());

export const gpsPut = (path, body) =>
  fetch(`${GPS_BASE}${path}`, {
    method: "PUT",
    headers: json,
    body: JSON.stringify(body),
  }).then((r) => r.json());

// --------------------
// GPS / BOAT endpoints
// --------------------

// update fisherman GPS every 60s
export const updateBoatLocation = (boatId, latitude, longitude) =>
  gpsPost("/api/gps/update-location", { boatId, latitude, longitude });

// send SOS from fisherman
export const sendSOS = (boatId, latitude, longitude) =>
  gpsPost("/api/gps/sos", { boatId, latitude, longitude });

// get latest boats for Marine Police dashboard
export const getLatestBoats = () =>
  gpsGet("/api/gps/latest-locations"); // your backend controller path

// --------------------
// REPORT endpoints
// --------------------

// get all violation reports (for police)
export const getViolationReports = () =>
  gpsGet("/api/reports/violation-reports");

// verify violation (police)
export const verifyViolation = (id) =>
  gpsPut(`/api/reports/violation-reports/${id}/verify`);

// get hazard reports (for police)
export const getHazardReports = () =>
  gpsGet("/api/reports/hazard-reports");

// resolve hazard report (police)
export const resolveHazard = (id) =>
  gpsPut(`/api/reports/hazard-reports/${id}/resolve`);

// get my own reports (fisherman)
export const getMyReports = (reporterId) =>
  gpsGet(`/api/reports/my?reporterId=${reporterId}`);
