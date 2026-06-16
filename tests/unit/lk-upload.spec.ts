import { describe, expect, it } from 'vitest';
import {
  createH5UploadFiles,
  createMpImageUploadFiles,
  createMpVideoUploadFile,
  getUploadFileName,
  isImageUrl,
} from '../../src/uni_modules/lucky-ui/components/lk-upload/upload.utils';

function uidFactory() {
  let index = 0;
  return () => `uid-${++index}`;
}

function fakeFile(name: string, size: number, type: string): File {
  return { name, size, type } as File;
}

describe('lk-upload file normalization', () => {
  it('keeps the original H5 file name and raw File object', () => {
    const file = fakeFile('年度报表.final.pdf', 1280, 'application/pdf');
    const [item] = createH5UploadFiles([file], 1, uidFactory(), (raw) => `blob:${raw.name}`);

    expect(item).toMatchObject({
      uid: 'uid-1',
      name: '年度报表.final.pdf',
      url: 'blob:年度报表.final.pdf',
      size: 1280,
      type: 'application/pdf',
      status: 'ready',
    });
    expect(item.file).toBe(file);
  });

  it('preserves names and order for multiple H5 files', () => {
    const files = [
      fakeFile('avatar.png', 100, 'image/png'),
      fakeFile('contract.v2.docx', 200, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
      fakeFile('archive.zip', 300, 'application/zip'),
    ];

    const items = createH5UploadFiles(files, 3, uidFactory(), (raw) => `blob:${raw.name}`);

    expect(items.map((item) => item.name)).toEqual(['avatar.png', 'contract.v2.docx', 'archive.zip']);
    expect(items.map((item) => item.uid)).toEqual(['uid-1', 'uid-2', 'uid-3']);
    expect(items.map((item) => item.file)).toEqual(files);
  });

  it('clips H5 files by remaining count before they enter the component list', () => {
    const items = createH5UploadFiles(
      [
        fakeFile('one.png', 100, 'image/png'),
        fakeFile('two.png', 100, 'image/png'),
        fakeFile('three.png', 100, 'image/png'),
      ],
      2,
      uidFactory(),
      (raw) => `blob:${raw.name}`,
    );

    expect(items).toHaveLength(2);
    expect(items.map((item) => item.name)).toEqual(['one.png', 'two.png']);
  });

  it('uses the mini-program tempFile name when the platform provides one', () => {
    const items = createMpImageUploadFiles(
      ['wxfile://tmp_abc'],
      [{ name: '原始相册名.jpg', size: 2048, type: 'image/jpeg' }],
      uidFactory(),
    );

    expect(items[0]).toMatchObject({
      name: '原始相册名.jpg',
      url: 'wxfile://tmp_abc',
      size: 2048,
      type: 'image/jpeg',
      status: 'ready',
    });
  });

  it('falls back to the mini-program temp path basename for multiple images', () => {
    const items = createMpImageUploadFiles(
      ['/tmp/camera/first.jpg?width=800', '/tmp/camera/second.png#hash'],
      [{ size: 10 }, { size: 20 }],
      uidFactory(),
    );

    expect(items.map((item) => item.name)).toEqual(['first.jpg', 'second.png']);
    expect(items.map((item) => item.size)).toEqual([10, 20]);
  });

  it('normalizes mini-program video names consistently', () => {
    expect(createMpVideoUploadFile({ tempFilePath: '/tmp/movie.mp4', size: 4096 }, uidFactory()))
      .toMatchObject({
        name: 'movie.mp4',
        url: '/tmp/movie.mp4',
        size: 4096,
        type: 'video/*',
      });

    expect(createMpVideoUploadFile({ tempFilePath: '/tmp/raw', name: '原片.mov' }, uidFactory()).name)
      .toBe('原片.mov');
  });

  it('detects image preview urls across local, blob, data and remote paths', () => {
    expect(isImageUrl('https://cdn.example.com/a.webp?x=1')).toBe(true);
    expect(isImageUrl('blob:local-preview')).toBe(true);
    expect(isImageUrl('data:image/png;base64,abc')).toBe(true);
    expect(isImageUrl('wxfile://tmp-file')).toBe(true);
    expect(isImageUrl('https://cdn.example.com/a.pdf')).toBe(false);
    expect(getUploadFileName('', 'fallback')).toBe('fallback');
  });
});
