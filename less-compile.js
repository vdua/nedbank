import less from 'less';
import fs from 'fs';
import path from 'path';
import { readdir } from 'fs/promises';
import { fileURLToPath } from 'url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

const compileAndSave = async (lessFile) => {
  const dest = lessFile.replace(path.extname(lessFile), '.css');
  const data = fs.readFileSync(
    lessFile,
    { encoding: 'utf8', flag: 'r' },
  );
  less.render(data).then((output) => {
    fs.writeFileSync(dest, output.css);
    // eslint-disable-next-line no-console
    console.log(`Compiled ${lessFile} to ${dest}`);
  });
};

const processFiles = async (parent) => {
  const files = await readdir(parent, { withFileTypes: true });
  files.forEach(async (file) => {
    if (file.isDirectory()) {
      await processFiles(path.join(parent, file.name));
    }
    if (path.extname(file.name) === '.less') {
      await compileAndSave(path.join(parent, file.name));
    }
  });
};

['styles', 'blocks'].forEach(async (folder) => {
  try {
    await processFiles(path.join(dirname, folder));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
});

if(process.argv.length > 2 && process.argv[2] == 'watch') {
  fs.watch('.', { recursive: true }, (eventType, fileName) => {
    if (path.extname(fileName) === '.less' && eventType === 'change') {
      compileAndSave(path.join(dirname, fileName));
    }
  });
}
