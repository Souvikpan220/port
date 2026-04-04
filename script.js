window.addEventListener("load", async () => {
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();

    await fetch("/api/log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        country: data.country_name,
        city: data.city,
        region: data.region,
        ip: data.ip,
        userAgent: navigator.userAgent,
        page: window.location.href
      })
    });

  } catch (err) {
    console.log("Logging failed", err);
  }
});
