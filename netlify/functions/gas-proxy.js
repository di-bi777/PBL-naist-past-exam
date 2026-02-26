export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: corsHeaders_(),
      body: "",
    };
  }

  try {
    const route = event.queryStringParameters?.route || "reject";
    const needsAdminToken = route === "approve" || route === "reject";
    if (needsAdminToken) {
      const expectedToken = process.env.ADMIN_API_TOKEN || process.env.VITE_ADMIN_API_TOKEN;
      const providedToken =
        event.headers?.["x-admin-token"] || event.headers?.["X-Admin-Token"] || "";
      if (!expectedToken || providedToken !== expectedToken) {
        return json({ status: "error", message: "unauthorized" }, 401);
      }
    }

    const endpointMap = {
      reject: process.env.GAS_REJECT_ENDPOINT || process.env.VITE_GAS_REJECT_ENDPOINT,
      approve: process.env.GAS_APPROVE_ENDPOINT || process.env.VITE_GAS_APPROVE_ENDPOINT,
      db: process.env.GAS_DB_ENDPOINT || process.env.VITE_GAS_DB_ENDPOINT,
      drive: process.env.GAS_DRIVE_ENDPOINT || process.env.VITE_GAS_DRIVE_ENDPOINT,
    };
    const gasBase = endpointMap[route];
    if (!gasBase) {
      return json({ status: "error", message: `missing endpoint for route=${route}` }, 500);
    }

    const params = new URLSearchParams(event.queryStringParameters || {});
    params.delete("route");
    const qs = params.toString();
    const targetUrl = qs ? `${gasBase}?${qs}` : gasBase;

    const upstream = await fetch(targetUrl, {
      method: event.httpMethod,
      headers: {
        "Content-Type":
          event.headers?.["content-type"] ||
          event.headers?.["Content-Type"] ||
          "application/json",
      },
      body: ["GET", "HEAD"].includes(event.httpMethod) ? undefined : event.body || "",
    });

    const text = await upstream.text();
    return {
      statusCode: upstream.status,
      headers: {
        ...corsHeaders_(),
        "Content-Type": upstream.headers.get("content-type") || "application/json",
      },
      body: text,
    };
  } catch (e) {
    return json({ status: "error", message: String(e) }, 500);
  }
};

function corsHeaders_() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, x-admin-token",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  };
}

function json(obj, status = 200) {
  return {
    statusCode: status,
    headers: {
      ...corsHeaders_(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(obj),
  };
}
