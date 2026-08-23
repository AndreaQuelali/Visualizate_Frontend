import { expect, test, type Page } from '@playwright/test';

const MAILPIT = process.env.E2E_MAILPIT_URL ?? 'http://localhost:8025';
const stamp = Date.now();
const email = `e2e-${stamp}@example.test`;
// Throwaway account for a local/CI database; never a real credential.
const password = `E2e-${stamp}-Aa1!`;

// Long enough to overflow the default text box, so the automatic rules suggest
// a smaller font size (a recommendation that carries an applicable patch).
const LONG_TITLE =
  'Gran concierto de otoño con orquesta sinfónica y coro invitado en el teatro municipal';

interface MailpitMessage {
  ID: string;
}

/** Reads the verification link Mailpit received for the test account. */
async function verificationLink(page: Page): Promise<string> {
  let link: string | null = null;
  await expect
    .poll(
      async () => {
        const search = await page.request.get(
          `${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`,
        );
        const { messages } = (await search.json()) as {
          messages: MailpitMessage[];
        };
        if (!messages?.length) return false;
        const msg = await page.request.get(
          `${MAILPIT}/api/v1/message/${messages[0].ID}`,
        );
        const { Text, HTML } = (await msg.json()) as {
          Text: string;
          HTML: string;
        };
        const match = `${Text}\n${HTML}`.match(
          /https?:\/\/[^\s"'<>]*verify-email\?token=[A-Za-z0-9_.-]+/,
        );
        link = match ? match[0] : null;
        return link !== null;
      },
      { timeout: 30_000, message: 'verification email not received' },
    )
    .toBe(true);
  return link!;
}

test('registro → workspace → marca → plantilla → pieza → exportar → revisar → aplicar', async ({
  page,
}) => {
  // ── 1. Registro y verificación de correo ────────────────────────────────
  await page.goto('/register');
  await page.getByLabel(/nombre completo/i).fill('Persona E2E');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.locator('#confirmPassword').fill(password);
  await page.locator('#terms').check();
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/check-email/);

  const link = await verificationLink(page);
  const url = new URL(link);
  await page.goto(`${url.pathname}${url.search}`);
  await expect(
    page.getByText(/verificad|éxito|correctamente/i).first(),
  ).toBeVisible();

  // ── 2. Login y creación del workspace ───────────────────────────────────
  await page.goto('/login');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/workspaces/);

  await page
    .getByRole('button', { name: /crear|nuevo/i })
    .first()
    .click();
  await page.locator('#ws-name').fill(`E2E ${stamp}`);
  await page
    .getByRole('dialog')
    .getByRole('button', { name: /crear/i })
    .click();
  await expect(page).toHaveURL(/dashboard/);

  // Un workspace nuevo ve los tres pasos guiados.
  await expect(
    page.getByRole('region', { name: /primeros pasos/i }),
  ).toBeVisible();

  // ── 3. Marca ─────────────────────────────────────────────────────────────
  await page.goto('/brand');
  await page.getByRole('button', { name: /añadir color/i }).click();
  await page.getByLabel('Nombre del color').first().fill('Indigo');
  await page.getByLabel('Valor hexadecimal').first().fill('#4648d4');
  await page.getByRole('button', { name: /guardar marca/i }).click();
  await expect(page.getByText(/guardad/i).first()).toBeVisible();

  // ── 4. Plantilla: una capa de texto vinculada a un campo ────────────────
  await page.goto('/templates');
  await page
    .getByRole('button', { name: /nueva plantilla/i })
    .first()
    .click();
  await page.locator('#tpl-name').fill('Flyer E2E');
  await page
    .getByRole('dialog')
    .getByRole('button', { name: /crear/i })
    .click();
  await page.getByRole('link', { name: /flyer e2e/i }).click();
  await expect(page).toHaveURL(/templates\/.+\/edit/);

  await page.getByRole('button', { name: 'Texto', exact: true }).click();
  await page.getByRole('button', { name: 'Campo', exact: true }).click();
  await page.getByLabel('Etiqueta del campo').first().fill('Título');
  // La capa recién creada queda seleccionada: vincúlala al campo.
  await page.getByLabel('Campo vinculado').selectOption({ index: 1 });
  await page.getByRole('button', { name: /^publicar$/i }).click();
  const confirm = page.getByRole('alertdialog').getByRole('button', {
    name: /publicar/i,
  });
  if (await confirm.isVisible().catch(() => false)) await confirm.click();
  await expect(page.getByText(/publicada/i).first()).toBeVisible();

  // ── 5. Pieza ─────────────────────────────────────────────────────────────
  await page.goto('/pieces/new');
  await page.getByRole('radio').first().click();
  await page.locator('#piece-title').fill('Concierto E2E');
  await page.getByRole('button', { name: /crear pieza/i }).click();
  await expect(page).toHaveURL(/pieces\/[0-9a-f-]{36}/);

  await page.getByRole('textbox', { name: 'Título' }).last().fill(LONG_TITLE);
  await page.getByRole('button', { name: /guardar borrador/i }).click();
  await page.getByRole('button', { name: /marcar como lista/i }).click();
  await expect(page.getByText('Lista', { exact: true }).first()).toBeVisible();

  // ── 6. Exportar ──────────────────────────────────────────────────────────
  await page
    .getByRole('button', { name: /exportar/i })
    .first()
    .click();
  await page.getByRole('menuitem', { name: /PNG \(1×\)/ }).click();
  await expect(page.getByText('Listo').first()).toBeVisible({
    timeout: 90_000,
  });

  // ── 7. Revisar (reglas automáticas + IA) y aplicar ──────────────────────
  await page.getByRole('button', { name: /^revisar$/i }).click();
  const review = page.getByRole('region', { name: /revisión de la pieza/i });
  const apply = review.getByRole('button', { name: /^aplicar$/i }).first();
  await expect(apply).toBeVisible({ timeout: 120_000 });
  await apply.click();
  await expect(review.getByText('Aplicada').first()).toBeVisible();

  // ── 8. El dashboard refleja la actividad ────────────────────────────────
  await page.goto('/dashboard');
  const pieces = page.getByRole('region', { name: /piezas recientes/i });
  await expect(pieces.getByText('Concierto E2E')).toBeVisible();
  await expect(
    page
      .getByRole('region', { name: /exportaciones recientes/i })
      .getByText('Listo'),
  ).toBeVisible();
});
