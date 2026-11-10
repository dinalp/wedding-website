import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import photos from '../src/lib/stay-photos.json' with { type: 'json' };
import { stayImage } from '../src/lib/stay-images.ts';

test('every curated property has an intact, verified local WebP', async () => {
  assert.ok(photos.length > 0);
  assert.equal(new Set(photos.map(p => p.property)).size, photos.length);
  await Promise.all(photos.map(async photo => {
    assert.match(photo.src, /^\/photos\/stays\/[a-z0-9-]+\.webp$/);
    const bytes = await readFile(new URL('../public' + photo.src, import.meta.url));
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', photo.property);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), photo.sha256, photo.property);
    assert.ok(photo.width >= 600 && photo.height >= 400, photo.property);
    assert.equal(stayImage(photo.property, ''), photo.src);
    assert.equal(stayImage(photo.property, 'https://expired.example/photo.jpg'), photo.src);
  }));
});

test('cosmetic property name changes still use the saved photo', () => {
  assert.equal(stayImage('  PINKCOCO ULUWATU ', ''), '/photos/stays/pinkcoco-uluwatu.webp');
  assert.equal(stayImage('Nisí Villas Bingin', ''), '/photos/stays/nisi-villas.webp');
  assert.equal(stayImage('Renaissance Bali Uluwatu Resort & Spa', ''), '/photos/stays/renaissance-uluwatu.webp');
});

test('new property image URLs retain required query parameters', () => {
  const url = 'https://cf.bstatic.com/photo.jpg?k=required-signature&o=&hp=1';
  assert.equal(stayImage('New property', url), url);
  assert.equal(stayImage('New property', ''), '');
  assert.equal(stayImage('New property', 'not a URL'), '');
  assert.equal(stayImage('New property', 'javascript:alert(1)'), '');
});
