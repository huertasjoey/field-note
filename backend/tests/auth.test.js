const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { MongoMemoryServer } = require("mongodb-memory-server");

process.env.CLIENT_ORIGIN = "http://localhost:5173";
const app = require("../app");
const User = require("../models/User");
const Article = require("../models/Article");
const Session = require("../models/Session");

let mongod, server, base;
const ORIGIN = "http://localhost:5173";
const STRONG = "Str0ngPassw0rd";

before(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri(), { dbName: "test" });
  await Promise.all([User.init(), Article.init(), Session.init()]);
  server = http.createServer(app).listen(0);
  base = `http://127.0.0.1:${server.address().port}/api`;
  await User.create({ name: "Admin", email: "admin@example.com", passwordHash: await bcrypt.hash(STRONG, 4), role: "admin" });
});

after(async () => {
  server?.close();
  await mongoose.disconnect();
  await mongod?.stop();
});

// Tiny client that keeps the cookie and CSRF token like a browser would.
function client() {
  const state = { cookie: "", csrf: "" };
  return {
    state,
    async call(method, path, body, { headers = {}, useCsrf = true } = {}) {
      const h = { "Content-Type": "application/json", Origin: ORIGIN, ...headers };
      if (state.cookie) h.Cookie = state.cookie;
      if (state.csrf && useCsrf) h["X-CSRF-Token"] = state.csrf;
      const res = await fetch(base + path, { method, headers: h, body: body ? JSON.stringify(body) : undefined });
      const set = res.headers.getSetCookie();
      if (set.length) state.cookie = set[0].split(";")[0];
      const data = await res.json().catch(() => null);
      if (data?.csrfToken) state.csrf = data.csrfToken;
      return { status: res.status, data, setCookie: set[0] || "" };
    },
  };
}

const article = {
  title: "Test Article",
  excerpt: "Excerpt",
  content: "Some content here.",
  category: "Ideas",
  image: "https://example.com/a.jpg",
  author: "Tester",
};

test("valid user can register; cookie is HttpOnly + SameSite; role is user", async () => {
  const c = client();
  const r = await c.call("POST", "/auth/register", { name: "Ann", email: "Ann@Example.com ", password: STRONG });
  assert.equal(r.status, 201);
  assert.equal(r.data.user.email, "ann@example.com");
  assert.equal(r.data.user.role, "user");
  assert.equal(r.data.user.passwordHash, undefined);
  assert.match(r.setCookie, /HttpOnly/i);
  assert.match(r.setCookie, /SameSite=Lax/i);
});

test("duplicate email is rejected (case-insensitive)", async () => {
  const r = await client().call("POST", "/auth/register", { name: "Ann2", email: "ANN@example.com", password: STRONG });
  assert.equal(r.status, 409);
});

test("weak password / bad email rejected", async () => {
  const r = await client().call("POST", "/auth/register", { name: "X", email: "nope", password: "short" });
  assert.equal(r.status, 400);
});

test("password is hashed in the database", async () => {
  const u = await User.findOne({ email: "ann@example.com" }).select("+passwordHash");
  assert.notEqual(u.passwordHash, STRONG);
  assert.match(u.passwordHash, /^\$2[aby]\$/);
  assert.ok(await bcrypt.compare(STRONG, u.passwordHash));
});

test("registration cannot create an admin", async () => {
  const r = await client().call("POST", "/auth/register", {
    name: "Eve",
    email: "eve@example.com",
    password: STRONG,
    role: "admin",
    isAdmin: true,
  });
  assert.equal(r.status, 201);
  assert.equal(r.data.user.role, "user");
  assert.equal((await User.findOne({ email: "eve@example.com" })).role, "user");
});

test("login: valid works, session survives a refresh (/me), invalid rejected", async () => {
  const bad = await client().call("POST", "/auth/login", { email: "ann@example.com", password: "WrongPass1" });
  assert.equal(bad.status, 401);
  const unknown = await client().call("POST", "/auth/login", { email: "nobody@example.com", password: STRONG });
  assert.equal(unknown.status, 401);
  assert.equal(unknown.data.message, bad.data.message);

  const c = client();
  const ok = await c.call("POST", "/auth/login", { email: "ann@example.com", password: STRONG });
  assert.equal(ok.status, 200);
  const me = await c.call("GET", "/auth/me");
  assert.equal(me.data.user.email, "ann@example.com");
  assert.ok(me.data.csrfToken);
});

test("logout invalidates the session server-side (even a copied cookie stops working)", async () => {
  const c = client();
  await c.call("POST", "/auth/login", { email: "ann@example.com", password: STRONG });
  const copy = client();
  copy.state.cookie = c.state.cookie;
  assert.ok((await copy.call("GET", "/auth/me")).data.user);

  assert.equal((await c.call("POST", "/auth/logout")).status, 200);
  assert.equal((await c.call("GET", "/auth/me")).data.user, null);
  assert.equal((await copy.call("GET", "/auth/me")).data.user, null);
});

