import { GPS_BASE, POLICE_BASE } from "./config";

const json = { "Content-Type": "application/json" };

export const gpsGet  = (path) =>
  fetch(`${GPS_BASE}${path}`).then(r => r.json());

export const gpsPost = (path, body) =>
  fetch(`${GPS_BASE}${path}`, {
    method: "POST",
    headers: json,
    body: JSON.stringify(body),
  }).then(r => r.json());


