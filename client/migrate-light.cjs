const fs = require('fs');
const path = require('path');

// Regex avec lookbehind négatif : ne matche que les classes NUES
// (pas précédées de "dark:" ni de "-" qui indiquerait juju-light-*)
const replacements = [
  [/(?<![:-])bg-juju-bleu-clair\b/g, 'bg-juju-light-card dark:bg-juju-bleu-clair'],
  [/(?<![:-])bg-juju-bleu\b(?!-clair)/g, 'bg-juju-light-card dark:bg-juju-bleu'],
  [/(?<![:-])bg-juju-noir\b/g, 'bg-juju-light-bg dark:bg-juju-noir'],
  [/(?<![:-])border-juju-bordure\b/g, 'border-juju-light-bordure dark:border-juju-bordure'],
  [/(?<![:-])text-juju-texte-mute\b/g, 'text-juju-light-texte-mute dark:text-juju-texte-mute'],
  [/(?<![:-])text-juju-texte\b(?!-mute)/g, 'text-juju-light-texte dark:text-juju-texte'],
];

function migrateFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');
  let totalChanges = 0;
  for (const [regex, repl] of replacements) {
    const matches = content.match(regex);
    if (matches) {
      content = content.replace(regex, repl);
      totalChanges += matches.length;
    }
  }
  if (totalChanges > 0) {
    fs.writeFileSync(filepath, content);
    console.log(`OK   ${totalChanges.toString().padStart(3)}  ${filepath}`);
  } else {
    console.log(`-      0  ${filepath}`);
  }
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.endsWith('.backup')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.jsx') || entry.name.endsWith('.js')) migrateFile(full);
  }
}

walk(path.join(__dirname, 'src'));
console.log('\nMigration terminée.');