test("login is required for everything: anonymous reads and writes get 401", async () => {
  const admin = client();
  await admin.call("POST", "/auth/login", { email: "admin@example.com", password: STRONG });
  const created = await admin.call("POST", "/articles", article);
  assert.equal(created.status, 201);
  const id = created.data._id;

  const anon = client();
  assert.equal((await anon.call("GET", "/articles")).status, 401);
  assert.equal((await anon.call("GET", "/articles/featured")).status, 401);
  assert.equal((await anon.call("GET", `/articles/${id}`)).status, 401);
  assert.equal((await anon.call("POST", "/articles", article)).status, 401);
  assert.equal((await anon.call("PUT", `/articles/${id}`, { featured: true })).status, 401);
  assert.equal((await anon.call("DELETE", `/articles/${id}`)).status, 401);
  assert.equal((await anon.call("POST", "/newsletter/subscribe", { email: "reader@example.com" })).status, 401);
  assert.equal((await anon.call("GET", "/auth/me")).data.user, null);

  // Signed-in (non-admin) readers can read and subscribe
  const reader = client();
  await reader.call("POST", "/auth/register", { name: "Rae", email: "rae@example.com", password: STRONG });
  assert.equal((await reader.call("GET", "/articles")).status, 200);
  assert.equal((await reader.call("GET", `/articles/${id}`)).status, 200);
  assert.equal((await reader.call("POST", "/newsletter/subscribe", { email: "reader@example.com" })).status, 201);
});

test("/auth/me reports the admin role (this is what shows the Upload Blog button)", async () => {
  const a = client();
  await a.call("POST", "/auth/login", { email: "admin@example.com", password: STRONG });
  assert.equal((await a.call("GET", "/auth/me")).data.user.role, "admin");
  const u = client();
  await u.call("POST", "/auth/register", { name: "Cy", email: "cy@example.com", password: STRONG });
  assert.equal((await u.call("GET", "/auth/me")).data.user.role, "user");
});

test("ordinary users get 403 on admin actions", async () => {
  const id = (await Article.findOne())._id;
  const u = client();
  await u.call("POST", "/auth/register", { name: "Bob", email: "bob@example.com", password: STRONG });
  assert.equal((await u.call("POST", "/articles", article)).status, 403);
  assert.equal((await u.call("PUT", `/articles/${id}`, { featured: true })).status, 403);
  assert.equal((await u.call("DELETE", `/articles/${id}`)).status, 403);
  assert.ok(await Article.findById(id));
});

test("admin can create, edit, feature and delete; CSRF and origin are enforced", async () => {
  const a = client();
  await a.call("POST", "/auth/login", { email: "admin@example.com", password: STRONG });
  const created = await a.call("POST", "/articles", { ...article, title: "Second Piece" });
  assert.equal(created.status, 201);
  const id = created.data._id;

  const noCsrf = await a.call("PUT", `/articles/${id}`, { title: "Hacked" }, { useCsrf: false });
  assert.equal(noCsrf.status, 403);
  const badOrigin = await a.call("PUT", `/articles/${id}`, { title: "Hacked" }, { headers: { Origin: "http://evil.example" } });
  assert.equal(badOrigin.status, 403);

  const upd = await a.call("PUT", `/articles/${id}`, { title: "Second Piece v2", featured: true });
  assert.equal(upd.status, 200);
  assert.equal(upd.data.featured, true);
  assert.equal((await a.call("DELETE", `/articles/${id}`)).status, 200);
  assert.equal(await Article.findById(id), null);
});

test("publishing adds a new article without touching existing ones or the featured article", async () => {
  const a = client();
  await a.call("POST", "/auth/login", { email: "admin@example.com", password: STRONG });
  await Article.deleteMany({});
  const first = (await a.call("POST", "/articles", { ...article, title: "Original Featured", featured: true })).data;
  const second = (await a.call("POST", "/articles", { ...article, title: "Original Other", category: "Places" })).data;
  const before = await Article.countDocuments();

  const created = await a.call("POST", "/articles", { ...article, title: "Brand New Story", category: "Culture" });
  assert.equal(created.status, 201);
  assert.ok(created.data._id && created.data.slug === "brand-new-story");
  assert.equal(created.data.featured, false);
  assert.equal(await Article.countDocuments(), before + 1);

  // Existing articles untouched; featured unchanged
  assert.equal((await Article.findById(second._id)).title, "Original Other");
  assert.equal((await a.call("GET", "/articles/featured")).data._id, first._id);

  const list = (await a.call("GET", "/articles")).data;
  assert.equal(list.total, before + 1);
  assert.deepEqual(list.articles.map((x) => x.title).sort(), ["Brand New Story", "Original Featured", "Original Other"]);
  assert.equal((await a.call("GET", `/articles/${created.data._id}`)).data.title, "Brand New Story");
  assert.equal((await a.call("GET", "/articles?category=Culture")).data.total, 1);
  assert.equal((await a.call("GET", "/articles?search=brand")).data.total, 1);

  // Explicitly featuring a new article moves the flag but keeps the old article
  const f = await a.call("POST", "/articles", { ...article, title: "New Hero", featured: true });
  assert.equal((await a.call("GET", "/articles/featured")).data._id, f.data._id);
  assert.equal((await Article.findById(first._id)).featured, false);
  assert.equal(await Article.countDocuments({ featured: true }), 1);
  assert.equal(await Article.countDocuments(), before + 2);
});

test("login is rate limited", async () => {
  let last;
  for (let i = 0; i < 12; i++) {
    last = await client().call("POST", "/auth/login", { email: "rl@example.com", password: "WrongPass1" });
  }
  assert.equal(last.status, 429);
});
