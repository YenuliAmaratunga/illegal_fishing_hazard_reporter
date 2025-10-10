// src/api/client.js
import { GPS_BASE, POLICE_BASE } from "./config";

const json = { "Content-Type": "application/json" };

/* Safe JSON: if server returns HTML (404 page), log it so we see the problem */
async function safeJson(res, label, url) {
  const txt = await res.text();
  try {
    return JSON.parse(txt);
  } catch {
    console.log(`[${label}] Non-JSON from ${url}:`, txt.slice(0, 300));
    throw new Error("Non-JSON response (check URL/route)");
  }
}

async function jget(url, label) {
  const r = await fetch(url);
  if (!r.ok) {
    const body = await r.text();
    console.log(`[${label}] ${r.status} ${r.statusText} from ${url}:`, body.slice(0, 300));
    throw new Error(`${r.status} ${r.statusText}`);
  }
  return safeJson(r, label, url);
}

async function jput(url, body, label) {
  const r = await fetch(url, { method: "PUT", headers: json, body: JSON.stringify(body || {}) });
  if (!r.ok) {
    const bodyTxt = await r.text();
    console.log(`[${label}] ${r.status} ${r.statusText} from ${url}:`, bodyTxt.slice(0, 300));
    throw new Error(`${r.status} ${r.statusText}`);
  }
  return safeJson(r, label, url);
}

async function jpost(url, body, label) {
  const r = await fetch(url, { method: "POST", headers: json, body: JSON.stringify(body || {}) });
  if (!r.ok) {
    const bodyTxt = await r.text();
    console.log(`[${label}] ${r.status} ${r.statusText} from ${url}:`, bodyTxt.slice(0, 300));
    throw new Error(`${r.status} ${r.statusText}`);
  }
  return safeJson(r, label, url);
}

/* Fisherman app calls */
export const updateBoatLocation = (boatId, latitude, longitude) =>
  jpost(`${GPS_BASE}/api/gps/update-location`, { boatId, latitude, longitude }, "updateLocation");

export const sendSOS = (boatId, latitude, longitude) =>
  jpost(`${GPS_BASE}/api/gps/sos`, { boatId, latitude, longitude }, "sendSOS");

/* Marine Police – latest boats
   Try the likely routes you showed in the GPS controller; return first that works. */
export const getLatestBoats = async () => {
  const candidates = [
    `${GPS_BASE}/api/gps/latest-locations`,
    `${GPS_BASE}/api/gps/locations/latest`,
    `${GPS_BASE}/api/gps/get-latest-locations`,
  ];
  for (const url of candidates) {
    try {
      const res = await jget(url, "latestBoats");
      console.log("[latestBoats] OK from:", url);
      return res;
    } catch (e) {
      console.log("[latestBoats] tried:", url, "→", e.message);
    }
  }
  throw new Error("No locations endpoint responded");
};

/* Reports (used by both fisherman 'MyReports' and police dashboard) */
export const getViolationReports = async () => {
  const urls = [
    `${GPS_BASE}/api/reports/violation-reports`,
    `${POLICE_BASE}/api/violation-reports`,
  ];
  for (const url of urls) {
    try {
      const res = await jget(url, "violationReports");
      console.log("[violationReports] OK from:", url);
      return res;
    } catch (e) {
      console.log("[violationReports] tried:", url, "→", e.message);
    }
  }
  return [];
};

export const verifyViolation = (id) => {
  const urls = [
    `${GPS_BASE}/api/reports/violation-reports/${id}/verify`,
    `${POLICE_BASE}/api/violation-reports/${id}/verify`,
  ];
  return (async () => {
    for (const url of urls) {
      try {
        const res = await jput(url, {}, "verifyViolation");
        console.log("[verifyViolation] OK via:", url);
        return res;
      } catch (e) {
        console.log("[verifyViolation] tried:", url, "→", e.message);
      }
    }
    throw new Error("verifyViolation failed on all routes");
  })();
};

export const getHazardReports = async () => {
  const urls = [
    `${GPS_BASE}/api/reports/hazard-reports`,
    `${POLICE_BASE}/api/hazard-reports`,
  ];
  for (const url of urls) {
    try {
      const res = await jget(url, "hazardReports");
      console.log("[hazardReports] OK from:", url);
      return res;
    } catch (e) {
      console.log("[hazardReports] tried:", url, "→", e.message);
    }
  }
  return [];
};

export const resolveHazard = (id) => {
  const urls = [
    `${GPS_BASE}/api/reports/hazard-reports/${id}/resolve`,
    `${POLICE_BASE}/api/hazard-reports/${id}/resolve`,
  ];
  return (async () => {
    for (const url of urls) {
      try {
        const res = await jput(url, {}, "resolveHazard");
        console.log("[resolveHazard] OK via:", url);
        return res;
      } catch (e) {
        console.log("[resolveHazard] tried:", url, "→", e.message);
      }
    }
    throw new Error("resolveHazard failed on all routes");
  })();
};

export const getMyReports = (reporterId) =>
  jget(`${GPS_BASE}/api/reports/my?reporterId=${encodeURIComponent(reporterId)}`, "myReports");
