// Runs authentication and identity actions against a disposable SQLite database.
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";
import SQLite from "better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
const require = createRequire(import.meta.url);
const temp = mkdtempSync(path.join(tmpdir(), "addisroom-auth-test-"));
const filename = path.join(temp, "test.db");
const sqlite = new SQLite(filename);
for (const migration of readdirSync("prisma/migrations").sort()) {
  if (migration !== "migration_lock.toml")
    sqlite.exec(
      readFileSync(`prisma/migrations/${migration}/migration.sql`, "utf8"),
    );
}
sqlite.close();
const db = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: `file:${filename}` }),
});
const cookieJar = new Map();
const cookieStore = {
  get: (name) =>
    cookieJar.has(name) ? { value: cookieJar.get(name) } : undefined,
  set: (name, value) => cookieJar.set(name, value),
  delete: (name) => cookieJar.delete(name),
};
const modules = new Map();
function redirect(url) {
  const error = new Error(url);
  error.digest = `NEXT_REDIRECT;${url}`;
  throw error;
}
let googleClaims = {};
let googleTokenFails = false;
const mocks = {
  "google-auth-library": {
    OAuth2Client: class {
      async getToken(options) {
        assert.ok(options.codeVerifier);
        return { tokens: { id_token: "mock-google-token" } };
      }
      async verifyIdToken(options) {
        assert.equal(options.audience, "test-google-client");
        if (googleTokenFails) throw new Error("Invalid token signature");
        return { getPayload: () => googleClaims };
      }
    },
  },
  "@/lib/prisma": { prisma: db },
  "next/headers": {
    cookies: async () => cookieStore,
    headers: async () => new Headers(),
  },
  "next/cache": { revalidatePath() {} },
  "next/navigation": {
    redirect,
    notFound: () => {
      throw new Error("404");
    },
  },
};
function load(name) {
  if (mocks[name]) return mocks[name];
  if (!name.startsWith("@/")) return require(name);
  if (modules.has(name)) return modules.get(name).exports;
  const file = path.resolve("src", name.slice(2) + ".ts");
  const output = ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const loadedModule = { exports: {} };
  modules.set(name, loadedModule);
  vm.runInThisContext(`(function(require,module,exports){${output}\n})`, {
    filename: file,
  })(load, loadedModule, loadedModule.exports);
  return loadedModule.exports;
}
const fd = (values) => {
  const data = new FormData();
  for (const [k, v] of Object.entries(values)) data.set(k, v);
  return data;
};
const redirected = (action, destination) =>
  assert.rejects(
    action,
    (e) => e.digest?.startsWith("NEXT_REDIRECT") && e.message === destination,
  );
for (const key of [
  "RESEND_API_KEY",
  "AUTH_EMAIL_FROM",
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_FROM_NUMBER",
])
  delete process.env[key];
