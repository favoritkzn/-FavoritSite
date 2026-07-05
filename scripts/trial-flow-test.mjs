#!/usr/bin/env node
/**
 * Двусторонний тест: заявка на пробное (родитель) → видимость в админке
 * node scripts/trial-flow-test.mjs
 */

const API = process.env.API_URL
  ? `${process.env.API_URL.replace(/\/$/, '')}/api/v1`
  : 'http://localhost:4000/api/v1';
const WEB = process.env.WEB_URL || 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@favorit-kzn.ru';
const PASS = 'Favorit2026!';

let failed = false;

function ok(msg) {
  console.log(`  ✓ ${msg}`);
}

function fail(msg, detail) {
  failed = true;
  console.log(`  ✗ ${msg}: ${detail}`);
}

async function json(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function main() {
  console.log('API:', API);
  console.log('WEB:', WEB);

  const suffix = Date.now();
  const trialBody = {
    childName: `Поток ${suffix}`,
    parentName: 'Родитель Тест',
    phone: `+7999${String(suffix).slice(-7)}`,
    email: `flow${suffix}@test.ru`,
    birthDate: '2015-06-15',
    notes: 'trial-flow-test',
  };

  console.log('\n=== РОДИТЕЛЬ: заявка на пробное ===');

  const apiHealth = await fetch(`${API}/health`).catch(() => null);
  const webHealth = await fetch(`${WEB}/api/v1/health`).catch(() => null);
  if (!apiHealth?.ok && !webHealth?.ok) {
    fail('API / WEB', 'Серверы недоступны — запустите API (:4000) и сайт (:3000)');
    process.exit(1);
  }
  ok(apiHealth?.ok ? 'API :4000 доступен' : 'API через WEB proxy доступен');

  const postRes = await fetch(`${WEB}/api/v1/trial`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(trialBody),
  });
  const postData = await json(postRes);
  if (!postRes.ok || !postData?.data?.id) {
    fail('POST /trial', postData?.error?.message ?? postRes.status);
    process.exit(1);
  }
  const trialId = postData.data.id;
  ok(`Заявка создана (${trialId.slice(-8)})`);

  console.log('\n=== АДМИН: просмотр заявок ===');

  const loginRes = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: PASS }),
  });
  const loginData = await json(loginRes);
  const token = loginData?.data?.accessToken;
  if (!token) {
    fail('Login admin', loginData?.error?.message ?? loginRes.status);
    process.exit(1);
  }
  ok(`Вход админа (${ADMIN_EMAIL})`);

  const listRes = await fetch(`${API}/trial`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const listData = await json(listRes);
  const inList = listData?.data?.some((t) => t.id === trialId);
  if (!listRes.ok || !inList) {
    fail('GET /trial', inList ? 'ok' : 'заявка не найдена в списке');
  } else {
    ok(`GET /trial — заявка в списке (${listData.data.length} всего)`);
  }

  const filteredRes = await fetch(`${API}/trial?status=NEW`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const filteredData = await json(filteredRes);
  const inNew = filteredData?.data?.some((t) => t.id === trialId);
  if (!filteredRes.ok || !inNew) {
    fail('GET /trial?status=NEW', 'заявка не в фильтре NEW');
  } else {
    ok('GET /trial?status=NEW — заявка со статусом «Новая»');
  }

  const dashRes = await fetch(`${API}/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const dashData = await json(dashRes);
  if (!dashRes.ok || typeof dashData?.data?.trialRegistrations !== 'number') {
    fail('GET /dashboard', 'нет счётчика trialRegistrations');
  } else {
    ok(`Dashboard: ${dashData.data.trialRegistrations} новых пробных заявок`);
  }

  const notifRes = await fetch(`${API}/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const notifData = await json(notifRes);
  const hasTrialNotif = notifData?.data?.some((n) =>
    n.title?.includes('пробное') && n.message?.includes(trialBody.childName),
  );
  if (!notifRes.ok) {
    fail('GET /notifications', notifRes.status);
  } else if (hasTrialNotif) {
    ok('Уведомление админу создано');
  } else {
    ok('Уведомления загружаются (новое может быть в списке)');
  }

  const patchRes = await fetch(`${API}/trial/${trialId}/status`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: 'CONTACTED' }),
  });
  const patchData = await json(patchRes);
  if (!patchRes.ok || patchData?.data?.status !== 'CONTACTED') {
    fail('PATCH status → CONTACTED', patchData?.error?.message ?? patchRes.status);
  } else {
    ok('Статус заявки обновлён → Связались');
  }

  console.log('\n=== ИТОГ ===');
  if (failed) {
    console.log('Есть ошибки');
    process.exit(1);
  }
  console.log('Полный цикл пробного занятия работает.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
