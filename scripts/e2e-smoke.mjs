const BASE = "http://localhost:3000";

async function login(email, password) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const cookie = res.headers.get("set-cookie").split(";")[0];
  if (!res.ok) throw new Error(`login failed: ${res.status}`);
  const data = await res.json();
  return { cookie, user: data.user };
}

async function api(path, { method = "GET", cookie, body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

(async () => {
  const owner = await login("owner@demo.com", "demo123");
  const worker = await login("worker@demo.com", "demo123");
  console.log("1. logins OK", owner.user.role, worker.user.role);

  const job = await api("/api/jobs", {
    method: "POST",
    cookie: owner.cookie,
    body: {
      title: "E2E smoke test job",
      description: "Full flow test",
      category: "cleaning",
      budget: 500,
      location: "HSR Layout",
      pincode: "560025",
      media_urls: [],
    },
  });
  if (job.status !== 201 && job.status !== 200) throw new Error("job create " + job.status);
  console.log("2. job created", job.data.id);

  const applied = await api("/api/applications", {
    method: "POST",
    cookie: worker.cookie,
    body: { job_id: job.data.id, message: "I can do this well", proposed_rate: 450 },
  });
  if (applied.status !== 200 && applied.status !== 201) throw new Error("apply " + applied.status + " " + JSON.stringify(applied.data));
  console.log("3. applied", applied.data.id);

  const accepted = await api("/api/applications", {
    method: "PATCH",
    cookie: owner.cookie,
    body: { id: applied.data.id, status: "accepted" },
  });
  if (!accepted.data?.ok) throw new Error("accept " + accepted.status);
  console.log("4. accepted, job assigned");

  const convs = await api("/api/conversations", { cookie: worker.cookie });
  console.log("5. conversations for worker:", Array.isArray(convs.data) ? convs.data.length : convs.data?.items?.length);

  const done = await api(`/api/jobs/${job.data.id}`, {
    method: "PATCH",
    cookie: owner.cookie,
    body: { status: "completed" },
  });
  if (done.data?.status !== "completed") throw new Error("complete " + done.status);
  console.log("6. job completed");

  const pay = await api("/api/payments", {
    method: "POST",
    cookie: owner.cookie,
    body: { job_id: job.data.id },
  });
  if (!pay.data?.payment) throw new Error("payment create " + pay.status + " " + JSON.stringify(pay.data));
  console.log("7. payment created amount=", pay.data.payment.amount, "status=", pay.data.payment.status);

  const paid = await api(`/api/payments/${job.data.id}`, {
    method: "POST",
    cookie: owner.cookie,
    body: { action: "pay" },
  });
  if (paid.data?.payment?.status !== "completed") throw new Error("pay " + paid.status + " " + JSON.stringify(paid.data));
  console.log("8. paid OK demo=", paid.data.demo);

  const review = await api("/api/reviews", {
    method: "POST",
    cookie: owner.cookie,
    body: { job_id: job.data.id, reviewee_id: worker.user.id, rating: 5, comment: "Excellent work" },
  });
  if (!review.data?.id) throw new Error("review " + review.status + " " + JSON.stringify(review.data));
  console.log("9. review submitted rating=", review.data.rating);

  const stats = await api("/api/stats");
  console.log("10. stats:", JSON.stringify(stats.data));

  const msgs = await api("/api/messages", {
    method: "POST",
    cookie: worker.cookie,
    body: {
      conversation_id: (convs.data.items || convs.data)[0].id,
      text: "Hello, on my way!",
    },
  });
  console.log("11. message sent status=", msgs.status);

  const notif = await api("/api/notifications", { cookie: owner.cookie });
  console.log("12. owner notifications:", JSON.stringify(notif.data));

  console.log("\nALL E2E CHECKS PASSED");
})().catch((e) => {
  console.error("E2E FAILED:", e.message);
  process.exit(1);
});