process.env.AUTH_DELIVERY_MODE = "console";
process.env.NODE_ENV = "test";
process.env.IDENTITY_ENCRYPTION_KEY = "12".repeat(32);
const oldConsoleError = console.error;
console.error = () => {};
try {
  const otp = load("@/lib/otp");
  for (const number of [
    "0911234567",
    "0711234567",
    "+251911234567",
    "911234567",
  ])
    assert.match(
      otp.parseLoginTarget("SMS", number).target,
      /^\+251[79]\d{8}$/,
    );
  for (const number of [
    "+48123456789",
    "0111234567",
    "09112345678",
    "foo0911234567",
    "",
  ])
    assert.throws(() => otp.parseLoginTarget("SMS", number));
  assert.throws(() => otp.parseLoginTarget("EMAIL", "not@an email.com"));
  const actions = load("@/lib/auth-actions");
  const session = load("@/lib/session");
  const auth = load("@/lib/auth");
  const user = await db.profile.create({
    data: { name: "Victim", email: "victim@example.com" },
  });
  cookieJar.set("addis_profile_id", user.id);
  cookieJar.set(session.SESSION_COOKIE, user.id);
  assert.equal(
    await auth.getSessionProfileId(),
    null,
    "user IDs cannot forge sessions",
  );
  const denied = await actions.setPasswordAfterOtp(
    null,
    fd({
      profileId: user.id,
      password: "Password123",
      confirmPassword: "Password123",
    }),
  );
  assert.equal(
    denied.ok,
    false,
    "password setup requires a server-issued proof",
  );
  assert.equal(
    (await db.profile.findUnique({ where: { id: user.id } })).passwordHash,
    null,
  );
  cookieJar.clear();
  const sent = await actions.sendOtpCode(
    null,
    fd({
      name: "Test Renter",
      channel: "EMAIL",
      contact: "renter@example.com",
    }),
  );
  assert.equal(sent.ok, true);
  assert.equal(
    (
      await actions.sendOtpCode(
        null,
        fd({
          name: "Test Renter",
          channel: "EMAIL",
          contact: "renter@example.com",
        }),
      )
    ).ok,
    false,
    "resends are throttled",
  );
  const verified = await actions.verifyOtpAndLogin(
    null,
    fd({ challengeId: sent.challengeId, code: sent.previewCode }),
  );
  assert.equal(verified.needsPassword, true);
  assert.equal(
    await auth.getSessionProfileId(),
    null,
    "setup cookie cannot access the application",
  );
  assert.equal(
    (
      await actions.verifyOtpAndLogin(
        null,
        fd({ challengeId: sent.challengeId, code: sent.previewCode }),
      )
    ).ok,
    false,
    "OTP is single use",
  );
  await redirected(
    () =>
      actions.setPasswordAfterOtp(
        null,
        fd({
          profileId: user.id,
          password: "Password123",
          confirmPassword: "Password123",
        }),
      ),
    "/onboarding",
  );
  const renter = await db.profile.findUniqueOrThrow({
    where: { id: verified.profileId },
  });
  assert.ok(
    renter.passwordHash,
    "setup uses authenticated subject, ignoring submitted user ID",
  );
  assert.equal(
    (await db.profile.findUnique({ where: { id: user.id } })).passwordHash,
    null,
  );
  assert.ok(renter.emailVerifiedAt);
  assert.equal(
    renter.verified,
    false,
    "contact verification never grants identity approval",
  );
  await redirected(() => auth.requireApprovedProfile(), "/onboarding");
  await db.profile.update({
    where: { id: renter.id },
    data: { profileComplete: true },
  });
  await redirected(() => auth.requireApprovedProfile(), "/verification");
  await assert.rejects(() => auth.requireAdmin(), /404/);
  const identity = load("@/lib/identity-actions");
  const image = new File(
    [
      Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aY9sAAAAASUVORK5CYII=",
        "base64",
      ),
    ],
    "test.png",
    { type: "image/png" },
  );
  const identityData = {
    legalName: "Test Renter",
    city: "Addis Ababa",
    subCity: "Bole",
    woreda: "03",
    address: "House 123 Example Street",
    idType: "FAYDA_FIN",
    idNumber: "123456789012",
    consent: "on",
    document: image,
    portrait: image,
  };
  await redirected(
    () => identity.submitIdentity(null, fd(identityData)),
    "/verification",
  );
  const document = await db.identityDocument.findFirstOrThrow({
    where: { profileId: renter.id },
  });
  const storage = load("@/lib/identity-storage");
  assert.deepEqual(
    storage.decryptDocument(document.encryptedData),
    Buffer.from(await image.arrayBuffer()),
  );
  assert.notDeepEqual(
    Buffer.from(document.encryptedData),
    Buffer.from(await image.arrayBuffer()),
  );
  const tampered = Buffer.from(document.encryptedData);
  tampered[30] ^= 1;
  assert.throws(
    () => storage.decryptDocument(tampered),
    "tampered encrypted images are rejected",
  );
  const saved = await db.profile.findUniqueOrThrow({
    where: { id: renter.id },
  });
  assert.equal(saved.idLastFour, "9012");
  assert.equal(saved.identityStatus, "PENDING");
  assert.ok(
    (await identity.submitIdentity(null, fd(identityData))).error,
    "pending submissions cannot be replaced",
  );
  const admin = await db.profile.create({
    data: {
      name: "Admin",
      email: "admin@example.com",
      emailVerifiedAt: new Date(),
      isAdmin: true,
    },
  });
  await session.clearSession();
  await session.createSession(admin.id);
  await identity.reviewIdentity(
    fd({
      profileId: renter.id,
      decision: "REJECTED",
      note: "Please upload a clearer document.",
    }),
  );
  assert.equal(
    (await db.profile.findUniqueOrThrow({ where: { id: renter.id } }))
      .identityStatus,
    "REJECTED",
  );
  await session.clearSession();
  await session.createSession(renter.id);
  await redirected(
    () => identity.submitIdentity(null, fd(identityData)),
    "/verification",
  );
  await session.clearSession();
  await session.createSession(admin.id);
  await identity.reviewIdentity(
    fd({
      profileId: renter.id,
      decision: "APPROVED",
      note: "Document and portrait reviewed.",
    }),
  );
  await assert.rejects(() =>
    identity.reviewIdentity(
      fd({
        profileId: renter.id,
        decision: "REJECTED",
        note: "Duplicate review must fail.",
      }),
    ),
  );
  assert.equal(await db.adminAudit.count(), 2);
  await session.clearSession();
  await session.createSession(renter.id);
  assert.equal((await auth.requireApprovedProfile()).id, renter.id);
  const current = await session.readSession();
  await db.session.update({
    where: { tokenHash: current.tokenHash },
    data: { expiresAt: new Date(0) },
  });
  assert.equal(await auth.getSessionProfileId(), null, "expired sessions fail");
  const sms = await actions.sendOtpCode(
    null,
    fd({ name: "SMS Renter", channel: "SMS", contact: "0711234567" }),
  );
  assert.equal(sms.ok, true);
  const wrong = sms.previewCode === "111111" ? "222222" : "111111";
  for (let i = 0; i < 5; i++)
    assert.equal(
      (
        await actions.verifyOtpAndLogin(
          null,
          fd({ challengeId: sms.challengeId, code: wrong }),
        )
      ).ok,
      false,
    );
  assert.equal(
    (
      await actions.verifyOtpAndLogin(
        null,
        fd({ challengeId: sms.challengeId, code: sms.previewCode }),
      )
    ).ok,
    false,
    "locked codes cannot be used",
  );
  const sms2 = await actions.sendOtpCode(
    null,
    fd({ name: "SMS Renter", channel: "SMS", contact: "0911234567" }),
  );
  const smsVerified = await actions.verifyOtpAndLogin(
    null,
    fd({ challengeId: sms2.challengeId, code: sms2.previewCode }),
  );
  const smsUser = await db.profile.findUniqueOrThrow({
    where: { id: smsVerified.profileId },
  });
  assert.equal(smsUser.phone, "+251911234567");
  assert.ok(smsUser.phoneVerifiedAt);
  const expired = await db.otpChallenge.create({
    data: {
      channel: "EMAIL",
      target: "expired@example.com",
      name: "Expired",
      codeHash: otp.hashOtpCode("123456"),
      expiresAt: new Date(0),
    },
  });
  assert.equal(
    (
      await actions.verifyOtpAndLogin(
        null,
        fd({ challengeId: expired.id, code: "123456" }),
      )
    ).ok,
    false,
  );
  const documentRoute = load("@/app/api/identity-documents/[id]/route");
  await session.clearSession();
  assert.equal(
    (
      await documentRoute.GET(new Request("http://localhost"), {
        params: Promise.resolve({ id: document.id }),
      })
    ).status,
    401,
  );
  await session.createSession(smsUser.id);
  assert.equal(
    (
      await documentRoute.GET(new Request("http://localhost"), {
        params: Promise.resolve({ id: document.id }),
      })
    ).status,
    404,
    "other users cannot read private documents",
  );
  await session.clearSession();
  await session.createSession(renter.id);
  const ownDocument = await documentRoute.GET(new Request("http://localhost"), {
    params: Promise.resolve({ id: document.id }),
  });
  assert.equal(ownDocument.status, 200);
  assert.match(ownDocument.headers.get("cache-control"), /no-store/);
  const delivery = load("@/lib/auth-delivery");
  process.env.NODE_ENV = "production";
  await assert.rejects(
    () => delivery.deliverCode("EMAIL", "x@example.com", "123456"),
    /not configured/,
    "production cannot use console delivery",
  );
  const originalFetch = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (url, init) => {
    requests.push({ url, init });
    return new Response("{}", { status: 200 });
  };
  try {
    process.env.RESEND_API_KEY = "test-key";
    process.env.AUTH_EMAIL_FROM = "verify@example.com";
    await delivery.deliverCode("EMAIL", "x@example.com", "123456");
    assert.equal(requests[0].url, "https://api.resend.com/emails");
    assert.equal(JSON.parse(requests[0].init.body).to[0], "x@example.com");
    process.env.TWILIO_ACCOUNT_SID = "test-sid";
    process.env.TWILIO_AUTH_TOKEN = "test-token";
    process.env.TWILIO_FROM_NUMBER = "AddisRoom";
    await delivery.deliverCode("SMS", "+251911234567", "123456");
    assert.equal(requests[1].init.body.get("To"), "+251911234567");
    globalThis.fetch = async () => new Response("{}", { status: 403 });
    await assert.rejects(
      () => delivery.deliverCode("SMS", "+251911234567", "123456"),
      /delivery failed/,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
  // Admin operations and public search share the same authorization state.
  process.env.NODE_ENV = "test";
  await session.clearSession();
  await session.createSession(admin.id);
  const ops = load("@/lib/admin-actions");
  assert.ok(
    (await ops.manageUser(null, fd({ id: renter.id, command: "grant-admin" })))
      .error,
    "regular admins cannot grant access",
  );
  await db.profile.update({
    where: { id: admin.id },
    data: { isSuperAdmin: true },
  });
  assert.ok(
    (await ops.manageUser(null, fd({ id: admin.id, command: "revoke-admin" })))
      .error,
    "super admins cannot revoke their own access",
  );
  assert.ok(
    (await ops.manageUser(null, fd({ id: renter.id, command: "grant-admin" })))
      .success,
  );
  assert.equal(
    (await db.profile.findUniqueOrThrow({ where: { id: renter.id } })).isAdmin,
    true,
  );
  assert.ok(
    (await ops.manageUser(null, fd({ id: renter.id, command: "suspend" })))
      .error,
    "admins cannot be suspended",
  );
  assert.ok(
    (await ops.manageUser(null, fd({ id: renter.id, command: "revoke-admin" })))
      .success,
  );
  await db.profile.update({
    where: { id: renter.id },
    data: { role: "AGENT" },
  });
  assert.ok(
    (await ops.verifyBroker(null, fd({ id: renter.id, approve: "true" })))
      .success,
  );
  assert.equal(
    (await db.profile.findUniqueOrThrow({ where: { id: renter.id } }))
      .brokerVerified,
    true,
  );
  assert.ok(
    (await ops.verifyBroker(null, fd({ id: renter.id, approve: "false" })))
      .success,
  );
  assert.ok(
    (await ops.verifyBroker(null, fd({ id: smsUser.id, approve: "true" })))
      .error,
    "non-agents cannot gain a broker badge",
  );
  assert.ok(
    (
      await ops.manageSponsorship(
        null,
        fd({
          headline: "First sponsor",
          body: "First body",
          linkUrl: "javascript:alert(1)",
        }),
      )
    ).error,
  );
  assert.ok(
    (
      await ops.manageSponsorship(
        null,
        fd({
          headline: "First sponsor",
          body: "First body",
          linkUrl: "https://example.com",
        }),
      )
    ).success,
  );
  assert.ok(
    (
      await ops.manageSponsorship(
        null,
        fd({ headline: "Second sponsor", body: "Second body" }),
      )
    ).success,
  );
  assert.equal(await db.sponsorship.count({ where: { activeSlot: 1 } }), 1);
  const sponsor = await db.sponsorship.findUniqueOrThrow({
    where: { activeSlot: 1 },
  });
  assert.equal(sponsor.headline, "First sponsor");
  assert.ok(
    (
      await ops.manageSponsorship(
        null,
        fd({
          headline: "Draft promo",
          body: "Draft body",
          publication: "draft",
          theme: "dark",
          animated: "off",
          ctaLabel: "Explore",
          isSample: "on",
        }),
      )
    ).success,
  );
  const draftPromo = await db.sponsorship.findFirstOrThrow({
    where: { headline: "Draft promo" },
  });
  assert.equal(draftPromo.activeSlot, null);
  assert.equal(draftPromo.theme, "dark");
  assert.equal(draftPromo.animated, false);
  assert.equal(draftPromo.isSample, true);
  assert.equal(
    (await db.sponsorship.findUniqueOrThrow({ where: { activeSlot: 1 } })).id,
    sponsor.id,
    "Saving a draft must not replace the live promotion",
  );
  assert.ok(
    (
      await ops.manageSponsorship(
        null,
        fd({
          command: "update",
          id: draftPromo.id,
          headline: "Updated promotion",
          body: "Updated body",
          publication: "publish",
          theme: "neutral",
          animated: "on",
          ctaLabel: "Explore services",
          linkUrl: "https://example.com/services",
        }),
      )
    ).success,
  );
  assert.equal(
    (await db.sponsorship.findUniqueOrThrow({ where: { activeSlot: 3 } })).id,
    draftPromo.id,
  );
  assert.equal(await db.sponsorship.count({ where: { activeSlot: 1 } }), 1);
  assert.equal(
    await db.sponsorship.count({ where: { activeSlot: { not: null } } }),
    3,
  );
  assert.ok(
    (
      await ops.manageSponsorship(
        null,
        fd({ headline: "Fourth promotion", body: "No free slot" }),
      )
    ).error,
  );
  assert.equal(
    await db.sponsorship.count({ where: { activeSlot: { not: null } } }),
    3,
  );
  const badUpdate = await ops.manageSponsorship(
    null,
    fd({
      command: "update",
      id: draftPromo.id,
      headline: "Invalid promo",
      body: "Body",
      theme: "unsupported",
      publication: "publish",
    }),
  );
  assert.ok(badUpdate.error);
  assert.equal(
    (await db.sponsorship.findUniqueOrThrow({ where: { activeSlot: 3 } }))
      .headline,
    "Updated promotion",
  );
  assert.ok(
    (
      await ops.manageSponsorship(
        null,
        fd({ command: "activate", id: sponsor.id }),
      )
    ).success,
  );

  assert.ok(
    (
      await ops.manageSponsorship(
        null,
        fd({ id: sponsor.id, command: "deactivate" }),
      )
    ).success,
  );
  assert.equal(await db.sponsorship.count({ where: { activeSlot: 1 } }), 0);
  assert.ok(
    (
      await ops.manageSponsorship(
        null,
        fd({ id: sponsor.id, command: "activate" }),
      )
    ).success,
  );
  const listing = await db.listing.create({
    data: {
      title: "Furnished Bole apartment",
      description: "Test apartment",
      neighborhood: "Bole",
      bedrooms: "TWO",
      priceBirr: 25000,
      areaSqm: 90,
      furnished: true,
      postedById: renter.id,
      published: true,
    },
  });
  const filters = load("@/lib/search-shared");
  const search = load("@/lib/search");
  const f = filters.parseSearchParams({
    neighborhood: "Bole",
    rooms: "TWO",
    priceMin: "20000",
    priceMax: "30000",
    furnished: "1",
  });
  assert.equal((await search.searchListings(f)).total, 1);
  // A legacy or manually crafted sale query cannot expose sale listings.
  assert.equal(
    filters.parseSearchParams({ deal: "sale", radius: "5", areaMin: "10" })
      .deal,
    "RENT",
  );
  assert.equal(
    filters.parseSearchParams({ radius: "5", areaMin: "10" }).radiusKm,
    null,
  );
  const saleFixture = await db.listing.create({
    data: {
      title: "TEST ONLY sale hidden",
      description: "Rental-only regression",
      neighborhood: "Bole",
      roomType: "ROOM",
      propertyType: "APARTMENT",
      bedrooms: "TWO",
      priceBirr: 25000,
      furnished: true,
      dealType: "SALE",
      postedById: renter.id,
      published: true,
    },
  });
  assert.equal((await search.searchListings({ ...f, deal: "SALE" })).total, 1);
  assert.ok(
    !(
      await search.searchListings(
        filters.parseSearchParams({ deal: "sale", view: "map" }),
      )
    ).items.some((l) => l.id === saleFixture.id),
  );
  await db.listing.delete({ where: { id: saleFixture.id } });

  assert.equal(
    (await search.searchListings({ ...f, priceMax: 1000 })).total,
    0,
  );
  assert.equal(
    filters.parseSearchParams({ propertyType: "SHOP", rooms: "TWO" }).rooms
      .length,
    0,
  );
  assert.ok(
    (
      await ops.moderateListing(
        null,
        fd({
          id: listing.id,
          command: "archive",
          note: "Test moderation removal.",
        }),
      )
    ).success,
  );
  assert.equal((await search.searchListings(f)).total, 0);
  assert.equal(
    (await db.listing.findUniqueOrThrow({ where: { id: listing.id } }))
      .published,
    true,
    "archiving preserves publication state",
  );
  assert.ok(
    (
      await ops.moderateListing(
        null,
        fd({
          id: listing.id,
          command: "restore",
          note: "Test moderation restore.",
        }),
      )
    ).success,
  );
  assert.equal((await search.searchListings(f)).total, 1);
  assert.ok(
    (await ops.manageUser(null, fd({ id: renter.id, command: "suspend" })))
      .success,
  );
  assert.equal(await db.session.count({ where: { profileId: renter.id } }), 0);
  assert.equal(
    (await search.searchListings(f)).total,
    0,
    "suspended owners are hidden from search",
  );
  await session.createSession(renter.id);
  assert.equal(
    await session.readSession(),
    null,
    "suspended accounts cannot use even a valid session token",
  );
  await session.clearSession();
  await session.createSession(admin.id);
  assert.ok(
    (await ops.manageUser(null, fd({ id: renter.id, command: "restore" })))
      .success,
  );
  assert.equal((await search.searchListings(f)).total, 1);
  await session.clearSession();
  await session.createSession(smsUser.id);
  await assert.rejects(
    () =>
      ops.manageSponsorship(
        null,
        fd({ headline: "Unauthorized", body: "Must fail" }),
      ),
    /404/,
  );
  await session.clearSession();
  process.env.GOOGLE_CLIENT_ID = "test-google-client";
  process.env.GOOGLE_CLIENT_SECRET = "test-google-secret";
  process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
  const google = load("@/lib/google-auth");
  assert.equal(google.safeAuthNext("//evil.example"), "/");
  assert.equal(google.safeAuthNext("/\\evil.example"), "/");
  const begin = async () => {
    const url = new URL(await google.startGoogleLogin("/saved"));
    assert.equal(url.origin, "https://accounts.google.com");
    assert.equal(url.searchParams.get("code_challenge_method"), "S256");
    const state = url.searchParams.get("state");
    const flow = await db.oAuthLogin.findUniqueOrThrow({
      where: { stateHash: session.tokenHash(state) },
    });
    return { state, flow };
  };
  let flow = await begin();
  await assert.rejects(
    () => google.finishGoogleLogin("a".repeat(64), "code"),
    /GOOGLE_STATE/,
  );
  flow = await begin();
  googleClaims = {
    sub: "test-google-subject",
    email: "google-new@gmail.com",
    email_verified: true,
    nonce: "wrong-nonce",
    name: "Google Test",
  };
  await assert.rejects(
    () => google.finishGoogleLogin(flow.state, "code"),
    /GOOGLE_TOKEN/,
  );
  flow = await begin();
  googleClaims.nonce = flow.flow.nonce;
  googleTokenFails = true;
  await assert.rejects(
    () => google.finishGoogleLogin(flow.state, "code"),
    /Invalid token/,
  );
  googleTokenFails = false;
  flow = await begin();
  googleClaims.nonce = flow.flow.nonce;
  assert.equal(
    await google.finishGoogleLogin(flow.state, "code"),
    "/onboarding",
  );
  const googleUser = await db.profile.findUniqueOrThrow({
    where: { googleSubject: "test-google-subject" },
  });
  assert.equal(googleUser.email, "google-new@gmail.com");
  assert.ok(googleUser.emailVerifiedAt);
  assert.equal(
    googleUser.identityStatus,
    "NOT_SUBMITTED",
    "Google email proof never grants identity approval",
  );
  await assert.rejects(
    () => google.finishGoogleLogin(flow.state, "code"),
    /GOOGLE_STATE/,
  );
  flow = await begin();
  googleClaims = {
    ...googleClaims,
    nonce: flow.flow.nonce,
    sub: "untrusted-subject",
    email: "thirdparty@example.com",
  };
  await assert.rejects(
    () => google.finishGoogleLogin(flow.state, "code"),
    /GOOGLE_EMAIL/,
  );
  await db.profile.update({
    where: { id: googleUser.id },
    data: { suspendedAt: new Date() },
  });
  flow = await begin();
  googleClaims = {
    ...googleClaims,
    nonce: flow.flow.nonce,
    sub: "test-google-subject",
    email: "google-new@gmail.com",
  };
  await assert.rejects(
    () => google.finishGoogleLogin(flow.state, "code"),
    /GOOGLE_SUSPENDED/,
  );
  flow = await begin();
  googleClaims = {
    ...googleClaims,
    nonce: flow.flow.nonce,
    sub: "linked-existing-subject",
    email: "existing@gmail.com",
  };
  const existingGoogle = await db.profile.create({
    data: {
      name: "Existing Name",
      email: "existing@gmail.com",
      emailVerifiedAt: new Date(),
    },
  });
  assert.equal(
    await google.finishGoogleLogin(flow.state, "code"),
    "/onboarding",
  );
  assert.equal(
    (await db.profile.findUniqueOrThrow({ where: { id: existingGoogle.id } }))
      .googleSubject,
    "linked-existing-subject",
  );
  assert.equal(
    await db.profile.count({ where: { email: "existing@gmail.com" } }),
    1,
  );
  await session.clearSession();
  await db.profile.update({
    where: { id: admin.id },
    data: {
      passwordHash: load("@/lib/password").hashPassword("AdminTestPassword123"),
    },
  });
  const adminCode = await db.otpChallenge.create({
    data: {
      channel: "EMAIL",
      target: "admin@example.com",
      name: "Admin",
      codeHash: otp.hashOtpCode("135790"),
      expiresAt: new Date(Date.now() + 600000),
    },
  });
  await redirected(
    () =>
      actions.verifyOtpAndLogin(
        null,
        fd({ challengeId: adminCode.id, code: "135790" }),
      ),
    "/admin",
  );
  assert.equal(
    await auth.getSessionProfileId(),
    admin.id,
    "verified admin OTP returns to the admin dashboard",
  );
  const amenityTools = load("@/lib/amenities");
  assert.deepEqual(
    amenityTools.parseAmenities([
      "WIFI",
      "WIFI",
      "UNKNOWN",
      "NO_PARKING",
      "PARKING",
    ]),
    ["WIFI", "PARKING"],
  );
  assert.ok(
    filters
      .parseSearchParams({ furnished: "1" })
      .amenities.includes("FURNISHED"),
    "legacy furnished links remain supported",
  );
  const amenityFilter = filters.parseSearchParams({
    amenities: [
      "PARKING",
      "WIFI",
      "ELEVATOR",
      "BALCONY",
      "BILLS_INCLUDED",
      "FURNISHED",
    ],
    priceMin: "20000",
    priceMax: "30000",
    view: "map",
  });
  const roundTrip = filters.parseSearchParams(
    Object.fromEntries(
      new URLSearchParams(filters.buildSearchUrl(amenityFilter).split("?")[1]),
    ),
  );
  const amenityUrl = new URL(
    filters.buildSearchUrl(amenityFilter),
    "http://localhost",
  );
  assert.equal(amenityUrl.searchParams.getAll("amenities").length, 6);
  assert.equal(roundTrip.view, "map");
  assert.equal(roundTrip.priceMax, 30000);
  await db.listing.update({
    where: { id: listing.id },
    data: {
      parking: true,
      wifi: true,
      elevator: true,
      balcony: true,
      billsIncluded: true,
    },
  });
  assert.equal((await search.searchListings(amenityFilter)).total, 1);
  await db.listing.update({ where: { id: listing.id }, data: { wifi: false } });
  assert.equal(
    (await search.searchListings(amenityFilter)).total,
    0,
    "every selected amenity must match",
  );
  const noParking = filters.parseSearchParams({ amenities: ["NO_PARKING"] });
  await db.listing.update({
    where: { id: listing.id },
    data: { parking: null },
  });
  assert.equal(
    (await search.searchListings(noParking)).total,
    0,
    "unknown parking is not advertised as unavailable",
  );
  await db.listing.update({
    where: { id: listing.id },
    data: { parking: false },
  });
  assert.equal((await search.searchListings(noParking)).total, 1);
  await session.clearSession();
  await session.createSession(renter.id);
  mocks["@/lib/payments"] = {
    initializeListingPayment: async () => ({ checkoutUrl: "/test-checkout" }),
  };
  const posting = load("@/app/actions");
  await assert.rejects(
    () =>
      posting.createListing(
        fd({
          title: "TEST ONLY rejected sale",
          description: "Must not be created",
          area: "Bole Subcity",
          neighborhood: "Edna Mall area",
          propertyType: "APARTMENT",
          availableFrom: "2027-01-01",
          priceBirr: "28000",
          dealType: "SALE",
        }),
      ),
    /only accepts rental/,
  );
  assert.equal(
    await db.listing.count({ where: { title: "TEST ONLY rejected sale" } }),
    0,
  );

  await redirected(
    () =>
      posting.createListing(
        fd({
          title: "Amenity persistence test",
          description: "Testing landlord-supplied amenities",
          area: "Bole Subcity",
          neighborhood: "Edna Mall area",
          propertyType: "APARTMENT",
          availableFrom: "2027-01-01",
          priceBirr: "28000",
          parking: "on",
          wifi: "on",
          elevator: "on",
          balcony: "on",
          billsIncluded: "on",
          furnished: "on",
        }),
      ),
    "/test-checkout",
  );
  const posted = await db.listing.findFirstOrThrow({
    where: { title: "Amenity persistence test" },
  });
  for (const a of amenityTools.AMENITIES)
    assert.equal(
      posted[a.field],
      true,
      "listing amenity is stored: " + a.field,
    );
  assert.equal(
    posted.published,
    false,
    "amenities cannot bypass payment publication",
  );
  const locations = load("@/lib/locations");
  assert.equal(locations.LOCATION_AREAS.length, 17);
  assert.equal(
    locations.LOCATION_AREAS.filter((a) => a.kind === "subcity").length,
    11,
  );
  assert.equal(
    locations.LOCATION_AREAS.filter((a) => a.kind === "surrounding").length,
    6,
  );
  assert.deepEqual(
    locations.LOCATION_AREAS.map((a) =>
      a.groups.reduce((sum, g) => sum + g.neighborhoods.length, 0),
    ),
    [34, 36, 22, 19, 14, 18, 18, 17, 19, 16, 11, 4, 7, 6, 5, 4, 6],
    "complete supplied catalogue, including entries repeated in separate corridors",
  );
  assert.ok(locations.neighborhoodBelongsTo("Yeka Subcity", "Wesen Grocery"));
  assert.ok(locations.neighborhoodBelongsTo("Sebeta", "Furi"));
  assert.ok(
    locations.neighborhoodBelongsTo(
      "Lemi Kura Subcity",
      "Summit (Condominium, 72, Summit Giorgis, Moha Soft Drinks)",
    ),
  );
  assert.ok(
    locations.neighborhoodBelongsTo(
      "Bole Subcity",
      "Bole Arabsa (Condominium)",
    ),
  );
  assert.ok(
    locations.neighborhoodBelongsTo(
      "Lemi Kura Subcity",
      "Bole Arabsa (Condominium)",
    ),
  );
  assert.throws(() =>
    locations.validateListingLocation("Yeka Subcity", "Furi"),
  );
  assert.throws(() => locations.validateListingLocation("", "Wesen Grocery"));
  assert.throws(() => locations.validateListingLocation("Sebeta", ""));
  assert.equal(
    filters.parseSearchParams({ area: "Yeka Subcity", neighborhood: "Furi" })
      .neighborhood,
    "",
  );
  assert.equal(
    filters.parseSearchParams({
      area: "NOT AN AREA",
      neighborhood: "Wesen Grocery",
    }).area,
    "",
  );
  const cascade = filters.parseSearchParams({
    area: "Yeka Subcity",
    neighborhood: "Wesen Grocery",
    amenities: ["WIFI"],
    priceMin: "10000",
    priceMax: "30000",
    view: "map",
  });
  const cascadeUrl = new URL(
    filters.buildSearchUrl(cascade, { sort: "price_asc" }),
    "http://localhost",
  );
  assert.equal(cascadeUrl.searchParams.get("area"), "Yeka Subcity");
  assert.equal(cascadeUrl.searchParams.get("neighborhood"), "Wesen Grocery");
  assert.equal(cascadeUrl.searchParams.get("amenities"), "WIFI");
  assert.equal(cascadeUrl.searchParams.get("view"), "map");
  await db.listing.update({
    where: { id: listing.id },
    data: { area: "Yeka Subcity", neighborhood: "Wesen Grocery", wifi: true },
  });
  assert.equal((await search.searchListings(cascade)).total, 1);
  assert.equal(
    (
      await search.searchListings({
        ...cascade,
        area: "Sebeta",
        neighborhood: "Furi",
      })
    ).total,
    0,
  );
  assert.equal(
    (await search.searchListings({ ...cascade, neighborhood: "" })).total,
    1,
    "area-only search includes all its neighborhoods",
  );
  await assert.rejects(
    () =>
      posting.createListing(
        fd({
          area: "Yeka Subcity",
          neighborhood: "Furi",
          title: "Invalid cascade",
          description: "Must not be saved",
          propertyType: "APARTMENT",
          availableFrom: "2027-01-01",
          priceBirr: "10000",
        }),
      ),
    /belonging/,
  );
  assert.equal(
    await db.listing.count({ where: { title: "Invalid cascade" } }),
    0,
  );
  await redirected(
    () =>
      posting.createListing(
        fd({
          area: "Sebeta",
          neighborhood: "Furi",
          title: "Surrounding area persistence",
          description: "Test only",
          propertyType: "APARTMENT",
          availableFrom: "2027-01-01",
          priceBirr: "16000",
        }),
      ),
    "/test-checkout",
  );
  const surrounding = await db.listing.findFirstOrThrow({
    where: { title: "Surrounding area persistence" },
  });
  assert.equal(surrounding.area, "Sebeta");
  assert.equal(surrounding.neighborhood, "Furi");
  assert.equal(surrounding.city, "Sebeta");
  assert.equal(posted.area, "Bole Subcity");
  assert.equal(posted.neighborhood, "Edna Mall area");
  assert.equal(posted.city, "Addis Ababa");
  console.log(
    "PASS: Ethiopian contacts, OTP throttle/replay, session forgery/expiry, password setup authorization, encrypted uploads, approval gates, reject/resubmit/approve, review audit, production delivery guard, admin access, sponsorships, broker badges, moderation, search, Google PKCE/state/nonce/replay/token validation account linking, grouped amenities, parking availability, map/filter URLs, and listing amenity persistence, complete cascading catalogue, parent validation, and location persistence.",
  );
} finally {
  console.error = oldConsoleError;
  await db.$disconnect();
  rmSync(temp, { recursive: true, force: true });
}
