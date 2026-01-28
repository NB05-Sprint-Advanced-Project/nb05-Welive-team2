const endpoint = 'http://localhost:4000/api/v2/users/super-admins';

async function createOne(i) {
  const dto = {
    username: `superadmin${i}`,
    email: `superadmin${i}@gmail.com`,
    contact: `0101111${String(i).padStart(4, '0')}`,
    name: `superadmin${i}`,
    password: `superadmin${i}!`,
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`i=${i} failed: ${res.status} ${body}`);
  }
}

(async () => {
  for (let i = 1; i <= 100; i++) {
    await createOne(i);
  }
  console.log('done: 100 super admins created');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
